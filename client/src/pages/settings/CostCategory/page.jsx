import AxiosInstance from "../../../components/AxiosInstance";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function CostCategory() {
  const [costCategories, setCostCategories] = useState([]);
  const [formData, setFormData] = useState({ category_name: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchCostCategories = async () => {
    try {
      const response = await AxiosInstance.get("cost-categories/");
      setCostCategories(response.data);
    } catch (error) {
      console.error("Error fetching cost categories:", error);
    }
  };

  useEffect(() => {
    fetchCostCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ category_name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await AxiosInstance.put(`cost-categories/${editingId}/`, formData);
        alert("Updated successfully!");
      } else {
        await AxiosInstance.post("cost-categories/", formData);
        alert("Saved successfully!");
      }
      setFormData({ category_name: "" });
      setEditingId(null);
      fetchCostCategories();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ category_name: item.category_name });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      await AxiosInstance.delete(`cost-categories/${id}/`);
      fetchCostCategories();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
        Cost Category Master
      </h2>

      <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cost Category Name:<span className="text-red-600">*</span>
          </label>
          <input
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            type="text"
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 pt-7 mb-1">
          <button
            type="submit"
            className="bg-blue-950 hover:bg-blue-700 text-white px-2 py-[6px] rounded-md w-1/2 cursor-pointer"
          >
            {editingId ? "Update" : "Save"}
          </button>
          <button
            type="reset"
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
            onClick={() => {
              setFormData({ category_name: "" });
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
              <th className="border border-gray-400 px-2 py-1">Cost Category Name</th>
              <th className="border border-gray-400 px-2 py-1">Edit</th>
              <th className="border border-gray-400 px-2 py-1">Delete</th>
            </tr>
          </thead>
          <tbody>
            {costCategories.map((item, index) => (
              <tr key={item.id} className="text-center">
                <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
                <td className="border border-gray-400 px-2 py-1">{item.category_name}</td>
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
