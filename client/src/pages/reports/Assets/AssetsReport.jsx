import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AxiosInstance from "../../../components/AxiosInstance";

export default function AssetsReport() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  useEffect(() => {
    if (!selectedCategory?.id) {
      setAssets([]);
      setLoading(false);
      return;
    }

    AxiosInstance.get("/reports/assets-report/", {
      params: {
        business_category: selectedCategory.id,
      },
    })
      .then((res) => {
        setAssets(res.data.assets || []);
      })
      .catch((err) => {
        console.error("Assets fetch error:", err);
        setAssets([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory?.id]);

  const totalValue = assets.reduce(
    (sum, a) => sum + Number(a.value || 0),
    0
  );

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets Report</h1>
          <p className="text-sm text-slate-500">
            Detailed overview of business assets.
          </p>
        </div>

        <Link
          to="/reports/assets/pdf"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
        >
          View PDF
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Asset</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-right">Quantity</th>
              <th className="px-4 py-2 text-right">Value</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-400">
                  Loading assets…
                </td>
              </tr>
            )}

            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-400">
                  No assets found
                </td>
              </tr>
            )}

            {assets.map((a, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{a.asset_name}</td>
                <td className="px-4 py-2">{a.category}</td>
                <td className="px-4 py-2 text-right">{a.quantity}</td>
                <td className="px-4 py-2 text-right">
                  {Number(a.value).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div className="bg-white rounded-xl border p-4 flex justify-end">
        <div className="text-right">
          <div className="text-sm text-slate-500">Total Asset Value</div>
          <div className="text-lg font-semibold">
            {totalValue.toFixed(2)}
          </div>
        </div>
      </div>

    </div>
  );
}
