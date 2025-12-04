// client/src/pages/accounting/BankTransactions.jsx
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import AxiosInstance from "../../components/AxiosInstance";

const TRANSACTION_TYPES = [
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAW", label: "Withdraw" },
  { value: "TRANSFER_IN", label: "Transfer In" },
  { value: "TRANSFER_OUT", label: "Transfer Out" },
  { value: "CHARGE", label: "Bank Charge" },
  { value: "INTEREST", label: "Bank Interest" },
];

const EMPTY_FORM = {
  bank_account: "",
  date: "",
  transaction_type: "DEPOSIT",
  amount: "",
  narration: "",
  reference_no: "",
};

export default function BankTransactions() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---------- API calls ----------

  const fetchBankAccounts = async () => {
    try {
      const res = await AxiosInstance.get("bank-accounts/");
      setBankAccounts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load bank accounts");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("bank-transactions/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load bank transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
    fetchTransactions();
  }, []);

  // ---------- Form handlers ----------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.bank_account) {
      setError("Bank account is required");
      return;
    }
    if (!form.date) {
      setError("Date is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
    };

    try {
      setSaving(true);
      if (editingId) {
        await AxiosInstance.put(`bank-transactions/${editingId}/`, payload);
        alert("Bank transaction updated");
      } else {
        await AxiosInstance.post("bank-transactions/", payload);
        alert("Bank transaction saved");
      }
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Failed to save bank transaction";
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      bank_account: item.bank_account || "",
      date: item.date || "",
      transaction_type: item.transaction_type || "DEPOSIT",
      amount: item.amount || "",
      narration: item.narration || "",
      reference_no: item.reference_no || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await AxiosInstance.delete(`bank-transactions/${id}/`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction");
    }
  };

  // ---------- Helpers ----------

  const formatAmount = (val) => {
    if (val === null || val === undefined) return "0.00";
    return Number(val).toFixed(2);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
        Bank Transactions
      </h2>

      {/* Error message */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Bank Account <span className="text-red-600">*</span>
          </label>
          <select
            name="bank_account"
            value={form.bank_account}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Account --</option>
            {bankAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountName} ({acc.bankName} - {acc.accountNo})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Type
          </label>
          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TRANSACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Amount <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Narration
          </label>
          <input
            type="text"
            name="narration"
            value={form.narration}
            onChange={handleChange}
            placeholder="e.g. Opening deposit, rent payment"
            className="border border-gray-300 rounded px-3 py-1 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Reference No
          </label>
          <input
            type="text"
            name="reference_no"
            value={form.reference_no}
            onChange={handleChange}
            placeholder="Cheque / slip no."
            className="border border-gray-300 rounded px-3 py-1 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Save"}
          </button>
          <button
            type="button"
            className="mt-5 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
            onClick={resetForm}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Transactions table */}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border border-collapse text-xs md:text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="border border-gray-400 px-2 py-1">SL</th>
              <th className="border border-gray-400 px-2 py-1">Date</th>
              <th className="border border-gray-400 px-2 py-1">Account</th>
              <th className="border border-gray-400 px-2 py-1">Type</th>
              <th className="border border-gray-400 px-2 py-1 text-right">
                Amount
              </th>
              <th className="border border-gray-400 px-2 py-1">Narration</th>
              <th className="border border-gray-400 px-2 py-1">Ref</th>
              <th className="border border-gray-400 px-2 py-1">Edit</th>
              <th className="border border-gray-400 px-2 py-1">Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  Loading...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  No bank transactions found
                </td>
              </tr>
            ) : (
              transactions.map((item, index) => (
                <tr key={item.id} className="text-center">
                  <td className="border border-gray-400 px-2 py-1">
                    {index + 1}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.date}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.bank_account_detail
                      ? `${item.bank_account_detail.accountName} (${item.bank_account_detail.bankName})`
                      : item.bank_account}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.transaction_type}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-right">
                    {formatAmount(item.amount)}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.narration}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.reference_no}
                  </td>
                  <td
                    className="border border-gray-400 px-2 py-1 text-yellow-600 cursor-pointer"
                    onClick={() => handleEdit(item)}
                  >
                    <div className="flex justify-center items-center">
                      <FaEdit />
                    </div>
                  </td>
                  <td
                    className="border border-gray-400 px-2 py-1 text-red-600 cursor-pointer"
                    onClick={() => handleDelete(item.id)}
                  >
                    <div className="flex justify-center items-center">
                      <FaTrash />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
