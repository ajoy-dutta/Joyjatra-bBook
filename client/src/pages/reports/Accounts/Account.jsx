import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../components/AxiosInstance";

export default function Account() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          business_category: selectedCategory.id,
          ...(fromDate && { from_date: fromDate }),
          ...(toDate && { to_date: toDate }),
        };

        const [incomeRes, expenseRes] = await Promise.all([
          AxiosInstance.get("/income-report/", { params }),
          AxiosInstance.get("/expense-report/", { params }),
        ]);

        setIncomeData(
          Array.isArray(incomeRes.data) ? incomeRes.data : []
        );
        setExpenseData(
          Array.isArray(expenseRes.data) ? expenseRes.data : []
        );

        console.log("Expense Data:", expenseRes.data);
        console.log("Income Data:", incomeRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, fromDate, toDate]);

  if (loading) return <p>Loading...</p>;

  const incomeTotal = incomeData.reduce(
    (acc, item) => acc + parseFloat(item.amount || 0),
    0
  );
  const expenseTotal = expenseData.reduce(
    (acc, item) => acc + parseFloat(item.amount || 0),
    0
  );
  const adjustment = Math.abs(incomeTotal - expenseTotal);
  const maxRows = Math.max(incomeData.length, expenseData.length);

  // Function to open PDF in a new tab
  const openPDF = () => {
    const params = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate,
      category: selectedCategory?.id || "",
    });
    const url = `/reports/accounts/pdf?${params.toString()}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-4 overflow-x-auto">
      {/* Filters + PDF Button */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* From Date */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="py-0 mt-5 px-4 text-sm font-medium rounded-md bg-gray-100 text-gray-700 border hover:bg-gray-200 transition"
          >
            Reset
          </button>
        </div>

        {/* PDF Button */}
        <button
          onClick={openPDF}
          className="h-[38px] px-4 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          View PDF
        </button>
      </div>

      {/* Account Table */}
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Income Date</th>
            <th className="border px-2 py-1">Source</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1 text-right">Amount</th>

            <th className="border px-2 py-1">Expense Date</th>
            <th className="border px-2 py-1">Source</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1 text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {[...Array(maxRows)].map((_, index) => {
            const income = incomeData[index];
            const expense = expenseData[index];

            return (
              <tr key={index}>
                <td className="border px-2 py-1">{income?.date || ""}</td>
                <td className="border px-2 py-1">{income?.income_source || ""}</td>
                <td className="border px-2 py-1">{income?.description || ""}</td>
                <td className="border px-2 py-1 text-right">
                  {income ? parseFloat(income.amount).toFixed(2) : ""}
                </td>

                <td className="border px-2 py-1">{expense?.date || ""}</td>
                <td className="border px-2 py-1">{expense?.cost_category || ""}</td>
                <td className="border px-2 py-1">{expense?.description || ""}</td>
                <td className="border px-2 py-1 text-right">
                  {expense ? parseFloat(expense.amount).toFixed(2) : ""}
                </td>
              </tr>
            );
          })}

          <tr className="font-semibold bg-gray-200">
            <td className="border px-2 py-1">Total</td>
            <td colSpan={2} className="border"></td>
            <td className="border px-2 py-1 text-right">{incomeTotal.toFixed(2)}</td>

            <td className="border px-2 py-1">Total</td>
            <td colSpan={2} className="border"></td>
            <td className="border px-2 py-1 text-right">{expenseTotal.toFixed(2)}</td>
          </tr>

          {incomeTotal !== expenseTotal && (
            <tr className="font-semibold bg-yellow-100">
              <td className="border px-2 py-1">Adjustment</td>
              <td colSpan={2} className="border"></td>
              <td className="border px-2 py-1 text-right">{incomeTotal > expenseTotal ? adjustment.toFixed(2) : ""}</td>

              <td className="border px-2 py-1">Adjustment</td>
              <td colSpan={2} className="border"></td>
              <td className="border px-2 py-1 text-right">{expenseTotal > incomeTotal ? adjustment.toFixed(2) : ""}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
