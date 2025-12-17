import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";

export default function RequisitionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  const [loading, setLoading] = useState(true);
  const [requisitionNo, setRequisitionNo] = useState("");

  // products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");

  const [form, setForm] = useState({
    requisition_date: "",
    requisite_name: "",
    product: "", // ✅ product id
    item_number: 1,
    remarks: "",
    status: false, // approved?
  });

  const isApproved = !!form.status;

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      if (!selectedCategory?.id) {
        setProducts([]);
        return;
      }

      // 🔧 change endpoint if your products endpoint is different
      const res = await AxiosInstance.get("products/", {
        params: { business_category: selectedCategory.id },
      });

      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setProducts(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  const loadRequisition = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get(`requisitions/${id}/`);
      const r = res.data;

      setRequisitionNo(r.requisition_no || "");

      setForm({
        requisition_date: r.requisition_date || "",
        requisite_name: r.requisite_name || "",
        product: r.product ? String(r.product) : "", // ✅ requisition.product id
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
    fetchProducts();
    loadRequisition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedCategory?.id]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return products;

    return products.filter((p) => {
      const name = (p.product_name || p.name || p.title || "").toLowerCase();
      const sku = (p.sku || p.code || "").toLowerCase();
      return name.includes(term) || sku.includes(term);
    });
  }, [products, productSearch]);

  const selectedProductObj = useMemo(() => {
    const pid = Number(form.product);
    if (!pid) return null;
    return products.find((p) => p.id === pid) || null;
  }, [form.product, products]);

  const submit = async (e) => {
    e.preventDefault();

    if (isApproved) {
      return toast.error("Approved requisition cannot be edited.");
    }

    if (!form.requisition_date) return toast.error("Date is required");
    if (!form.requisite_name.trim())
      return toast.error("Requisite name is required");
    if (!form.product) return toast.error("Please select a product");
    if (!form.item_number || form.item_number <= 0)
      return toast.error("Item number must be positive");

    const payload = {
      requisition_date: form.requisition_date,
      requisite_name: form.requisite_name,
      product: Number(form.product),
      item_number: Number(form.item_number),
      remarks: form.remarks,
      // status must NOT be changed here
    };

    try {
      await AxiosInstance.patch(`requisitions/${id}/`, payload);
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

      {isApproved && (
        <div className="mt-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm">
          This requisition is <b>Approved</b>. Editing is locked because stock has
          already been deducted.
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              name="requisition_date"
              value={form.requisition_date}
              onChange={onChange}
              disabled={isApproved}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 disabled:bg-slate-50"
            />
          </div>

          {/* Status readonly */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <input
              readOnly
              value={isApproved ? "Approved" : "Pending"}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700"
            />
            <p className="text-xs text-slate-500 mt-1">
              Approval happens from the Requisition List (deducts stock).
            </p>
          </div>

          {/* Requisite name */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Name of Requisite</label>
            <input
              name="requisite_name"
              value={form.requisite_name}
              onChange={onChange}
              disabled={isApproved}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 disabled:bg-slate-50"
            />
          </div>

          {/* Product search */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Find Product</label>
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search product by name / sku..."
              disabled={isApproved}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 disabled:bg-slate-50"
            />
          </div>

          {/* Product dropdown */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Product</label>
            <select
              name="product"
              value={form.product}
              onChange={onChange}
              disabled={productsLoading || isApproved}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 disabled:bg-slate-50"
            >
              <option value="">
                {productsLoading ? "Loading products..." : "Select a product"}
              </option>

              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {(p.product_name || p.name || p.title || "Unnamed Product") +
                    (p.sku || p.code ? ` • ${(p.sku || p.code)}` : "")}
                </option>
              ))}
            </select>

            {selectedProductObj ? (
              <p className="text-xs text-slate-500 mt-1">
                Selected:{" "}
                <span className="font-semibold text-slate-700">
                  {selectedProductObj.product_name ||
                    selectedProductObj.name ||
                    selectedProductObj.title}
                </span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">
                Choose a product that exists in inventory.
              </p>
            )}
          </div>

          {/* Qty */}
          <div>
            <label className="text-sm font-medium">Item Number</label>
            <input
              type="number"
              name="item_number"
              value={form.item_number}
              onChange={onChange}
              min={1}
              disabled={isApproved}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 disabled:bg-slate-50"
            />
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              rows={4}
              disabled={isApproved}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 disabled:bg-slate-50"
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
            disabled={isApproved}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
