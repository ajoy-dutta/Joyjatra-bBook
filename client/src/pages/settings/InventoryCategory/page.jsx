import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AccountCategory() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await AxiosInstance.get("inventory-categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  // Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await AxiosInstance.put(`inventory-categories/${editingId}/`, formData);
        alert("Updated Successfully!");
      } else {
        await AxiosInstance.post("inventory-categories/", formData);
        alert("Saved Successfully!");
      }

      setFormData({ name: "" });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Edit entry
  const handleEdit = (item) => {
    setFormData({ name: item.name });
    setEditingId(item.id);
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await AxiosInstance.delete(`inventory-categories/${id}/`);
      fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
        Inventory Category Master
      </h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Category Name <span className="text-red-600">*</span>
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:ring-2 focus:outline-none focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="bg-blue-950 hover:bg-blue-700 text-white px-3 py-[6px] rounded-md mt-6"
          >
            {editingId ? "Update" : "Save"}
          </button>

          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
            onClick={() => {
              setFormData({ name: "" });
              setEditingId(null);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-blue-950 text-white">
            <tr>
              <th className="border px-2 py-1">SL</th>
              <th className="border px-2 py-1">Inventory Category Name</th>
              <th className="border px-2 py-1">Edit</th>
              <th className="border px-2 py-1">Delete</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((item, index) => (
              <tr key={item.id} className="text-center">
                <td className="border px-2 py-1">{index + 1}</td>
                <td className="border px-2 py-1">{item.name}</td>

                <td
                  className="border px-2 py-1 text-yellow-600 cursor-pointer"
                  onClick={() => handleEdit(item)}
                >
                  <FaEdit />
                </td>

                <td
                  className="border px-2 py-1 text-red-600 cursor-pointer"
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrash />
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
