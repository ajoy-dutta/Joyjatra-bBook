// client/src/pages/expenses/ExpenseReport.jsx

import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

// ✅ logo fallback (same idea like PurchaseInvoices)
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

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

  // ✅ business category (reactive)
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // ✅ banner info (category-wise)
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  // ✅ Print header tag (like your invoice top pill)
  const DOC_TOP_TAG = ""; // adjust if needed

  // ✅ Listen to business switch (same tab + other tabs)
  useEffect(() => {
    const readBusiness = () => {
      setSelectedCategory(
        JSON.parse(localStorage.getItem("business_category")) || null
      );
    };

    const onStorage = (e) => {
      if (e.key === "business_category") readBusiness();
    };

    const onBusinessChanged = () => readBusiness();

    window.addEventListener("storage", onStorage);
    window.addEventListener("business_category_changed", onBusinessChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("business_category_changed", onBusinessChanged);
    };
  }, []);

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

      const normalize = (raw) => (Array.isArray(raw) ? raw : raw?.results || []);

      setGeneralExpenses(normalize(generalRes.data));
      setSalaryExpenses(normalize(salaryRes.data));
      setPurchases(normalize(purchaseRes.data));
    } catch (e) {
      console.error("Failed to load expense report data", e);
      setError(e.response?.data?.detail || "Failed to load expense report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Fetch banner category-wise (same idea as Expense.jsx)
  const fetchBanner = async (categoryId) => {
    if (!categoryId) {
      setBanner(null);
      return;
    }
    try {
      setBannerLoading(true);
      const res = await AxiosInstance.get(`/business-categories/${categoryId}/`);
      setBanner(res.data);
    } catch (e) {
      console.error("Failed to fetch banner:", e);
      setBanner(null);
    } finally {
      setBannerLoading(false);
    }
  };

  // ✅ refetch banner when business changes
  useEffect(() => {
    const id = selectedCategory?.id || null;
    fetchBanner(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

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
    () => generalExpenses.filter((e) => inRange(e.expense_date || e.date || e.created_at)),
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
  const { totalGeneral, totalSalary, totalPurchase, grandTotal } = useMemo(() => {
    const totalGeneral = filteredGeneral.reduce((sum, e) => sum + safeNumber(e.amount), 0);

    const totalSalary = filteredSalary.reduce((sum, s) => {
      // support both old and new salary structure
      const base = s.base_amount != null ? s.base_amount : s.amount != null ? s.amount : 0;
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

  // ---------- Print (MATCH PURCHASE INVOICE STYLE) ----------
  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const header = {
      topTag: DOC_TOP_TAG,
      title: banner?.banner_title || selectedCategory?.name || "Business Name",
      address1: banner?.banner_address1 || "",
      address2: banner?.banner_address2 || "",
      mobile: banner?.banner_phone || "",
    };

    const periodText = `Period: ${fromDate || "Beginning"} to ${toDate || "Today"}`;

    const rowsHtml = `
      <tr>
        <td>General Expense</td>
        <td class="text-right">${formatMoney(totalGeneral)}</td>
        <td class="text-right">${filteredGeneral.length}</td>
      </tr>
      <tr>
        <td>Salary Expense</td>
        <td class="text-right">${formatMoney(totalSalary)}</td>
        <td class="text-right">${filteredSalary.length}</td>
      </tr>
      <tr>
        <td>Purchase Expense</td>
        <td class="text-right">${formatMoney(totalPurchase)}</td>
        <td class="text-right">${filteredPurchases.length}</td>
      </tr>
    `;

    const html = `
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #000; }

          .topline { display:flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
          .topline-center { flex: 1; text-align: center; font-weight: 700; }
          .topline-left { width: 180px; }
          .topline-right { width: 180px; }

          .header-wrap{
            display: grid;
            grid-template-columns: 120px 1fr 120px;
            align-items: center;
            column-gap: 10px;
            margin-bottom: 10px;
          }
          .logo-box{ display:flex; justify-content:flex-start; align-items:center; }
          .logo-img{ width: 110px; height: auto; object-fit: contain; }

          .header-text{ text-align:center; }
          .top-tag{
            display:inline-block;
            font-weight:700;
            font-size: 13px;
            padding: 2px 10px;
            border: 1px solid #000;
            border-radius: 14px;
            margin-bottom: 6px;
          }
          .company-name{ font-size: 26px; font-weight: 800; }
          .contact-info{ font-size: 12px; margin-top: 2px; line-height: 1.35; }

          .subtitle { font-size: 11px; margin: 8px 0 2px; color: #111; text-align: center; }

          h2{ text-align:center; margin: 12px 0; }

          table{ width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td{ border: 1px solid #000; padding: 6px 8px; font-size: 11px; }
          th{ text-align: left; background: #f3f4f6; }
          .text-right{ text-align:right; }

          tfoot td{
            font-weight: 700;
            background: #111827;
            color: #fff;
          }

          .footer-content{
            display:flex;
            justify-content: space-between;
            font-size: 11px;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 14px;
          }
        </style>
      </head>
      <body>
        <div class="topline">
          <div class="topline-left">${printDate}</div>
          <div class="topline-center">Expense Report</div>
          <div class="topline-right"></div>
        </div>

        <div class="header-wrap">
          <div class="logo-box">
            <img class="logo-img" src="${joyjatraLogo}" alt="Logo" />
          </div>

          <div class="header-text">
            ${header.topTag ? `<div class="top-tag">${header.topTag}</div>` : ""}
            <div class="company-name">${header.title || ""}</div>
            ${header.address1 ? `<div class="contact-info">${header.address1}</div>` : ""}
            ${header.address2 ? `<div class="contact-info">${header.address2}</div>` : ""}
            ${header.mobile ? `<div class="contact-info">${header.mobile}</div>` : ""}
          </div>

          <div></div>
        </div>

        <div class="subtitle">${periodText}</div>
        <h2>Expense Report</h2>

        <table>
          <thead>
            <tr>
              <th>Expense Type</th>
              <th class="text-right" style="width:160px;">Total Amount</th>
              <th class="text-right" style="width:130px;">No. of Records</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td>Total Expense</td>
              <td class="text-right">${formatMoney(grandTotal)}</td>
              <td class="text-right">${filteredGeneral.length + filteredSalary.length + filteredPurchases.length}</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer-content">
          <div>
            <div>*Keep this report for future reference.</div>
            <div>*Save Trees, Save Generations.</div>
          </div>
          <div>Print: Admin, ${printDate}</div>
        </div>

        <script>
          setTimeout(() => { window.print(); }, 200);
        </script>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return alert("Popup blocked. Please allow popups to print.");
    win.document.write(html);
    win.document.close();
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Expense Report</h2>
          <p className="text-xs text-slate-500">
            Combined view of General, Salary and Purchase expenses.
          </p>

          {/* ✅ optional banner loading indicator */}
          <div className="text-xs text-slate-500 mt-1">
            Business:{" "}
            <span className="font-semibold text-slate-700">
              {selectedCategory?.name || "N/A"}
            </span>
            {bannerLoading ? (
              <span className="ml-2 text-slate-400">(Loading banner...)</span>
            ) : null}
          </div>
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
        {loading && <span className="text-xs text-slate-500">Loading...</span>}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <SummaryCard label="General Expense" value={formatMoney(totalGeneral)} />
        <SummaryCard label="Salary Expense" value={formatMoney(totalSalary)} />
        <SummaryCard label="Purchase Expense" value={formatMoney(totalPurchase)} />
        <SummaryCard label="Total Expense" value={formatMoney(grandTotal)} highlight />
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
              <td className="py-2 px-2 text-right">{formatMoney(totalGeneral)}</td>
              <td className="py-2 px-2 text-right">{filteredGeneral.length}</td>
            </tr>
            <tr className="border-t bg-slate-50/40">
              <td className="py-2 px-2">Salary Expense</td>
              <td className="py-2 px-2 text-right">{formatMoney(totalSalary)}</td>
              <td className="py-2 px-2 text-right">{filteredSalary.length}</td>
            </tr>
            <tr className="border-t">
              <td className="py-2 px-2">Purchase Expense</td>
              <td className="py-2 px-2 text-right">{formatMoney(totalPurchase)}</td>
              <td className="py-2 px-2 text-right">{filteredPurchases.length}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t bg-slate-900 text-white">
              <td className="py-2 px-2 font-semibold">Total</td>
              <td className="py-2 px-2 text-right font-semibold">{formatMoney(grandTotal)}</td>
              <td className="py-2 px-2 text-right font-semibold">
                {filteredGeneral.length + filteredSalary.length + filteredPurchases.length}
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
