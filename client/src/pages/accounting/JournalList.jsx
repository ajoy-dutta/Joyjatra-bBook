import { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import { useNavigate } from "react-router-dom";

export default function OpeningBalanceReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const businessCategory = localStorage.getItem("business_category");

  const fetchOpeningBalances = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("opening-balances/", {
        params: {
          business_category: businessCategory,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load opening balances", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    navigate("/accounting/journal-voucher/pdf");
  };

  useEffect(() => {
    fetchOpeningBalances();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading report...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Opening Balance Report
        </h2>

        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">As of Date</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Entry Type</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Remarks</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                  No opening balances found
                </td>
              </tr>
            )}

            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{item.as_of_date}</td>
                <td className="px-4 py-2 font-medium">
                  {item.account}
                </td>
                <td className="px-4 py-2">
                  {item.entry_type || "-"}
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {parseFloat(item.amount).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  {item.remarks || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
