import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";

export default function RequisitionList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  const fetchRows = async () => {
    try {
      setLoading(true);
      if (!selectedCategory?.id) {
        setRows([]);
        return;
      }

      const params = { business_category: selectedCategory.id };
      if (statusFilter === "Approved") params.status = "true";
      if (statusFilter === "Pending") params.status = "false";

      const res = await AxiosInstance.get("requisitions/", { params });
      setRows(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load requisitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id, statusFilter]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return rows;
    return rows.filter((r) => {
      const a = (r.requisition_no || "").toLowerCase();
      const b = (r.requisite_name || "").toLowerCase();
      const c = (r.item_name || "").toLowerCase();
      return a.includes(term) || b.includes(term) || c.includes(term);
    });
  }, [rows, search]);

  const toggleStatus = async (row) => {
    try {
      const res = await AxiosInstance.patch(`requisitions/${row.id}/`, {
        status: !row.status,
      });
      setRows((prev) => prev.map((x) => (x.id === row.id ? res.data : x)));
      toast.success("Status updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this requisition?")) return;
    try {
      await AxiosInstance.delete(`requisitions/${id}/`);
      setRows((prev) => prev.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-4">Loading requisitions...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Requisitions</h1>
          <p className="text-sm text-slate-500">
            Requisition documents for raw materials & office items.
          </p>
        </div>

        <Link
          to="/stock/requisitions/create"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-fit"
        >
          + Create Requisition
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search REQ no / requisite / item..."
          className="w-full md:w-[420px] border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-2 text-sm"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="p-3 border-b">REQ No</th>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Requisite Name</th>
                <th className="p-3 border-b">Item</th>
                <th className="p-3 border-b text-right">Item No.</th>
                <th className="p-3 border-b">Remarks</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 border-b font-medium">{r.requisition_no}</td>
                  <td className="p-3 border-b">
                    {r.requisition_date
                      ? new Date(r.requisition_date).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="p-3 border-b">{r.requisite_name}</td>
                  <td className="p-3 border-b">{r.item_name}</td>
                  <td className="p-3 border-b text-right">{r.item_number}</td>
                  <td className="p-3 border-b max-w-[260px] truncate" title={r.remarks || ""}>
                    {r.remarks || "—"}
                  </td>
                  <td className="p-3 border-b">
                    <button
                      onClick={() => toggleStatus(r)}
                      className={`px-2 py-1 rounded-md text-xs border ${
                        r.status
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}
                    >
                      {r.status ? "Approved" : "Pending"}
                    </button>
                  </td>
                  <td className="p-3 border-b text-right space-x-2">
                    <Link
                      to={`/stock/requisitions/${r.id}/edit`}
                      className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteRow(r.id)}
                      className="px-2 py-1 rounded border border-slate-200 hover:border-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={8}>
                    No requisitions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
