// client/src/pages/expenses/SalaryExpense.jsx

import React, { useEffect, useState, useMemo } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";

// ✅ logo fallback (same idea like PurchaseInvoices)
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

const EMPTY_FORM = {
  staff: "",
  salary_month: "",
  base_amount: "",
  allowance: "",
  bonus: "",
  note: "",
};

const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};

export default function SalaryExpense() {
  const [staffs, setStaffs] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters for payroll sheet
  const [filterStaff, setFilterStaff] = useState(""); // staff id
  const [filterMonth, setFilterMonth] = useState(""); // "YYYY-MM"

  // ✅ business category (reactive)
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // ✅ banner info (category-wise)
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  // ✅ Print header tag (like your invoice top pill)
  const DOC_TOP_TAG = ""; // adjust if needed

  // live total on the form
  const formTotalSalary = useMemo(
    () =>
      toNumber(form.base_amount) +
      toNumber(form.allowance) +
      toNumber(form.bonus),
    [form.base_amount, form.allowance, form.bonus]
  );

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

  // ------------ API ------------

  const loadStaffs = async () => {
    try {
      const res = await AxiosInstance.get("staffs/"); // existing endpoint
      setStaffs(res.data || []);
    } catch (e) {
      console.error("Failed to load staffs", e);
    }
  };

  const loadSalaryExpenses = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (searchValue.trim()) params.search = searchValue.trim();

      const res = await AxiosInstance.get("salary-expenses/", { params });
      setItems(res.data || []);
    } catch (e) {
      console.error("Failed to load salary expenses", e);
      setError("Failed to load salary expenses");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadStaffs();
    loadSalaryExpenses();
  }, []);

  // ✅ refetch banner when business changes
  useEffect(() => {
    const id = selectedCategory?.id || null;
    fetchBanner(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  // ------------ Handlers ------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    loadSalaryExpenses(value);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.staff || !form.salary_month || !form.base_amount) {
      alert("Employee, month and basic amount are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      staff: form.staff,
      salary_month: form.salary_month, // "YYYY-MM"
      base_amount: form.base_amount, // basic
      allowance: form.allowance || 0,
      bonus: form.bonus || 0,
      note: form.note,
    };

    try {
      if (editingId) {
        await AxiosInstance.patch(`salary-expenses/${editingId}/`, payload);
      } else {
        await AxiosInstance.post("salary-expenses/", payload);
      }
      resetForm();
      loadSalaryExpenses(search);
    } catch (e) {
      console.error("Save failed", e);
      setError("Failed to save salary expense");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      staff: item.staff || "",
      salary_month: item.salary_month || "",
      base_amount: item.base_amount || "",
      allowance: item.allowance || "",
      bonus: item.bonus || "",
      note: item.note || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this salary record?")) return;
    try {
      await AxiosInstance.delete(`salary-expenses/${id}/`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
      setError("Failed to delete salary expense");
    }
  };

  // ------------ Payroll sheet filtering ------------

  const filteredItems = useMemo(
    () =>
      items.filter((r) => {
        if (filterStaff && String(r.staff) !== String(filterStaff)) {
          return false;
        }
        if (filterMonth && r.salary_month !== filterMonth) {
          return false;
        }
        return true;
      }),
    [items, filterStaff, filterMonth]
  );

  // ------------ Payroll summary (based on filtered items) ------------

  const totalBasic = useMemo(
    () => filteredItems.reduce((sum, r) => sum + toNumber(r.base_amount), 0),
    [filteredItems]
  );
  const totalAllowance = useMemo(
    () => filteredItems.reduce((sum, r) => sum + toNumber(r.allowance), 0),
    [filteredItems]
  );
  const totalBonus = useMemo(
    () => filteredItems.reduce((sum, r) => sum + toNumber(r.bonus), 0),
    [filteredItems]
  );
  const totalSalary = useMemo(
    () =>
      filteredItems.reduce(
        (sum, r) =>
          sum +
          (r.total_salary != null
            ? toNumber(r.total_salary)
            : toNumber(r.base_amount) +
              toNumber(r.allowance) +
              toNumber(r.bonus)),
        0
      ),
    [filteredItems]
  );

  const formatMoney = (v) =>
    `৳ ${toNumber(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ------------ Export / Print ------------

  const escapeCsv = (value) => {
    if (value == null) return "";
    const stringValue = String(value);
    if (
      stringValue.includes('"') ||
      stringValue.includes(",") ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCsv = () => {
    const headers = ["Employee", "Month", "Basic", "Allowance", "Bonus", "Total Salary", "Note"];

    const rows = filteredItems.map((r) => {
      const rowTotal =
        r.total_salary != null
          ? toNumber(r.total_salary)
          : toNumber(r.base_amount) +
            toNumber(r.allowance) +
            toNumber(r.bonus);

      return [
        r.staff_name || `Staff #${r.staff}`,
        r.salary_month,
        toNumber(r.base_amount).toFixed(2),
        toNumber(r.allowance).toFixed(2),
        toNumber(r.bonus).toFixed(2),
        rowTotal.toFixed(2),
        r.note || "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const monthPart = filterMonth || "all-months";
    link.href = url;
    link.setAttribute("download", `payroll_${monthPart}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ✅ PRINT / PDF (MATCH PURCHASE INVOICE STYLE)
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

    const rowsHtml =
      filteredItems.length === 0
        ? `<tr><td colspan="7" class="text-center">No data found</td></tr>`
        : filteredItems
            .map((r, idx) => {
              const rowTotal =
                r.total_salary != null
                  ? toNumber(r.total_salary)
                  : toNumber(r.base_amount) +
                    toNumber(r.allowance) +
                    toNumber(r.bonus);

              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>${r.staff_name || `Staff #${r.staff}`}</td>
                  <td class="text-center">${r.salary_month || "-"}</td>
                  <td class="text-right">${toNumber(r.base_amount).toFixed(2)}</td>
                  <td class="text-right">${toNumber(r.allowance).toFixed(2)}</td>
                  <td class="text-right">${toNumber(r.bonus).toFixed(2)}</td>
                  <td class="text-right"><b>${rowTotal.toFixed(2)}</b></td>
                </tr>
              `;
            })
            .join("");

    const html = `
      <html>
      <head>
        <title>Payroll Sheet</title>
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

          h2{ text-align:center; margin: 14px 0; }

          table{ width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td{ border: 1px solid #000; padding: 4px; font-size: 11px; }
          th{ text-align: center; background: #f3f4f6; }

          .text-center{ text-align:center; }
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
          <div class="topline-center">Payroll Sheet</div>
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

        <h2>Payroll Sheet</h2>

        <table>
          <thead>
            <tr>
              <th style="width:40px;">SL</th>
              <th>Employee</th>
              <th style="width:95px;">Month</th>
              <th style="width:85px;">Basic</th>
              <th style="width:90px;">Allowance</th>
              <th style="width:70px;">Bonus</th>
              <th style="width:95px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Total</td>
              <td class="text-right">৳ ${toNumber(totalBasic).toFixed(2)}</td>
              <td class="text-right">৳ ${toNumber(totalAllowance).toFixed(2)}</td>
              <td class="text-right">৳ ${toNumber(totalBonus).toFixed(2)}</td>
              <td class="text-right">৳ ${toNumber(totalSalary).toFixed(2)}</td>
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

  // ------------ UI ------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Salary Expenses / Payroll
          </h2>
          <p className="text-xs text-slate-500">
            Record monthly payroll with basic, allowance and bonus.
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

        <div className="flex gap-3 items-center">
          <div className="relative w-64">
            <FaSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by staff or month..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-5 gap-3 bg-white border border-slate-200 rounded-xl p-4 items-end shadow-sm"
      >
        {/* Staff */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Employee *
          </label>
          <select
            name="staff"
            value={form.staff}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring focus:ring-blue-500/30"
          >
            <option value="">Select employee</option>
            {staffs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.staff_name || `Staff #${s.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Salary Month *
          </label>
          <input
            type="month"
            name="salary_month"
            value={form.salary_month}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-white"
          />
        </div>

        {/* Basic Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Basic Amount (৳) *
          </label>
          <input
            type="number"
            name="base_amount"
            step="0.01"
            value={form.base_amount}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-white"
          />
        </div>

        {/* Allowance */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Allowance (৳)
          </label>
          <input
            type="number"
            name="allowance"
            step="0.01"
            value={form.allowance}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-white"
          />
        </div>

        {/* Bonus */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Bonus (৳)
          </label>
          <input
            type="number"
            name="bonus"
            step="0.01"
            value={form.bonus}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-white"
          />
        </div>

        {/* Total (read-only) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Total Salary (৳)
          </label>
          <div className="w-full px-3 py-2 rounded-lg border border-slate-100 text-sm bg-slate-50 flex items-center justify-between">
            <span className="text-slate-500 text-xs">Preview</span>
            <span className="font-semibold">{formatMoney(formTotalSalary)}</span>
          </div>
        </div>

        {/* Note */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Note
          </label>
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Bonus reason, overtime, deductions, etc."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30 bg-white"
          />
        </div>

        {/* Buttons */}
        <div className="lg:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-2 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-full bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update Payroll" : "Save Payroll"}
          </button>
        </div>
      </form>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <SummaryCard label="Total Basic" value={formatMoney(totalBasic)} />
        <SummaryCard label="Total Allowance" value={formatMoney(totalAllowance)} />
        <SummaryCard label="Total Bonus" value={formatMoney(totalBonus)} />
        <SummaryCard label="Total Salary" value={formatMoney(totalSalary)} highlight />
      </div>

      {/* Payroll Sheet */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Payroll Sheet</h3>
            <span className="text-[11px] text-slate-500">
              {filteredItems.length} record{filteredItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Staff filter */}
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="px-2 py-1 text-xs rounded-full border border-slate-200 bg-white"
            >
              <option value="">All employees</option>
              {staffs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.staff_name || `Staff #${s.id}`}
                </option>
              ))}
            </select>

            {/* Month filter */}
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-2 py-1 text-xs rounded-full border border-slate-200 bg-white"
            />

            {/* Clear filters */}
            <button
              type="button"
              onClick={() => {
                setFilterStaff("");
                setFilterMonth("");
              }}
              className="px-2 py-1 text-xs rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Clear filter
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1 text-xs rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              Export Excel (CSV)
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 text-xs rounded-full border border-indigo-600 text-indigo-700 hover:bg-indigo-50"
            >
              Print / PDF
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-xs text-slate-500">No salary expenses recorded yet.</p>
        ) : (
          <div id="payroll-sheet-print-area" className="overflow-x-auto">
            <table className="min-w-full text-xs border border-slate-100">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b">
                  <th className="py-2 px-2 text-left">Employee</th>
                  <th className="py-2 px-2 text-left">Month</th>
                  <th className="py-2 px-2 text-right">Basic</th>
                  <th className="py-2 px-2 text-right">Allowance</th>
                  <th className="py-2 px-2 text-right">Bonus</th>
                  <th className="py-2 px-2 text-right">Total Salary</th>
                  <th className="py-2 px-2 text-left">Note</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((r, idx) => {
                  const rowTotal =
                    r.total_salary != null
                      ? toNumber(r.total_salary)
                      : toNumber(r.base_amount) +
                        toNumber(r.allowance) +
                        toNumber(r.bonus);

                  return (
                    <tr
                      key={r.id}
                      className={
                        "border-t " +
                        (idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")
                      }
                    >
                      <td className="py-2 px-2">
                        {r.staff_name || `Staff #${r.staff}`}
                      </td>
                      <td className="py-2 px-2">{r.salary_month}</td>
                      <td className="py-2 px-2 text-right">
                        {formatMoney(r.base_amount)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {formatMoney(r.allowance)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {formatMoney(r.bonus)}
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">
                        {formatMoney(rowTotal)}
                      </td>
                      <td className="py-2 px-2 max-w-xs truncate">
                        {r.note || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2 px-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(r)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50"
                        >
                          <FaEdit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <FaTrash className="w-3 h-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="border-t bg-slate-900 text-white">
                  <td className="py-2 px-2 font-semibold" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalBasic)}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalAllowance)}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalBonus)}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalSalary)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
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
