import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";

export default function RequisitionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requisitionNo, setRequisitionNo] = useState("");

  const [form, setForm] = useState({
    requisition_date: "",
    requisite_name: "",
    item_name: "",
    item_number: 1,
    remarks: "",
    status: false,
  });

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get(`requisitions/${id}/`);
      const r = res.data;
      setRequisitionNo(r.requisition_no || "");
      setForm({
        requisition_date: r.requisition_date || "",
        requisite_name: r.requisite_name || "",
        item_name: r.item_name || "",
        item_number: r.item_number ?? 1,
        remarks: r.remarks || "",
        status: !!r.status,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load requisition");
      navigate("/stock/requisitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.requisition_date) return toast.error("Date is required");
    if (!form.requisite_name.trim()) return toast.error("Requisite name is required");
    if (!form.item_name.trim()) return toast.error("Item name is required");
    if (!form.item_number || form.item_number <= 0)
      return toast.error("Item number must be positive");

    try {
      await AxiosInstance.patch(`requisitions/${id}/`, form);
      toast.success("Requisition updated");
      navigate("/stock/requisitions");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update requisition");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Edit Requisition</h1>
          <p className="text-sm text-slate-500">{requisitionNo}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-400 text-sm"
        >
          Back
        </button>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              name="requisition_date"
              value={form.requisition_date}
              onChange={onChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status ? "true" : "false"}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value === "true" }))
              }
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            >
              <option value="false">Pending</option>
              <option value="true">Approved</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Name of Requisite</label>
            <input
              name="requisite_name"
              value={form.requisite_name}
              onChange={onChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Item</label>
            <input
              name="item_name"
              value={form.item_name}
              onChange={onChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Item Number</label>
            <input
              type="number"
              name="item_number"
              value={form.item_number}
              onChange={onChange}
              min={1}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              rows={4}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/stock/requisitions")}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
