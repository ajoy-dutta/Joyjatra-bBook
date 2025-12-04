import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function BankCategory() {
  const [bankCategories, setBankCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch Bank Categories
  const fetchBankCategories = async () => {
    try {
      const response = await AxiosInstance.get("bank-categories/");
      setBankCategories(response.data);
    } catch (error) {
      console.error("Error fetching bank categories:", error);
    }
  };

  useEffect(() => {
    fetchBankCategories();
  }, []);

  // Input handler
  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  // Submit handler (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await AxiosInstance.put(`bank-categories/${editingId}/`, formData);
        alert("Updated successfully!");
      } else {
        await AxiosInstance.post("bank-categories/", formData);
        alert("Saved successfully!");
      }

      setFormData({ name: "" });
      setEditingId(null);
      fetchBankCategories();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // Edit handler
  const handleEdit = (item) => {
    setFormData({ name: item.name });
    setEditingId(item.id);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;

    try {
      await AxiosInstance.delete(`bank-categories/${id}/`);
      fetchBankCategories();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
        Bank Category Master
      </h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Bank Category Name:<span className="text-red-600">*</span>
          </label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 pt-7 mb-1">
          <button
            type="submit"
            className="bg-blue-950 hover:bg-blue-700 text-white px-2 py-[6px] rounded-md cursor-pointer"
          >
            {editingId ? "Update" : "Save"}
          </button>

          <button
            type="reset"
            onClick={() => {
              setFormData({ name: "" });
              setEditingId(null);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
          >
            Reset
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-sky-900 text-white">
            <tr>
              <th className="border border-gray-400 px-2 py-1">SL</th>
              <th className="border border-gray-400 px-2 py-1">Bank Category Name</th>
              <th className="border border-gray-400 px-2 py-1">Edit</th>
              <th className="border border-gray-400 px-2 py-1">Delete</th>
            </tr>
          </thead>

          <tbody>
            {bankCategories.map((item, index) => (
              <tr key={item.id} className="text-center">
                <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
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

            {bankCategories.length === 0 && (
              <tr>
                <td className="text-center py-4" colSpan={4}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
