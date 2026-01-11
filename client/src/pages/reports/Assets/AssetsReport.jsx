import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AxiosInstance from "../../../components/AxiosInstance";

export default function AssetsReport() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [productName, setProductName] = useState("");
  const [banner, setBanner] = useState(null);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  const fetchAssets = async (extraParams = {}) => {
    if (!selectedCategory?.id) {
      setAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        business_category: selectedCategory.id,
        productname: productName || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        ...extraParams,
      };
      const res = await AxiosInstance.get("assets/", { params });
      setAssets(res.data || []);
    } catch (e) {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // fetch banner for selected category so PDF can reuse it
    const loadBanner = async () => {
      if (!selectedCategory?.id) return setBanner(null);
      try {
        const res = await AxiosInstance.get(`/business-categories/${selectedCategory.id}/`);
        setBanner(res.data);
      } catch (e) {
        setBanner(null);
      }
    };
    loadBanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  const onSearch = (e) => {
    e?.preventDefault();
    fetchAssets();
  };

  const onResetFilters = () => {
    setFromDate("");
    setToDate("");
    setProductName("");
    fetchAssets();
  };

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
          state={{ assets, banner, fromDate, toDate, productName }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
        >
          View PDF
        </Link>
      </div>

      {/* FILTERS */}
      <form onSubmit={onSearch} className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-600">Product Name</label>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} className="border px-2 py-1 rounded" placeholder="Search name" />
        </div>



        <div>
          <label className="block text-xs text-slate-600">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>

        <div>
          <label className="block text-xs text-slate-600">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>

        <div className="ml-auto flex gap-2">
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
          <button type="button" onClick={onResetFilters} className="px-3 py-1 bg-gray-100 rounded">Reset</button>
        </div>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Asset Name</th>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Model</th>
              <th className="px-3 py-2 text-left">Brand</th>
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
                <td colSpan="12" className="text-center py-6 text-slate-400">
                  Loading assets…
                </td>
              </tr>
            )}

            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan="12" className="text-center py-6 text-slate-400">
                  No assets found
                </td>
              </tr>
            )}

            {assets.map((a) => (
              <tr key={a.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2">{a.code || "-"}</td>
                <td className="px-3 py-2">{a.model || "-"}</td>
                <td className="px-3 py-2">{a.brand || "-"}</td>
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
