// client/src/pages/expenses/SalaryExpense.jsx

import React, { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";

const EMPTY_FORM = {
  staff: "",
  salary_month: "",
  amount: "",
  note: "",
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

  useEffect(() => {
    loadStaffs();
    loadSalaryExpenses();
  }, []);

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
    if (!form.staff || !form.salary_month || !form.amount) {
      alert("Staff, month and amount are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      staff: form.staff,
      salary_month: form.salary_month, // "YYYY-MM"
      amount: form.amount,
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
      amount: item.amount || "",
      note: item.note || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this salary expense?")) return;
    try {
      await AxiosInstance.delete(`salary-expenses/${id}/`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
      setError("Failed to delete salary expense");
    }
  };

  // ------------ UI ------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Salary Expenses
          </h2>
          <p className="text-xs text-slate-500">
            Record employee salary payments month by month.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative w-64">
            <FaSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by staff or month..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
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
        className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-xl p-4 items-end"
      >
        {/* Staff */}
        <div className="md:col-span-2">
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
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Amount (৳) *
          </label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
          />
        </div>

        {/* Note */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Note
          </label>
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Bonus, overtime, deduction, etc."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
          />
        </div>

        {/* Button */}
        <div className="md:col-span-1 flex justify-end gap-2">
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
            {saving
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
              ? "Update Salary"
              : "Save Salary"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Salary Expense List
          </h3>
          <span className="text-[11px] text-slate-500">
            {items.length} record{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-500">
            No salary expenses recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="py-2 px-2 text-left">Employee</th>
                  <th className="py-2 px-2 text-left">Month</th>
                  <th className="py-2 px-2 text-right">Amount</th>
                  <th className="py-2 px-2 text-left">Note</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 px-2">
                      {r.staff_name || `Staff #${r.staff}`}
                    </td>
                    <td className="py-2 px-2">{r.salary_month}</td>
                    <td className="py-2 px-2 text-right">
                      ৳ {Number(r.amount).toLocaleString()}
                    </td>
                    <td className="py-2 px-2">
                      {r.note || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-2 px-2 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
