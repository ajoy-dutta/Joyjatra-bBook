import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../../components/AxiosInstance";

export default function SalesReport() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();

  const fetchReport = async () => {
    const res = await AxiosInstance.get("/sale-report/", {
      params: {
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      },
    });

    setSales(res.data.sales);
    setSummary(res.data.summary);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-6 space-y-4">
      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded shadow flex gap-4 items-end">
        <div>
          <label className="text-sm font-medium mr-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium mr-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-2 py-1 text-sm"
          />
        </div>

        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
        >
          Apply
        </button>

        <button
          onClick={() =>
            navigate(
              `/reports/sales-report/pdf?from=${fromDate}&to=${toDate}`
            )
          }
          className="bg-gray-800 text-white px-4 py-1.5 rounded text-sm"
        >
          PDF
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Invoice</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2 text-right">Total</th>
              <th className="border p-2 text-right">Paid</th>
              <th className="border p-2 text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const paid = sale.payments.reduce(
                (s, p) => s + Number(p.paid_amount),
                0
              );
              return (
                <tr key={sale.id}>
                  <td className="border p-2">{sale.sale_date}</td>
                  <td className="border p-2">{sale.invoice_no}</td>
                  <td className="border p-2">{sale.customer?.customer_name}</td>
                  <td className="border p-2 text-right">
                    {Number(sale.total_amount).toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    {paid.toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    {(sale.total_amount - paid).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td colSpan="3" className="border p-2 text-right">
                Grand Total
              </td>
              <td className="border p-2 text-right">
                {summary.total_sales_amount?.toFixed(2)}
              </td>
              <td className="border p-2 text-right">
                {summary.total_paid_amount?.toFixed(2)}
              </td>
              <td className="border p-2 text-right">
                {summary.total_due_amount?.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
