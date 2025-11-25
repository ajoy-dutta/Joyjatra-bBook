import AxiosInstance from "../../../components/AxiosInstance";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function BankMaster() {
  const [bankList, setBankList] = useState([]);
  const [categoryList, setcategoryList] = useState([]);
  const [formData, setFormData] = useState({
    bank_category: "",
    name: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch bank categories for dropdown
  const fetchBankCategories = async () => {
    try {
      const response = await AxiosInstance.get("bank-categories/");
      setcategoryList(response.data);
    } catch (error) {
      console.error("Error fetching bank categories:", error);
    }
  };

  // Fetch all banks
  const fetchBanks = async () => {
    try {
      const response = await AxiosInstance.get("banks/");
      setBankList(response.data);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  useEffect(() => {
    fetchBankCategories();
    fetchBanks();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await AxiosInstance.put(`banks/${editingId}/`, formData);
        alert("Updated successfully!");
      } else {
        await AxiosInstance.post("banks/", formData);
        alert("Saved successfully!");
      }
      setFormData({ bank_category: "", name: "" });
      setEditingId(null);
      fetchBanks();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      bank_category: item.bank_category, // assuming it's ID
      name: item.name,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      await AxiosInstance.delete(`banks/${id}/`);
      fetchBanks();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
        Bank Master
      </h2>

      <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Bank category:<span className="text-red-600">*</span>
          </label>
          <select
            name="bank_category"
            value={formData.bank_category}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-[6px] w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select category --</option>
            {categoryList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Bank Name:<span className="text-red-600">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 pt-7 mb-1">
          <button
            type="submit"
            className="bg-blue-950 hover:bg-blue-700 text-white px-3 py-[6px] rounded-md w-1/2 cursor-pointer"
          >
            {editingId ? "Update" : "Save"}
          </button>
          <button
            type="reset"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded cursor-pointer"
            onClick={() => {
              setFormData({ bank_category: "", name: "" });
              setEditingId(null);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-sky-900 text-white">
            <tr>
              <th className="border border-gray-400 px-2 py-1">SL</th>
              <th className="border border-gray-400 px-2 py-1">Bank category</th>
              <th className="border border-gray-400 px-2 py-1">Bank Name</th>
              <th className="border border-gray-400 px-2 py-1">Edit</th>
              <th className="border border-gray-400 px-2 py-1">Delete</th>
            </tr>
          </thead>
          <tbody>
            {bankList.map((item, index) => (
              <tr key={item.id} className="text-center">
                <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
                <td className="border border-gray-400 px-2 py-1">
                  {item.bank_category_detail?.name || "—"}
                </td>
                <td className="border border-gray-400 px-2 py-1">{item.name}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
