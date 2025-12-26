import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../../components/AxiosInstance";

export default function CombinedExpenseReport() {
  const [data, setData] = useState([]);
  const [costCategories, setCostCategories] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [costCategory, setCostCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =============================
  // BUSINESS CATEGORY FROM LOCALSTORAGE
  // =============================
  const selectedBusiness = JSON.parse(localStorage.getItem("business_category")) || null;
  const businessCategoryId = selectedBusiness?.id || null;

  // =============================
  // FETCH COST CATEGORIES
  // =============================
  useEffect(() => {
    fetchCostCategories();
    fetchReport();
  }, []);

  const fetchCostCategories = async () => {
    try {
      const res = await AxiosInstance.get("/cost-categories/");
      setCostCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching cost categories:", err);
      setCostCategories([]);
    }
  };

  // =============================
  // FETCH REPORT
  // =============================
  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        // use selected filter or business category from localStorage
        cost_category: costCategory || businessCategoryId || undefined,
      };

      const res = await AxiosInstance.get("expense-report/", { params });
      setData(res.data || []);
    } catch (err) {
      console.error("Error fetching expense report:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // GROUP DATA BY COST CATEGORY
  // =============================
  const groupedData = useMemo(() => {
    const groups = {};
    data.forEach((item) => {
      const category = item.cost_category || "Uncategorized";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }, [data]);

  // =============================
  // CATEGORY SUBTOTAL
  // =============================
  const getCategoryTotal = (items) =>
    items.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  // =============================
  // GRAND TOTAL
  // =============================
  const grandTotal = useMemo(
    () => data.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [data]
  );

  return (
    <div className="p-6 space-y-4">

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm font-medium mr-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium mr-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium mr-1">Cost Category</label>
          <select
            value={costCategory}
            onChange={(e) => setCostCategory(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {costCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className={`px-4 py-1.5 rounded text-sm text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Loading..." : "Apply"}
        </button>

        <button
          onClick={() =>
            navigate(
              `/reports/combined-expense/pdf?from=${fromDate}&to=${toDate}&category=${businessCategoryId || costCategory}`
            )
          }
          className="bg-gray-800 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-900"
        >
          PDF
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Voucher</th>
              <th className="border p-2">Account Title</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Description</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedData).map(([category, items]) => {
              const categoryTotal = getCategoryTotal(items);
              return (
                <React.Fragment key={category}>
                  <tr className="bg-gray-200 font-semibold">
                    <td colSpan="6" className="border p-2">{category}</td>
                  </tr>

                  {items.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{row.date}</td>
                      <td className="border p-2">{row.voucher_no}</td>
                      <td className="border p-2">{row.account_title}</td>
                      <td className="border p-2">{row.cost_category}</td>
                      <td className="border p-2">{row.description}</td>
                      <td className="border p-2 text-right">{Number(row.amount).toFixed(2)}</td>
                    </tr>
                  ))}

                  <tr className="bg-yellow-100 font-semibold">
                    <td colSpan="5" className="border p-2 text-right">Subtotal ({category})</td>
                    <td className="border p-2 text-right">{categoryTotal.toFixed(2)}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>

          <tfoot className="bg-gray-300 font-bold">
            <tr>
              <td colSpan="5" className="border p-2 text-right">Grand Total</td>
              <td className="border p-2 text-right">{grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
