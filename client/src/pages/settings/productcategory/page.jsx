import AxiosInstance from "../../../components/AxiosInstance";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductCategory() {
  const [companyList, setCompanyList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({
    company: "",
    category_name: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchCompanyNames = async () => {
    try {
      const response = await AxiosInstance.get("companies/");
      setCompanyList(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await AxiosInstance.get("product-categories/");
      setCategoryList(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCompanyNames();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await AxiosInstance.put(`product-categories/${editingId}/`, formData);
        alert("Updated successfully!");
      } else {
        await AxiosInstance.post("product-categories/", formData);
        alert("Saved successfully!");
      }
      fetchCategories();
      setFormData({ company: "", category_name: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      company: item.company,
      category_name: item.category_name,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;

    try {
      await AxiosInstance.delete(`product-categories/${id}/`);
      fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    // Skip if react-select menu is open
    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    // Select all focusable elements
    const allFocusable = Array.from(
      document.querySelectorAll(
        `input:not([type="hidden"]),
       select,
       textarea,
       button,
       [tabindex]:not([tabindex="-1"])`
      )
    ).filter(
      (el) =>
        el.offsetParent !== null && // visible
        !el.disabled && // not disabled
        !(el.readOnly === true || el.getAttribute("readonly") !== null) // not readonly
    );

    const currentIndex = allFocusable.indexOf(e.target);

    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextEl = allFocusable[i];
        nextEl.focus();
        break;
      }
    }
  };

  return (
    <div>
      <div className="">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
          Product Category Master
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-4 flex-wrap"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Company Name:<span className="text-red-600">*</span>
            </label>
            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              onKeyDown={handleKeyDown}
              className="border border-gray-300 rounded px-3 py-[6px] w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value=""> ----Select---- </option>
              {companyList.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Category:<span className="text-red-600">*</span>
            </label>
            <input
              name="category_name"
              value={formData.category_name}
              onChange={handleChange}
              type="text"
              required
              onKeyDown={handleKeyDown}
              className="border border-gray-300 rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3 pt-10 mb-1">
            <button
              type="submit"
              className="bg-blue-950 hover:bg-blue-700 text-white px-2 py-[6px] rounded-md w-1/2 cursor-pointer"
            >
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="reset"
              onKeyDown={handleKeyDown}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
              onClick={() => {
                setFormData({ company: "", category_name: "" });
                setEditingId(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border border-collapse text-sm">
            <thead className="bg-sky-900 text-white">
              <tr>
                <th className="border border-gray-400 px-2 py-1">SL</th>
                <th className="border border-gray-400 px-2 py-1">Company</th>
                <th className="border border-gray-400 px-2 py-1">Category</th>
                <th className="border border-gray-400 px-2 py-1">Incharge</th>
                <th className="border border-gray-400 px-2 py-1">Phone</th>
                <th className="border border-gray-400 px-2 py-1">Email</th>
                <th className="border border-gray-400 px-2 py-1">Address</th>
                <th className="border border-gray-400 px-2 py-1">Country</th>
                <th className="border border-gray-400 px-2 py-1">Edit</th>
                <th className="border border-gray-400 px-2 py-1">Delete</th>
              </tr>
            </thead>
            <tbody>
              {categoryList.map((item, index) => (
                <tr key={item.id} className="text-center">
                  <td className="border border-gray-400 px-2 py-1">
                    {index + 1}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.company_detail.company_name}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.category_name}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.company_detail.incharge_name}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.company_detail.phone_no}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.company_detail.email}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.company_detail.address}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {item.company_detail.country}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
