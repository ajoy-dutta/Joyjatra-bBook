import React, { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import { FaEdit, FaTrash } from "react-icons/fa";

const safeNumber = (value) => {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
};

const formatMoney = (value) =>
  safeNumber(value).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function BankAccount() {
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );


  const [bankAccounts, setBankAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bank: "",
    accountName: "",
    accountNo: "",
    opening_balance: "",
  });

  // ---------- Load data ----------
  const fetchBanks = async () => {
    const res = await AxiosInstance.get("banks/");
    setBanks(res.data || []);
  };

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("bank-accounts/" , {
        params: {
          business_category: selectedCategory.id,
        },
      });   
      setBankAccounts(res.data || []);
      console.log("Bank Account",res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchBankAccounts();
  }, []);

  // ---------- Form helpers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      bank: "",
      accountName: "",
      accountNo: "",
      opening_balance: "",
    });
    setEditingId(null);
  };

  // ---------- Save / Update ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      business_category: selectedCategory.id,
      bank: formData.bank,
      accountName: formData.accountName,
      accountNo: formData.accountNo,
      opening_balance: safeNumber(formData.opening_balance),
    };

    try {
      if (editingId) {
        await AxiosInstance.put(`bank-accounts/${editingId}/`, payload);
        alert("Bank account updated");
      } else {
        await AxiosInstance.post("bank-accounts/", payload);
        alert("Bank account created");
      }

      resetForm();
      fetchBankAccounts();
    } catch (err) {
      console.error(err);
      alert("Failed to save bank account");
    }
  };

  // ---------- Edit ----------
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      bank:
        typeof item.bank === "object" && item.bank !== null
          ? item.bank.id
          : item.bank,
      accountName: item.accountName,
      accountNo: item.accountNo,
      opening_balance:
        item.opening_balance !== null
          ? String(item.opening_balance)
          : "",
    });
  };

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bank account?")) return;
    await AxiosInstance.delete(`bank-accounts/${id}/`);
    fetchBankAccounts();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3 border-b pb-2">
        Bank Account Master
      </h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-4 border rounded"
      >
        {/* BANK */}
        <div>
          <label className="block text-sm font-semibold mb-1">Bank *</label>
          <select
            name="bank"
            value={formData.bank}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Bank</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* ACCOUNT NAME */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Account Name *
          </label>
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        {/* ACCOUNT NO */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Account Number *
          </label>
          <input
            type="text"
            name="accountNo"
            value={formData.accountNo}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        {/* OPENING BALANCE */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Opening Balance
          </label>
          <input
            type="number"
            step="0.01"
            name="opening_balance"
            value={formData.opening_balance}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="col-span-2">
          <button
            type="submit"
            className="bg-blue-700 text-white py-2 px-4 rounded w-full"
          >
            {editingId ? "Update" : "Save"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-gray-500">Loading bank accounts...</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-blue-950 text-white">
              <tr>
                <th className="border p-1">SL</th>
                <th className="border p-1">Bank</th>
                <th className="border p-1">Account Name</th>
                <th className="border p-1">Account No</th>
                <th className="border p-1">Opening</th>
                <th className="border p-1">Current</th>
                <th className="border p-1">Edit</th>
                <th className="border p-1">Delete</th>
              </tr>
            </thead>

            <tbody>
              {bankAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border p-2 text-center">
                    No bank accounts found
                  </td>
                </tr>
              ) : (
                bankAccounts.map((item, i) => (
                  <tr key={item.id} className="text-center">
                    <td className="border p-1">{i + 1}</td>
                    <td className="border p-1">
                      {item.bank_details
                        ? item.bank_details.name
                        : "N/A"
                      }
                    </td>
                    <td className="border p-1">{item.accountName}</td>
                    <td className="border p-1">{item.accountNo}</td>
                    <td className="border p-1">
                      {formatMoney(item.opening_balance)}
                    </td>
                    <td className="border p-1">
                      {formatMoney(item.current_balance)}
                    </td>
                    <td
                      className="border p-1 text-yellow-600 cursor-pointer"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </td>
                    <td
                      className="border p-1 text-red-600 cursor-pointer"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
