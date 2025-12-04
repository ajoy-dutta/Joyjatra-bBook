import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function BankAccount() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);

  const [formData, setFormData] = useState({
    accountCategory: "", // will hold category ID
    accountName: "",
    bankName: "",        // will hold bank ID
    accountNo: "",
    bankAddress: "",
    bankContact: "",
    bankMail: "",
    opening_balance: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Fetch account categories
  const fetchCategories = async () => {
    try {
      const res = await AxiosInstance.get("account-categories/");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  // Fetch banks
  const fetchBanks = async () => {
    try {
      const res = await AxiosInstance.get("banks/");
      setBanks(res.data || []);
    } catch (err) {
      console.error("Error loading banks:", err);
    }
  };

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      const res = await AxiosInstance.get("bank-accounts/");
      setBankAccounts(res.data || []);
    } catch (err) {
      console.error("Error loading bank accounts:", err);
    }
  };

  // Load on page open
  useEffect(() => {
    fetchBanks();
    fetchCategories();
    fetchBankAccounts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      accountCategory: "",
      accountName: "",
      bankName: "",
      accountNo: "",
      bankAddress: "",
      bankContact: "",
      bankMail: "",
      opening_balance: "",
    });
    setEditingId(null);
  };

  // Save / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      // ensure numeric for backend
      opening_balance: parseFloat(formData.opening_balance) || 0,
    };

    try {
      if (editingId) {
        await AxiosInstance.put(`bank-accounts/${editingId}/`, payload);
        alert("Bank account updated!");
      } else {
        await AxiosInstance.post("bank-accounts/", payload);
        alert("Bank account saved!");
      }

      resetForm();
      fetchBankAccounts();
    } catch (err) {
      console.error("Error saving bank account:", err);
      alert("Error saving bank account. Check console for details.");
    }
  };

  // Edit row
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      accountCategory: item.accountCategory, // ID
      accountName: item.accountName,
      bankName: item.bankName,             // ID
      accountNo: item.accountNo,
      bankAddress: item.bankAddress,
      bankContact: item.bankContact,
      bankMail: item.bankMail,
      opening_balance:
        item.opening_balance !== null && item.opening_balance !== undefined
          ? item.opening_balance
          : "",
    });
  };

  // Delete row
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) {
      return;
    }
    try {
      await AxiosInstance.delete(`bank-accounts/${id}/`);
      fetchBankAccounts();
    } catch (err) {
      console.error("Error deleting bank account:", err);
      alert("Failed to delete bank account.");
    }
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
            name="bankName"
            value={formData.bankName}
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

        {/* ACCOUNT CATEGORY */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Account Category *
          </label>
          <select
            name="accountCategory"
            value={formData.accountCategory}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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

        {/* ACCOUNT NUMBER */}
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

        {/* ADDRESS */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold mb-1">
            Bank Address
          </label>
          <textarea
            name="bankAddress"
            value={formData.bankAddress}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* CONTACT */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Bank Contact
          </label>
          <input
            type="text"
            name="bankContact"
            value={formData.bankContact}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Bank Email
          </label>
          <input
            type="email"
            name="bankMail"
            value={formData.bankMail}
            onChange={handleChange}
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

        <button
          type="submit"
          className="col-span-2 bg-blue-700 text-white py-2 rounded"
        >
          {editingId ? "Update" : "Save"}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full border mt-5 text-sm">
        <thead className="bg-blue-950 text-white">
          <tr>
            <th className="border p-1">SL</th>
            <th className="border p-1">Bank</th>
            <th className="border p-1">Category</th>
            <th className="border p-1">Account Name</th>
            <th className="border p-1">Account No</th>
            <th className="border p-1">Opening Balance</th>
            <th className="border p-1">Current Balance</th>
            <th className="border p-1">Edit</th>
            <th className="border p-1">Delete</th>
          </tr>
        </thead>

        <tbody>
          {bankAccounts.map((item, index) => (
            <tr key={item.id} className="text-center">
              <td className="border p-1">{index + 1}</td>
              {/* Show readable names; fall back to raw value if needed */}
              <td className="border p-1">
                {item.bankName_name || item.bankName}
              </td>
              <td className="border p-1">
                {item.accountCategory_name || item.accountCategory}
              </td>
              <td className="border p-1">{item.accountName}</td>
              <td className="border p-1">{item.accountNo}</td>
              <td className="border p-1">
                {item.opening_balance !== undefined &&
                item.opening_balance !== null
                  ? item.opening_balance
                  : ""}
              </td>
              <td className="border p-1">
                {item.current_balance !== undefined &&
                item.current_balance !== null
                  ? item.current_balance
                  : ""}
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
          ))}
          {bankAccounts.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="border p-2 text-center text-gray-500"
              >
                No bank accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
