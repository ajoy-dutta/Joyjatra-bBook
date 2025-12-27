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

    AxiosInstance.get("assets/", {
      params: {
        business_category: selectedCategory.id,
      },
    })
      .then((res) => setAssets(res.data || []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [selectedCategory?.id]);

  const totalValue = assets.reduce(
    (sum, a) => sum + Number(a.total_price || 0),
    0
  );

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets Report</h1>
          <p className="text-sm text-slate-500">
            Complete overview of business assets
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
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Asset Name</th>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Purchase Date</th>
              <th className="px-3 py-2 text-right">Total Qty</th>
              <th className="px-3 py-2 text-right">Damaged Qty</th>
              <th className="px-3 py-2 text-right">Usable Qty</th>
              <th className="px-3 py-2 text-right">Unit Price</th>
              <th className="px-3 py-2 text-right">Total Value</th>
              <th className="px-3 py-2 text-left">Created At</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="10" className="text-center py-6 text-slate-400">
                  Loading assets…
                </td>
              </tr>
            )}

            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-6 text-slate-400">
                  No assets found
                </td>
              </tr>
            )}

            {assets.map((a) => (
              <tr key={a.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2">{a.code || "-"}</td>
                <td className="px-3 py-2">{a.business_category_name}</td>
                <td className="px-3 py-2">{a.purchase_date}</td>
                <td className="px-3 py-2 text-right">{a.total_qty}</td>
                <td className="px-3 py-2 text-right">{a.damaged_qty}</td>
                <td className="px-3 py-2 text-right">{a.usable_qty}</td>
                <td className="px-3 py-2 text-right">
                  {Number(a.unit_price || 0).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {Number(a.total_price || 0).toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  {new Date(a.created_at).toLocaleDateString()}
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
