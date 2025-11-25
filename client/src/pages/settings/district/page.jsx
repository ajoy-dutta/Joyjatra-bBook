import AxiosInstance from "../../../components/AxiosInstance";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function District() {
  const [districts, setDistricts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [formData, setFormData] = useState({ name: "", division: null });
  const [editingId, setEditingId] = useState(null);

  const fetchDistricts = async () => {
    try {
      const response = await AxiosInstance.get("districts/");
      const response2 = await AxiosInstance.get("divisions/");
      setDistricts(response.data);
      setDivisions(response2.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);


  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await AxiosInstance.put(`districts/${editingId}/`, formData);
        alert("Updated successfully!");
      } else {
        await AxiosInstance.post("districts/", formData);
        alert("Saved successfully!");
      }
      setFormData({ name: "" , division: null});
      setEditingId(null);
      fetchDistricts();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, division: item.division });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      await AxiosInstance.delete(`districts/${id}/`);
      fetchDistricts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
        District Master
      </h2>

      <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Division:<span className="text-red-600">*</span>
          </label>
          <select
            name="division"
            value={formData.division || ""}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="" disabled>
              Select Division
            </option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.name}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            District Name:<span className="text-red-600">*</span>
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
            className="bg-blue-950 hover:bg-blue-700 text-white px-2 py-[6px] rounded-md w-1/2 cursor-pointer"
          >
            {editingId ? "Update" : "Save"}
          </button>
          <button
            type="reset"
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
            onClick={() => {
              setFormData({ name: "" });
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
              <th className="border border-gray-400 px-2 py-1">District Name</th>
              <th className="border border-gray-400 px-2 py-1">Division</th>
              <th className="border border-gray-400 px-2 py-1">Edit</th>
              <th className="border border-gray-400 px-2 py-1">Delete</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((item, index) => (
              <tr key={item.id} className="text-center">
                <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
                <td className="border border-gray-400 px-2 py-1">{item.name}</td>
                <td className="border border-gray-400 px-2 py-1">{item.division_name}</td>
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
