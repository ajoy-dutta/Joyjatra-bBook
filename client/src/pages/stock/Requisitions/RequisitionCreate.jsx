import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";

export default function RequisitionCreate() {
  const navigate = useNavigate();
  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  const [form, setForm] = useState({
    business_category: selectedCategory?.id || null,
    requisition_date: new Date().toISOString().slice(0, 10),
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

  const submit = async (e) => {
    e.preventDefault();

    if (!form.business_category) return toast.error("Business category missing");
    if (!form.requisition_date) return toast.error("Date is required");
    if (!form.requisite_name.trim()) return toast.error("Requisite name is required");
    if (!form.item_name.trim()) return toast.error("Item name is required");
    if (!form.item_number || form.item_number <= 0)
      return toast.error("Item number must be positive");

    try {
      await AxiosInstance.post("requisitions/", form);
      toast.success("Requisition created");
      navigate("/stock/requisitions");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create requisition");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Create Requisition</h1>
          <p className="text-sm text-slate-500">
            Requisition No will be generated automatically after save.
          </p>
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
              placeholder="Office items / Raw materials / etc."
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Item</label>
            <input
              name="item_name"
              value={form.item_name}
              onChange={onChange}
              placeholder="Tissue box / Pen / Flour..."
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
              placeholder="Optional remarks..."
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
