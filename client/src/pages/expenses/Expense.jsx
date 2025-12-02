import React, { useEffect, useState, useMemo } from "react";
import AxiosInstance from "../../components/AxiosInstance";

export default function ExpensePage() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    cost_category: "",
    amount: "",
    note: "",
    expense_date: "",
    recorded_by: "",
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Fetch categories
  const loadCategories = async () => {
    try {
      const res = await AxiosInstance.get("cost-categories/");
      setCategories(res.data);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  // Fetch expenses
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("expenses/");
      setExpenses(res.data);
    } catch (e) {
      console.error("Failed to load expenses", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, []);

  // OnChange for form fields
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add Expense
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.cost_category || !form.amount || !form.expense_date || !form.recorded_by) {
      return alert("Please fill all required fields");
    }

    setSaving(true);
    try {
      await AxiosInstance.post("expenses/", form);
      alert("Expense saved!");
      setForm({
        cost_category: "",
        amount: "",
        note: "",
        expense_date: "",
        recorded_by: "",
      });
      loadExpenses();
    } catch (e) {
      console.error("Save failed", e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Delete Expense
  const onDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await AxiosInstance.delete(`expenses/${id}/`);
      loadExpenses();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  // ------------------ FILTERING LOGIC ------------------
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search match
      if (search.trim()) {
        const s = search.toLowerCase();
        if (
          !(
            e.cost_category_name?.toLowerCase().includes(s) ||
            e.recorded_by?.toLowerCase().includes(s) ||
            e.note?.toLowerCase().includes(s)
          )
        ) {
          return false;
        }
      }

      // Category filter
      if (filterCategory && String(e.cost_category) !== String(filterCategory)) {
        return false;
      }

      // Date range filter
      if (filterDateFrom && e.expense_date < filterDateFrom) return false;
      if (filterDateTo && e.expense_date > filterDateTo) return false;

      return true;
    });
  }, [expenses, search, filterCategory, filterDateFrom, filterDateTo]);

  // Total Amount
  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [filteredExpenses]
  );

  // ----------------- CSV EXPORT -----------------
  const exportCSV = () => {
    const rows = [
      ["Date", "Category", "Amount", "Note", "Recorded By"],
      ...filteredExpenses.map((e) => [
        e.expense_date,
        e.cost_category_name,
        e.amount,
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

  // ----------------- PRINT / PDF -----------------
  const printPDF = () => {
    const content = document.getElementById("expense-print-area");
    const win = window.open("", "_blank");

    win.document.write(`
      <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #ccc; padding: 8px; }
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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Expenses</h2>

      {/* ------------------ FORM ------------------ */}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
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
              <option key={c.id} value={c.id}>{c.category_name}</option>
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
            className="border rounded px-3 py-1 w-40"
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
            className="border rounded px-3 py-1 w-64"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="reset"
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() =>
              setForm({ cost_category: "", amount: "", note: "", expense_date: "", recorded_by: "" })
            }
          >
            Reset
          </button>
        </div>
      </form>

      {/* ------------------ FILTERS ------------------ */}
      <div className="bg-white p-4 rounded border flex flex-wrap gap-4 text-sm">
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

      {/* ------------------ TABLE ------------------ */}
      <div id="expense-print-area" className="mt-4 overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="py-2 px-2 text-left">SL</th>
              <th className="py-2 px-2 text-left">Date</th>
              <th className="py-2 px-2 text-left">Category</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2">Note</th>
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
                <td className="py-2 px-2 text-right">৳ {Number(e.amount).toFixed(2)}</td>
                <td className="py-2 px-2">{e.note || "-"}</td>
                <td className="py-2 px-2">{e.recorded_by}</td>
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
                <td colSpan={7} className="py-4 text-center text-gray-400">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>

          {/* FOOTER TOTAL */}
          <tfoot>
            <tr className="bg-gray-900 text-white font-semibold">
              <td colSpan={3} className="py-2 px-2 text-left">
                Total
              </td>
              <td className="py-2 px-2 text-right">৳ {totalAmount.toFixed(2)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
