// client/src/pages/expenses/Expense.jsx

import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

// ✅ logo fallback (same idea like PurchaseInvoices)
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

const EMPTY_FORM = {
  cost_category: "",
  amount: "",
  expense_date: "",
  payment_mode: "",
  bank_account: "",
  note: "",
  recorded_by: "",
};

export default function ExpensePage() {
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ business category (reactive)
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // ✅ banner info
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // ✅ Print header tag (like your invoice top pill)
  const DOC_TOP_TAG = ""; // or "ক্যাশ মেমো"

  const safeNumber = (v) => {
    const n = parseFloat(v ?? 0);
    return Number.isNaN(n) ? 0 : n;
  };

  // ✅ Listen to business switch (same tab + other tabs)
  useEffect(() => {
    const readBusiness = () => {
      setSelectedCategory(JSON.parse(localStorage.getItem("business_category")) || null);
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

  // ---------------- LOAD MASTER DATA ----------------

  const loadCategories = async () => {
    try {
      const res = await AxiosInstance.get("cost-categories/");
      setCategories(res.data || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const loadPaymentModes = async () => {
    try {
      const res = await AxiosInstance.get("payment-mode/");
      setPaymentModes(res.data || []);
    } catch (e) {
      console.error("Failed to load payment modes", e);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const res = await AxiosInstance.get("bank-accounts/");
      setBankAccounts(res.data || []);
    } catch (e) {
      console.error("Failed to load bank accounts", e);
    }
  };

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

  const loadExpenses = async (categoryId) => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("expenses/", {
        params: { business_category: categoryId || null },
      });
      const raw = res.data;
      const rows = Array.isArray(raw) ? raw : raw?.results || [];
      setExpenses(rows);
    } catch (e) {
      console.error("Failed to load expenses", e);
    } finally {
      setLoading(false);
    }
  };

  // initial master load once
  useEffect(() => {
    loadCategories();
    loadPaymentModes();
    loadBankAccounts();
  }, []);

  // ✅ refetch banner + expenses when business changes
  useEffect(() => {
    const id = selectedCategory?.id || null;
    fetchBanner(id);
    loadExpenses(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  // ---------------- FORM HANDLERS ----------------

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(EMPTY_FORM);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.cost_category || !form.amount || !form.expense_date) {
      alert("Category, Amount and Date are required.");
      return;
    }
    if (!form.recorded_by) {
      alert("Recorded By is required.");
      return;
    }

    const payload = {
      cost_category: form.cost_category,
      amount: form.amount,
      expense_date: form.expense_date,
      note: form.note,
      recorded_by: form.recorded_by,
      payment_mode: form.payment_mode || null,
      bank_account: form.bank_account || null,
      business_category: selectedCategory?.id || null, // ✅ if your backend expects it
    };

    setSaving(true);
    try {
      await AxiosInstance.post("expenses/", payload);
      alert("Expense saved!");
      resetForm();
      loadExpenses(selectedCategory?.id || null);
    } catch (e) {
      console.error("Save failed", e);
      alert("Save failed – check backend error in Django console.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await AxiosInstance.delete(`expenses/${id}/`);
      loadExpenses(selectedCategory?.id || null);
    } catch (e) {
      console.error("Delete failed", e);
      alert("Delete failed");
    }
  };

  // ---------------- FILTERING + TOTAL ----------------

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (search.trim()) {
        const s = search.toLowerCase();
        const text = (
          (e.cost_category_name || "") +
          " " +
          (e.recorded_by || "") +
          " " +
          (e.note || "") +
          " " +
          (e.payment_mode_name || "") +
          " " +
          (e.bank_account_name || "")
        ).toLowerCase();
        if (!text.includes(s)) return false;
      }

      if (filterCategory && String(e.cost_category) !== String(filterCategory)) return false;

      if (filterPaymentMode && String(e.payment_mode) !== String(filterPaymentMode)) return false;

      if (filterDateFrom && e.expense_date < filterDateFrom) return false;
      if (filterDateTo && e.expense_date > filterDateTo) return false;

      return true;
    });
  }, [expenses, search, filterCategory, filterPaymentMode, filterDateFrom, filterDateTo]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + safeNumber(e.amount), 0),
    [filteredExpenses]
  );

  // ---------------- EXPORT CSV ----------------

  const exportCSV = () => {
    const rows = [
      ["Date", "Category", "Amount", "Payment Method", "Bank Account", "Note", "Recorded By"],
      ...filteredExpenses.map((e) => [
        e.expense_date,
        e.cost_category_name,
        e.amount,
        e.payment_mode_name || "",
        e.bank_account_name || "",
        e.note || "",
        e.recorded_by || "",
      ]),
    ];

    const csv = rows.map((r) => r.map((x) => `"${String(x ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
  };

  // ---------------- PRINT / PDF (MAKE LIKE PURCHASE INVOICE) ----------------

  const printPDF = () => {
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
      filteredExpenses.length === 0
        ? `<tr><td colspan="9" class="text-center">No expenses found</td></tr>`
        : filteredExpenses
            .map(
              (e, idx) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="text-center">${e.expense_date || "-"}</td>
                  <td>${e.cost_category_name || "-"}</td>
                  <td class="text-right">${safeNumber(e.amount).toFixed(2)}</td>
                  <td class="text-center">${e.payment_mode_name || "-"}</td>
                  <td class="text-center">${e.bank_account_name || "-"}</td>
                  <td>${e.note || "-"}</td>
                  <td class="text-center">${e.recorded_by || "-"}</td>
                  <td class="text-center">-</td>
                </tr>
              `
            )
            .join("");

    const html = `
      <html>
      <head>
        <title>Expense Report</title>

        <style>
          @page { margin: 15mm; size: A4; }
          body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #000; }
          .topline { display:flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
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
          <div>${printDate}</div>
          <div>Expense Report</div>
          <div></div>
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

        <h2>Expense Report</h2>

        <table>
          <thead>
            <tr>
              <th style="width:40px;">SL</th>
              <th style="width:90px;">Date</th>
              <th>Category</th>
              <th style="width:90px;">Amount</th>
              <th style="width:110px;">Payment Method</th>
              <th style="width:110px;">Bank Account</th>
              <th>Note</th>
              <th style="width:110px;">Recorded By</th>
              <th style="width:70px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Total</td>
              <td class="text-right">৳ ${totalAmount.toFixed(2)}</td>
              <td colspan="5"></td>
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

  // ---------------- RENDER ----------------

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Expenses</h2>

      <div className="text-xs text-slate-500">
        Business:{" "}
        <span className="font-semibold text-slate-700">
          {selectedCategory?.name || "N/A"}
        </span>
        {bannerLoading ? <span className="ml-2 text-slate-400">(Loading banner...)</span> : null}
      </div>

      {/* FORM */}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4 bg-white p-4 rounded border">
        <div>
          <label className="block text-sm font-semibold">Category *</label>
          <select
            name="cost_category"
            value={form.cost_category}
            onChange={onChange}
            className="border rounded px-3 py-1 w-64"
          >
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Amount *</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={onChange}
            className="border rounded px-3 py-1 w-32"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Date *</label>
          <input
            type="date"
            name="expense_date"
            value={form.expense_date}
            onChange={onChange}
            className="border rounded px-3 py-1 w-40"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Payment Method</label>
          <select
            name="payment_mode"
            value={form.payment_mode}
            onChange={onChange}
            className="border rounded px-3 py-1 w-48"
          >
            <option value="">-- Select --</option>
            {paymentModes.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Bank Account</label>
          <select
            name="bank_account"
            value={form.bank_account}
            onChange={onChange}
            className="border rounded px-3 py-1 w-56"
          >
            <option value="">-- Select --</option>
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.accountName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Note</label>
          <input
            name="note"
            value={form.note}
            onChange={onChange}
            className="border rounded px-3 py-1 w-64"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Recorded By *</label>
          <input
            name="recorded_by"
            value={form.recorded_by}
            onChange={onChange}
            className="border rounded px-3 py-1 w-56"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="bg-red-600 text-white px-4 py-2 rounded" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded border flex flex-wrap gap-4 text-sm items-end">
        <input
          type="text"
          placeholder="Search keyword..."
          className="border rounded px-3 py-1 w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.category_name}
            </option>
          ))}
        </select>

        <select
          value={filterPaymentMode}
          onChange={(e) => setFilterPaymentMode(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">All Payment Methods</option>
          {paymentModes.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.name}
            </option>
          ))}
        </select>

        <div>
          <label className="mr-2">From:</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="border rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="mr-2">To:</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="border rounded px-3 py-1"
          />
        </div>

        <button
          onClick={() => {
            setSearch("");
            setFilterCategory("");
            setFilterPaymentMode("");
            setFilterDateFrom("");
            setFilterDateTo("");
          }}
          className="border px-3 py-1 rounded"
        >
          Clear Filters
        </button>

        <button onClick={exportCSV} className="border px-3 py-1 rounded bg-emerald-500 text-white">
          Export CSV
        </button>

        <button onClick={printPDF} className="border px-3 py-1 rounded bg-indigo-500 text-white">
          Print / PDF
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded border p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="py-2 px-2 text-left">SL</th>
                <th className="py-2 px-2 text-left">Date</th>
                <th className="py-2 px-2 text-left">Category</th>
                <th className="py-2 px-2 text-right">Amount</th>
                <th className="py-2 px-2 text-left">Payment Method</th>
                <th className="py-2 px-2 text-left">Bank Account</th>
                <th className="py-2 px-2 text-left">Note</th>
                <th className="py-2 px-2 text-left">Recorded By</th>
                <th className="py-2 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((e, idx) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 px-2">{idx + 1}</td>
                  <td className="py-2 px-2">{e.expense_date}</td>
                  <td className="py-2 px-2">{e.cost_category_name}</td>
                  <td className="py-2 px-2 text-right">৳ {safeNumber(e.amount).toFixed(2)}</td>
                  <td className="py-2 px-2">{e.payment_mode_name || "-"}</td>
                  <td className="py-2 px-2">{e.bank_account_name || "-"}</td>
                  <td className="py-2 px-2">{e.note || "-"}</td>
                  <td className="py-2 px-2">{e.recorded_by || "-"}</td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => onDelete(e.id)}
                      className="px-2 py-1 text-xs border rounded hover:border-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-gray-400">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-white font-semibold">
                <td colSpan={3} className="py-2 px-2 text-left">Total</td>
                <td className="py-2 px-2 text-right">৳ {totalAmount.toFixed(2)}</td>
                <td colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
