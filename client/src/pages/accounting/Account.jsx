import React, { useState, useEffect } from "react";
import AxiosInstance from "../../components/AxiosInstance"


export default function Account() {
const [incomeData, setIncomeData] = useState([]);
const [expenseData, setExpenseData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        AxiosInstance.get("/sale-report/"),
        AxiosInstance.get("/expense-report/"),
      ]);

      console.log("incomeRes",incomeRes.data.sales)

      setIncomeData(Array.isArray(incomeRes.data.sales) ? incomeRes.data.sales : []);
      setExpenseData(Array.isArray(expenseRes.data) ? expenseRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



console.log("incomeData",incomeData)

if (loading) return <p>Loading...</p>;

const incomeTotal = incomeData.reduce(
(acc, item) => acc + parseFloat(item.total_payable_amount || 0),
0
);
const expenseTotal = expenseData.reduce(
(acc, item) => acc + parseFloat(item.amount || 0),
0
);

const adjustment = Math.abs(incomeTotal - expenseTotal);
const maxRows = Math.max(incomeData.length, expenseData.length);

return ( <div className="p-4 overflow-x-auto"> <table className="min-w-full border border-gray-300 text-sm"> <thead className="bg-gray-100"> <tr> <th className="border px-2 py-1">Income Date</th> <th className="border px-2 py-1">Source</th> <th className="border px-2 py-1">Description</th> <th className="border px-2 py-1 text-right">Amount</th>

        <th className="border px-2 py-1">Expense Date</th>
        <th className="border px-2 py-1">Voucher</th>
        <th className="border px-2 py-1">Source/Description</th>
        <th className="border px-2 py-1 text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {[...Array(maxRows)].map((_, index) => {
        const income = incomeData[index];
        const expense = expenseData[index];

        return (
          <tr key={index}>
            {/* Income columns */}
            <td className="border px-2 py-1">{income ? income.sale_date : ""}</td>
            <td className="border px-2 py-1">Products Sell</td>
            <td className="border px-2 py-1">{income ? income.customer.customer_name : ""}</td>
            <td className="border px-2 py-1 text-right">
              {income ? parseFloat(income.total_payable_amount).toFixed(2) : ""}
            </td>

            {/* Expense columns */}
            <td className="border px-2 py-1">{expense ? expense.date : ""}</td>
            <td className="border px-2 py-1">{expense ? expense.voucher_no : ""}</td>
            <td className="border px-2 py-1">{expense ? expense.cost_category : expense.description}</td>
            <td className="border px-2 py-1 text-right">
              {expense ? parseFloat(expense.amount).toFixed(2) : ""}
            </td>
          </tr>
        );
      })}

      {/* Totals */}
      <tr className="font-semibold bg-gray-200">
        <td className="border px-2 py-1">Total</td>
        <td className="border px-2 py-1" colSpan={2}></td>
        <td className="border px-2 py-1 text-right">{incomeTotal.toFixed(2)}</td>

        <td className="border px-2 py-1">Total</td>
        <td className="border px-2 py-1" colSpan={2}></td>
        <td className="border px-2 py-1 text-right">{expenseTotal.toFixed(2)}</td>
      </tr>

      {/* Adjustment if totals differ */}
      {incomeTotal !== expenseTotal && (
        <tr className="font-semibold bg-yellow-100">
          <td className="border px-2 py-1">Adjustment</td>
          <td className="border px-2 py-1" colSpan={2}></td>
          <td className="border px-2 py-1 text-right">{incomeTotal > expenseTotal ? adjustment.toFixed(2) : ""}</td>

          <td className="border px-2 py-1">Adjustment</td>
          <td className="border px-2 py-1" colSpan={2}></td>
          <td className="border px-2 py-1 text-right">{expenseTotal > incomeTotal ? adjustment.toFixed(2) : ""}</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

);
}
