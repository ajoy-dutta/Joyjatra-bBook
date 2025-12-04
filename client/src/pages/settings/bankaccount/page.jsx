import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function BankAccount() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]); 

  const [formData, setFormData] = useState({
    accountCategory: "",
    accountName: "",
    bankName: "",
    accountNo: "",
    bankAddress: "",
    bankContact: "",
    bankMail: "",
    previousBalance: "",
  });

  const [editingId, setEditingId] = useState(null);
  const fetchCategories = async () => {
    const res = await AxiosInstance.get("account-categories/");
    setCategories(res.data);
  };
  const fetchBanks = async () => {
    const res = await AxiosInstance.get("banks/");
    setBanks(res.data);
  };

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    const res = await AxiosInstance.get("bank-accounts/");
    setBankAccounts(res.data);
  };

  // Load on page open
  useEffect(() => {
    fetchBanks();
    fetchCategories();
    fetchBankAccounts();
  }, []);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
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
      previousBalance: "",
    });
    setEditingId(null);
  };

  // Save / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      previousBalance: parseFloat(formData.previousBalance) || 0,
    };

    if (editingId) {
      await AxiosInstance.put(`bank-accounts/${editingId}/`, payload);
      alert("Updated!");
    } else {
      await AxiosInstance.post("bank-accounts/", payload);
      alert("Saved!");
    }

    resetForm();
    fetchBankAccounts();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await AxiosInstance.delete(`bank-accounts/${id}/`);
    fetchBankAccounts();
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3 border-b pb-2">
        Bank Account Master
      </h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 bg-white p-4 border rounded">

       
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
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

    
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
              <option key={cat.id} value={cat.name}>
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
          <label className="block text-sm font-semibold mb-1">Bank Address</label>
          <textarea
            name="bankAddress"
            value={formData.bankAddress}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          ></textarea>
        </div>

        {/* CONTACT */}
        <div>
          <label className="block text-sm font-semibold mb-1">Bank Contact</label>
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
          <label className="block text-sm font-semibold mb-1">Bank Email</label>
          <input
            type="email"
            name="bankMail"
            value={formData.bankMail}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* PREVIOUS BALANCE */}
        <div>
          <label className="block text-sm font-semibold mb-1">Opening Balance</label>
          <input
            type="number"
            name="previousBalance"
            value={formData.previousBalance}
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
            <th className="border p-1">Balance</th>
            <th className="border p-1">Edit</th>
            <th className="border p-1">Delete</th>
          </tr>
        </thead>

        <tbody>
          {bankAccounts.map((item, index) => (
            <tr key={item.id} className="text-center">
              <td className="border p-1">{index + 1}</td>
              <td className="border p-1">{item.bankName}</td>
              <td className="border p-1">{item.accountCategory}</td>
              <td className="border p-1">{item.accountName}</td>
              <td className="border p-1">{item.accountNo}</td>
              <td className="border p-1">{item.previousBalance}</td>

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
        </tbody>
      </table>
    </div>
  );
}
