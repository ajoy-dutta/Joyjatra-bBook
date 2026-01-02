import { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import IncomeModal from "./IncomeModal";
import IncomeVoucherPDF from "./IncomeVoucherPDF";
import { Pencil, Receipt } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";

export default function Income() {
  const [categories, setCategories] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIncome, setEditIncome] = useState(null);

  const [voucherIncome, setVoucherIncome] = useState(null);
  const [business, setBusiness] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  const [filters, setFilters] = useState({
    category: "",
    fromDate: "",
    toDate: "",
  });

  // Fetch business info
  const fetchBusinessInfo = async () => {
    if (!selectedCategory) return;
    const res = await AxiosInstance.get(`business-categories/${selectedCategory.id}`);
    setBusiness(res.data);
  };

  const fetchCategories = async () => {
    const res = await AxiosInstance.get("income-categories/", {
      params: { business_category: selectedCategory?.id || undefined },
    });
    setCategories(res.data);
  };

  const fetchIncomes = async (filterValues = filters) => {
    const res = await AxiosInstance.get("incomes/", {
        params: {
        business_category: selectedCategory?.id || undefined,
        category: filterValues.category || undefined,
        from_date: filterValues.fromDate || undefined,
        to_date: filterValues.toDate || undefined,
        },
    });
    setIncomes(res.data);
  };

  
  const handleAdd = () => {
    setEditIncome(null);
    setIsModalOpen(true);
  };

  const handleEdit = (income) => {
    setEditIncome(income);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editIncome) {
      await AxiosInstance.put(`incomes/${editIncome.id}/`, data);
    } else {
      await AxiosInstance.post("incomes/", data);
    }
    setIsModalOpen(false);
    fetchIncomes();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchIncomes();
  };

  useEffect(() => {
    fetchCategories();
    fetchIncomes();
    fetchBusinessInfo();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Income</h2>
          <p className="text-sm text-gray-500">Manage income entries and vouchers</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2.5 rounded-lg font-medium"
        >
          + Add Income
        </button>
      </div>

      {/* ================= FILTERS ================= */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end"
      >
        {/* Category */}
        <div className="flex flex-col">
          <label className="text-gray-600 text-sm mb-1">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border p-2 rounded w-48"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* From Date */}
        <div className="flex flex-col">
          <label className="text-gray-600 text-sm mb-1">From Date</label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            className="border p-2 rounded w-40"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col">
          <label className="text-gray-600 text-sm mb-1">To Date</label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            className="border p-2 rounded w-40"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Filter
        </button>

        <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
            onClick={() => {
                const resetFilters = { category: "", fromDate: "", toDate: "" };
                setFilters(resetFilters);
                fetchIncomes(resetFilters); // pass directly
            }}
            >
            Reset
        </button>

      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-left">Received By</th>
                <th className="px-5 py-3 text-left">Note</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-6 text-center text-gray-400">
                    No income records found
                  </td>
                </tr>
              ) : (
                incomes.map((inc) => (
                  <tr key={inc.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-5 py-3">{inc.date}</td>
                    <td className="px-5 py-3 font-medium">{inc.category_name}</td>
                    <td className="px-5 py-3 text-right font-semibold">৳ {inc.amount}</td>
                    <td className="px-5 py-3">{inc.received_by}</td>
                    <td className="px-5 py-3 text-gray-500">{inc.note || "-"}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(inc)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setVoucherIncome(inc)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                          title="View Voucher"
                        >
                          <Receipt size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <IncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCategory={selectedCategory}
        onSubmit={handleSubmit}
        categories={categories}
        initialData={editIncome}
      />

      {/* PDF Voucher Modal */}
      {voucherIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <div className="bg-white w-full max-w-3xl h-[80vh] rounded-lg shadow-lg">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setVoucherIncome(null)}
                className="px-3 py-1 rounded border hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <PDFViewer width="100%" height="90%" className="border-t">
              <IncomeVoucherPDF income={voucherIncome} business={business} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}
