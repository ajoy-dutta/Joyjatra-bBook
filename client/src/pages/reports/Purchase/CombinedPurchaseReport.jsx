import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../../components/AxiosInstance";

export default function CombinedPurchaseReport() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [productName, setProductName] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get("purchase-report/", {
        params: {
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          product_name: productName || undefined,
          business_category: selectedCategory?.id || undefined,
        },
      });
      setData(res.data.purchases || []);
      console.log("Fetched data:", res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, productName, selectedCategory]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Combined Purchase Report</h2>

      {/* FILTERS */}
      <div className="flex gap-2 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Product</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Search product"
            className="border px-2 py-1 rounded"
          />
        </div>

        <button
          onClick={fetchData}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Apply
        </button>
      </div>

      {/* PDF BUTTON */}
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded mb-4"
        onClick={() => {
          navigate(
            `/reports/combined-purchase/pdf?from=${fromDate}&to=${toDate}&product=${productName}`
          );
        }}
      >
        Generate PDF
      </button>

      {/* TABLE */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Invoice</th>
              <th className="border px-2 py-1">Product</th>
              <th className="border px-2 py-1">Vendor</th>
              <th className="border px-2 py-1 text-right">Qty</th>
              <th className="border px-2 py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{row.date}</td>
                <td className="border px-2 py-1">{row.invoice_no}</td>
                <td className="border px-2 py-1">{row.product_name}</td>
                <td className="border px-2 py-1">{row.vendor}</td>
                <td className="border px-2 py-1 text-right">{row.quantity}</td>
                <td className="border px-2 py-1 text-right">
                  {Number(row.purchase_amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
