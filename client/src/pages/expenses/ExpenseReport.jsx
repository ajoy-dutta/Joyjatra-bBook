// client/src/pages/expenses/ExpenseReport.jsx

import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

const safeNumber = (value) => {
  const num = parseFloat(value || 0);
  return Number.isNaN(num) ? 0 : num;
};

const formatMoney = (value) =>
  `৳ ${safeNumber(value).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ExpenseReport() {
  const [generalExpenses, setGeneralExpenses] = useState([]);
  const [salaryExpenses, setSalaryExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------- Load data ----------
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [generalRes, salaryRes, purchaseRes] = await Promise.all([
        AxiosInstance.get("expenses/"),
        AxiosInstance.get("salary-expenses/"),
        AxiosInstance.get("/purchases/"),
      ]);

      const normalize = (raw) =>
        Array.isArray(raw) ? raw : raw?.results || [];

      setGeneralExpenses(normalize(generalRes.data));
      setSalaryExpenses(normalize(salaryRes.data));
      setPurchases(normalize(purchaseRes.data));
    } catch (e) {
      console.error("Failed to load expense report data", e);
      setError(
        e.response?.data?.detail || "Failed to load expense report data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------- Filter helpers ----------
  const inRange = (dateStr) => {
    if (!fromDate && !toDate) return true;
    if (!dateStr) return false;

    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return true;

    if (fromDate) {
      const from = new Date(fromDate);
      if (d < from) return false;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }

    return true;
  };

  // General: try expense_date, fallback to created_at
  const filteredGeneral = useMemo(
    () =>
      generalExpenses.filter((e) =>
        inRange(e.expense_date || e.date || e.created_at)
      ),
    [generalExpenses, fromDate, toDate]
  );

  // Salary: salary_month = "YYYY-MM"
  const filteredSalary = useMemo(
    () =>
      salaryExpenses.filter((s) => {
        if (!fromDate && !toDate) return true;
        if (!s.salary_month) return true;
        const [y, m] = s.salary_month.split("-");
        const dateStr = `${y}-${m}-01`;
        return inRange(dateStr);
      }),
    [salaryExpenses, fromDate, toDate]
  );

  // Purchase: use purchase_date
  const filteredPurchases = useMemo(
    () => purchases.filter((p) => inRange(p.purchase_date)),
    [purchases, fromDate, toDate]
  );

  // ---------- Totals ----------
  const {
    totalGeneral,
    totalSalary,
    totalPurchase,
    grandTotal,
  } = useMemo(() => {
    const totalGeneral = filteredGeneral.reduce(
      (sum, e) => sum + safeNumber(e.amount),
      0
    );

    const totalSalary = filteredSalary.reduce((sum, s) => {
      // support both old and new salary structure
      const base =
        s.base_amount != null ? s.base_amount : s.amount != null ? s.amount : 0;
      const allowance = s.allowance != null ? s.allowance : 0;
      const bonus = s.bonus != null ? s.bonus : 0;
      const rowTotal =
        s.total_salary != null
          ? s.total_salary
          : safeNumber(base) + safeNumber(allowance) + safeNumber(bonus);

      return sum + safeNumber(rowTotal);
    }, 0);

    const totalPurchase = filteredPurchases.reduce(
      (sum, p) => sum + safeNumber(p.total_payable_amount),
      0
    );

    return {
      totalGeneral,
      totalSalary,
      totalPurchase,
      grandTotal: totalGeneral + totalSalary + totalPurchase,
    };
  }, [filteredGeneral, filteredSalary, filteredPurchases]);

  // ---------- Print ----------
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin: 12px 0 6px; }
            .subtitle { font-size: 12px; color: #555; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 6px 8px; }
            th { background: #f3f4f6; text-align: left; }
            tfoot td { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <div class="subtitle">
            Period: ${fromDate || "Beginning"} to ${toDate || "Today"}
          </div>

          <table>
            <thead>
              <tr>
                <th>Expense Type</th>
                <th style="text-align:right;">Total Amount</th>
                <th style="text-align:right;">No. of Records</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>General Expense</td>
                <td style="text-align:right;">${formatMoney(totalGeneral)}</td>
                <td style="text-align:right;">${filteredGeneral.length}</td>
              </tr>
              <tr>
                <td>Salary Expense</td>
                <td style="text-align:right;">${formatMoney(totalSalary)}</td>
                <td style="text-align:right;">${filteredSalary.length}</td>
              </tr>
              <tr>
                <td>Purchase Expense</td>
                <td style="text-align:right;">${formatMoney(
                  totalPurchase
                )}</td>
                <td style="text-align:right;">${filteredPurchases.length}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total Expense</td>
                <td style="text-align:right;">${formatMoney(grandTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Expense Report
          </h2>
          <p className="text-xs text-slate-500">
            Combined view of General, Salary and Purchase expenses.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
        >
          Print Expense Report
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-end gap-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={loadData}
          className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
        {loading && (
          <span className="text-xs text-slate-500">Loading...</span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <SummaryCard
          label="General Expense"
          value={formatMoney(totalGeneral)}
        />
        <SummaryCard
          label="Salary Expense"
          value={formatMoney(totalSalary)}
        />
        <SummaryCard
          label="Purchase Expense"
          value={formatMoney(totalPurchase)}
        />
        <SummaryCard
          label="Total Expense"
          value={formatMoney(grandTotal)}
          highlight
        />
      </div>

      {/* Summary table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Expense Breakdown
        </h3>
        <table className="w-full text-xs border border-slate-100">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b">
              <th className="py-2 px-2 text-left">Type</th>
              <th className="py-2 px-2 text-right">Total Amount</th>
              <th className="py-2 px-2 text-right">Records</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2 px-2">General Expense</td>
              <td className="py-2 px-2 text-right">
                {formatMoney(totalGeneral)}
              </td>
              <td className="py-2 px-2 text-right">
                {filteredGeneral.length}
              </td>
            </tr>
            <tr className="border-t bg-slate-50/40">
              <td className="py-2 px-2">Salary Expense</td>
              <td className="py-2 px-2 text-right">
                {formatMoney(totalSalary)}
              </td>
              <td className="py-2 px-2 text-right">
                {filteredSalary.length}
              </td>
            </tr>
            <tr className="border-t">
              <td className="py-2 px-2">Purchase Expense</td>
              <td className="py-2 px-2 text-right">
                {formatMoney(totalPurchase)}
              </td>
              <td className="py-2 px-2 text-right">
                {filteredPurchases.length}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t bg-slate-900 text-white">
              <td className="py-2 px-2 font-semibold">Total</td>
              <td className="py-2 px-2 text-right font-semibold">
                {formatMoney(grandTotal)}
              </td>
              <td className="py-2 px-2 text-right font-semibold">
                {filteredGeneral.length +
                  filteredSalary.length +
                  filteredPurchases.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight = false }) {
  return (
    <div
      className={
        "rounded-xl px-4 py-3 border text-xs flex flex-col gap-1 " +
        (highlight
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-800 border-slate-200")
      }
    >
      <span
        className={
          "uppercase tracking-wide " +
          (highlight ? "text-slate-300" : "text-slate-500")
        }
      >
        {label}
      </span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  );
}
