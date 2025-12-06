// client/src/pages/expenses/Expense.jsx

import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

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

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

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
      // matches router.register('payment-mode', PaymentModeViewSet)
      const res = await AxiosInstance.get("payment-mode/");
      setPaymentModes(res.data || []);
    } catch (e) {
      console.error("Failed to load payment modes", e);
    }
  };

  const loadBankAccounts = async () => {
    try {
      // matches router.register('bank-accounts', BankAccountViewSet)
      const res = await AxiosInstance.get("bank-accounts/");
      setBankAccounts(res.data || []);
    } catch (e) {
      console.error("Failed to load bank accounts", e);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("expenses/");
      const raw = res.data;
      const rows = Array.isArray(raw) ? raw : raw?.results || [];
      setExpenses(rows);
    } catch (e) {
      console.error("Failed to load expenses", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadPaymentModes();
    loadBankAccounts();
    loadExpenses();
  }, []);

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
    };

    setSaving(true);
    try {
      await AxiosInstance.post("expenses/", payload);
      alert("Expense saved!");
      resetForm();
      loadExpenses();
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
      loadExpenses();
    } catch (e) {
      console.error("Delete failed", e);
      alert("Delete failed");
    }
  };

  // ---------------- FILTERING + TOTAL ----------------

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // search
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

      // category filter
      if (filterCategory && String(e.cost_category) !== String(filterCategory)) {
        return false;
      }

      // payment mode filter
      if (
        filterPaymentMode &&
        String(e.payment_mode) !== String(filterPaymentMode)
      ) {
        return false;
      }

      // date range (YYYY-MM-DD strings)
      if (filterDateFrom && e.expense_date < filterDateFrom) return false;
      if (filterDateTo && e.expense_date > filterDateTo) return false;

      return true;
    });
  }, [
    expenses,
    search,
    filterCategory,
    filterPaymentMode,
    filterDateFrom,
    filterDateTo,
  ]);

  const totalAmount = useMemo(
    () =>
      filteredExpenses.reduce(
        (sum, e) => sum + (parseFloat(e.amount) || 0),
        0
      ),
    [filteredExpenses]
  );

  // ---------------- EXPORT CSV ----------------

  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Category",
        "Amount",
        "Payment Method",
        "Bank Account",
        "Note",
        "Recorded By",
      ],
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

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
  };

  // ---------------- PRINT / PDF ----------------

  const printPDF = () => {
    const content = document.getElementById("expense-print-area");
    if (!content) return;

    const win = window.open("", "_blank");

    win.document.write(`
      <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h2>Expense Report</h2>
          ${content.innerHTML}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  };

  // ---------------- RENDER ----------------

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
        Expenses
      </h2>

      {/* FORM */}
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-4 bg-white p-4 rounded border"
      >
        {/* Category */}
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

        {/* Amount */}
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

        {/* Date */}
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

        {/* Payment Method */}
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

        {/* Bank Account */}
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

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold">Note</label>
          <input
            name="note"
            value={form.note}
            onChange={onChange}
            className="border rounded px-3 py-1 w-64"
          />
        </div>

        {/* Recorded By */}
        <div>
          <label className="block text-sm font-semibold">Recorded By *</label>
          <input
            name="recorded_by"
            value={form.recorded_by}
            onChange={onChange}
            className="border rounded px-3 py-1 w-56"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={resetForm}
          >
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

        <button
          onClick={exportCSV}
          className="border px-3 py-1 rounded bg-emerald-500 text-white"
        >
          Export CSV
        </button>

        <button
          onClick={printPDF}
          className="border px-3 py-1 rounded bg-indigo-500 text-white"
        >
          Print / PDF
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded border p-4" id="expense-print-area">
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
                  <td className="py-2 px-2 text-right">
                    ৳ {Number(e.amount || 0).toFixed(2)}
                  </td>
                  <td className="py-2 px-2">
                    {e.payment_mode_name || "-"}
                  </td>
                  <td className="py-2 px-2">
                    {e.bank_account_name || "-"}
                  </td>
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
                <td colSpan={3} className="py-2 px-2 text-left">
                  Total
                </td>
                <td className="py-2 px-2 text-right">
                  ৳ {totalAmount.toFixed(2)}
                </td>
                <td colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
