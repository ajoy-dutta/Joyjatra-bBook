import { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import { useNavigate, useLocation } from "react-router-dom";

/* ---------------- UI Components ---------------- */
const Box = ({ children }) => <div className="border rounded-md p-4 bg-white shadow-sm">{children}</div>;
const Label = ({ children }) => <label className="block text-sm font-semibold mb-1">{children}</label>;
const Input = (props) => (
  <input
    {...props}
    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
  />
);
const Button = ({ children, ...rest }) => (
  <button
    {...rest}
    className="px-4 py-2 rounded border shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition"
    type="button"
  >
    {children}
  </button>
);
const currency = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Order() {
  const today = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const orderId = query.get("orderId"); // get orderId from URL

  const [orderDate, setOrderDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [advancePayment, setAdvancePayment] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  const selectedCategory = JSON.parse(localStorage.getItem("business_category"));

  /* ---------------- Load Products & Stocks ---------------- */
  useEffect(() => {
    if (!selectedCategory?.id) return;
    (async () => {
      try {
        const [p, s] = await Promise.all([
          AxiosInstance.get(`products/?business_category=${selectedCategory.id}`),
          AxiosInstance.get(`stocks/?business_category=${selectedCategory.id}`),
        ]);
        setProducts(Array.isArray(p.data) ? p.data : p.data?.results || []);
        setStocks(s.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      }
    })();
  }, []);

  /* ---------------- Companies ---------------- */
  const companies = useMemo(() => [...new Set(products.map(p => p.company_name).filter(Boolean))], [products]);
  const productsForCompany = useMemo(() => products.filter(p => p.company_name === companyName), [companyName, products]);

  /* ---------------- Load order for editing ---------------- */
  useEffect(() => {
    if (!orderId || products.length === 0) return;

    (async () => {
      try {
        const { data } = await AxiosInstance.get(`orders/${orderId}/`);

        setOrderDate(data.order_date || today);
        setDueDate(data.due_date || "");
        setAdvancePayment(data.advance_payment || 0);
        setRemarks(data.remarks || "");
        setCompanyName(data.company_name || "");

        // Map items to rows
        const mapped = (data.items || []).map(it => ({
          product_id: it.product_id ?? it.product,
          product_name: it?.product_details?.product_name ?? "",
          part_no: it?.product_details?.part_no ?? "",
          qty: Number(it.quantity || 0),
        }));
        setRows(mapped);
      } catch (err) {
        console.error(err);
        alert("Failed to load order data.");
      }
    })();
  }, [orderId, products]);

  /* ---------------- Submit Order ---------------- */
  const submit = async () => {
    if (!companyName) return alert("Select company");
    if (!rows.length) return alert("Add at least one product");

    const payload = {
      company_name: companyName,
      order_date: orderDate,
      due_date: dueDate || null,
      advance_payment: advancePayment || 0,
      remarks,
      items: rows.map(r => ({ product_id: r.product_id, quantity: r.qty })),
    };

    try {
      setSaving(true);
      if (orderId) {
        await AxiosInstance.put(`orders/${orderId}/`, payload); // update
        alert("Order updated successfully");
      } else {
        await AxiosInstance.post("orders/", payload); // create
        alert("Order created successfully");
      }
      navigate("/purchases/order-list");
    } catch (err) {
      console.error(err);
      alert("Order submission failed");
    } finally {
      setSaving(false);
    }
  };

  const goToList = () => navigate("/purchases/order-list");

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{orderId ? "Edit Order" : "New Order"}</h1>
        <button onClick={goToList} className="px-2 bg-emerald-500 text-sm text-white rounded shadow hover:bg-emerald-600 transition">
          Order List
        </button>
      </div>

      {/* Order Info */}
      <Box>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Order Date</Label>
            <Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label>Advance Payment</Label>
            <Input type="number" value={advancePayment} onChange={e => setAdvancePayment(e.target.value)} />
          </div>
          <div>
            <Label>Remarks</Label>
            <Input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>
        </div>
      </Box>

      {/* Company Selection */}
      <h2 className="mt-6 mb-2 font-semibold">Select Company</h2>
      <Box>
        <Label>Company</Label>
        <select
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
        >
          <option value="">-- Select Company --</option>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Box>

      {/* Products Table */}
      {companyName && (
        <>
          <h2 className="mt-6 mb-2 font-semibold">Products</h2>
          <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border text-left">Product Name</th>
                  <th className="p-2 border text-left">Product Code</th>
                  <th className="p-2 border text-right">Stock</th>
                  <th className="p-2 border text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {productsForCompany.map((p, i) => {
                  const stock = stocks.find(s => String(s.product?.id || s.product) === String(p.id));
                  const row = rows.find(r => r.product_id === p.id);
                  const qty = row?.qty || "";

                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="border p-2 text-center">{i + 1}</td>
                      <td className="border p-2">{p.product_name}</td>
                      <td className="border p-2">{p.product_code}</td>
                      <td className="border p-2 text-right">{stock?.current_stock_quantity || 0}</td>
                      <td className="border p-2 text-right">
                        <input
                          type="number"
                          min={0}
                          className="border rounded px-2 py-1 w-20 text-right"
                          value={qty}
                          onChange={e => {
                            const newQty = Number(e.target.value);
                            setRows(prev => {
                              const copy = [...prev];
                              const idx = copy.findIndex(r => r.product_id === p.id);
                              if (idx >= 0) copy[idx].qty = newQty;
                              else copy.push({ product_id: p.id, product_name: p.product_name, part_no: p.part_no, qty: newQty });
                              return copy.filter(r => r.qty > 0);
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <Button onClick={submit} disabled={saving}>
          {saving ? "Saving..." : orderId ? "Update Order" : "Submit Order"}
        </Button>
      </div>
    </div>
  );
}
