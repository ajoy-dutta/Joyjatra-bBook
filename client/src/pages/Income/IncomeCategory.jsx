import { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

export default function IncomeCategory() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
        JSON.parse(localStorage.getItem("business_category")) || null
    ); 

  const fetchCategories = async () => {
    const res = await AxiosInstance.get("income-categories/");
    setCategories(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await AxiosInstance.post("income-categories/", { name , business_category: selectedCategory.id });

    setName("");
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Income Categories
        </h2>
        <p className="text-sm text-gray-500">
          Manage income category list
        </p>
      </div>

      {/* Add Category Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b">
          <h3 className="text-lg font-medium text-gray-700">
            Add New Category
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex gap-4">
          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="
              flex-1 rounded-lg border border-gray-300 px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition
            "
          />

          <button
            type="submit"
            className="
              bg-blue-600 text-white px-6 py-2.5 rounded-lg
              hover:bg-blue-700 transition font-medium
            "
          >
            Save
          </button>
        </form>
      </div>

      {/* Category List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b">
          <h3 className="text-lg font-medium text-gray-700">
            Category List
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-5 py-3 text-left w-16">#</th>
                <th className="px-5 py-3 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="px-5 py-6 text-center text-gray-400"
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3 text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-700">
                      {cat.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
