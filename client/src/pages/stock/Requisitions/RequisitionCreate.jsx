import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";

export default function RequisitionCreate() {
  const navigate = useNavigate();
  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  // ✅ products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");

  const [form, setForm] = useState({
    business_category: selectedCategory?.id || null,
    requisition_date: new Date().toISOString().slice(0, 10),
    requisite_name: "",
    product: "", // ✅ store product id here
    item_number: 1,
    remarks: "",
    status: false, // keep false on create (recommended)
  });

  // ✅ fetch products for dropdown
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      if (!selectedCategory?.id) {
        setProducts([]);
        return;
      }

      // 🔧 Change this endpoint if yours is different:
      // Example: "dashboard/products/" or "stock/products/"
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

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return products;

    return products.filter((p) => {
      const name =
        (p.name || p.product_name || p.title || "").toLowerCase();
      const sku = (p.sku || p.code || "").toLowerCase();
      return name.includes(term) || sku.includes(term);
    });
  }, [products, productSearch]);

  const selectedProductObj = useMemo(() => {
    const id = Number(form.product);
    if (!id) return null;
    return products.find((p) => p.id === id) || null;
  }, [form.product, products]);

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
    if (!form.requisite_name.trim())
      return toast.error("Requisite name is required");

    if (!form.product) return toast.error("Please select a product");
    if (!form.item_number || form.item_number <= 0)
      return toast.error("Item number must be positive");

    // ✅ Do NOT allow approving from create page (recommended)
    // Approval should happen from list -> approve button (deducts stock)
    const payload = {
      business_category: form.business_category,
      requisition_date: form.requisition_date,
      requisite_name: form.requisite_name,
      product: Number(form.product),
      item_number: Number(form.item_number),
      remarks: form.remarks,
      status: false,
    };

    try {
      await AxiosInstance.post("requisitions/", payload);
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
          {/* Date */}
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

          {/* Status (readonly on create) */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <input
              value="Pending"
              readOnly
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Approve from Requisition List to deduct stock.
            </p>
          </div>

          {/* Requisite Name */}
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

          {/* Product search */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Find Product</label>
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search product by name / sku..."
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          {/* Product select */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Product</label>
            <select
              name="product"
              value={form.product}
              onChange={onChange}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2"
              disabled={productsLoading}
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
                Choose a product that already exists in stock.
              </p>
            )}
          </div>

          {/* Quantity */}
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

          {/* Remarks */}
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
