import { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import { useNavigate } from "react-router-dom";


export default function JournalList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(
      JSON.parse(localStorage.getItem("business_category")) || null
    );


  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("manual-journals/",{
        params: {
          business_category: selectedCategory.id,
        },
      });
      setJournals(res.data);
    } catch (error) {
      console.error("Error fetching journals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading journals...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Journal Entries
      </h2>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 text-sm">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Total Debit</th>
              <th className="px-4 py-3 text-right">Total Credit</th>
              <th className="px-4 py-3 text-center">voucher</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {journals.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                  No journal entries found
                </td>
              </tr>
            )}

            {journals.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 whitespace-nowrap">{j.date}</td>
                <td className="px-4 py-2">{j.reference || "-"}</td>
                <td className="px-4 py-2">{j.narration || "-"}</td>
                <td className="px-4 py-2 text-right">
                  {j.total_debit.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {j.total_credit.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() =>
                      navigate(`/accounting/journal-voucher/${j.id}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}