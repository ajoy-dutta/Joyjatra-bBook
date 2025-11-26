import React, { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

export default function ExpensePage() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ cost_category: "", amount: "", note: "" });
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await AxiosInstance.get("cost-categories/"); // reuse existing endpoint
      setCategories(res.data);
    } catch (e) {
      console.error("Failed to load cost categories", e);
    }
  };

  const loadExpenses = async () => {
    try {
      const res = await AxiosInstance.get("expenses/");
      setExpenses(res.data);
    } catch (e) {
      console.error("Failed to load expenses", e);
    }
  };

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.cost_category || !form.amount) return alert("Select category and enter amount");
    setSaving(true);
    try {
      await AxiosInstance.post("expenses/", {
        cost_category: form.cost_category,
        amount: form.amount,
        note: form.note,
      });
      setForm({ cost_category: "", amount: "", note: "" });
      await loadExpenses();
      alert("Saved!");
    } catch (e) {
      console.error("Save failed", e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await AxiosInstance.delete(`expenses/${id}/`);
      await loadExpenses();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Expenses</h2>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cost Category <span className="text-red-600">*</span>
          </label>
          <select
            name="cost_category"
            value={form.cost_category}
            onChange={onChange}
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Amount (৳) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={onChange}
            min="0"
            step="0.01"
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Note</label>
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={onChange}
            placeholder="Optional note"
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 mb-1">
          <button type="submit" disabled={saving}
            className="bg-blue-950 hover:bg-blue-700 text-white px-3 py-[6px] rounded-md disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="reset"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            onClick={() => setForm({ cost_category: "", amount: "", note: "" })}>
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-slate-50 border-b">
            <tr className="text-left text-slate-600">
              <th className="py-2 px-2">SL</th>
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2">Note</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, idx) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2">{e.expense_date}</td>
                <td className="py-2 px-2">{e.cost_category_name}</td>
                <td className="py-2 px-2 text-right">৳ {Number(e.amount).toFixed(2)}</td>
                <td className="py-2 px-2">{e.note || "-"}</td>
                <td className="py-2 px-2 text-right">
                  <button onClick={() => onDelete(e.id)}
                    className="px-2 py-1 rounded border border-slate-200 hover:border-red-500 text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td className="py-4 px-2 text-center text-slate-400" colSpan={6}>No expenses yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
