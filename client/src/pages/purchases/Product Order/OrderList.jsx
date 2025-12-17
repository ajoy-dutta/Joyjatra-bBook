import { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import { useNavigate } from "react-router-dom";

/* UI bits */
const Input = (p) => (
  <input
    {...p}
    className={
      "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 " +
      (p.className || "")
    }
  />
);
const Button = ({ children, className, ...rest }) => (
  <button
    {...rest}
    className={"px-4 py-2 rounded border shadow-sm active:scale-[.99] " + (className || "")}
    type="button"
  >
    {children}
  </button>
);

const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function downloadBlob(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function orderToCSV(order) {
  const rows = [];
  rows.push(["", "Order No", order.order_no]);
  rows.push(["", "Order Date", order.order_date]);
  rows.push(["", "Company", order.company_name || ""]);
  rows.push([""]);
  rows.push(["SL", "Part No", "Description", "Qty", "Unit"]);

  (order.items || []).forEach((item, i) => {
    rows.push([
      i + 1,
      item?.product_details?.part_no || "",
      item?.product_details?.product_name || "",
      item.quantity || 0,
      "pcs",
    ]);
  });

  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

function orderToPrintableHTML(order) {
  const bodyRows = (order.items || [])
    .map((it, idx) => {
      const part = it?.product_details?.part_no ?? "";
      const name = it?.product_details?.product_name ?? "";
      const qty = Number(it.quantity || 0);
      const price = Number(it.order_price || 0);
      return `<tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${idx + 1}</td>
        <td style="border:1px solid #000;padding:6px;">${part}</td>
        <td style="border:1px solid #000;padding:6px;">${name}</td>
        <td style="border:1px solid #000;padding:6px;text-align:right;">${qty}</td>
        <td style="border:1px solid #000;padding:6px;text-align:right;">${price.toFixed(2)}</td>
        <td style="border:1px solid #000;padding:6px;text-align:right;">${(qty * price).toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const totalQty = (order.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
  const totalAmount = (order.items || []).reduce(
    (s, it) => s + Number(it.quantity || 0) * Number(it.order_price || 0),
    0
  );

  return `<!doctype html><html><head><meta charset="utf-8"/><title>${order.order_no}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:24px}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #000;padding:6px}
    th{background:#f3f4f6;text-align:left}
    tfoot td{font-weight:bold}
    .right{text-align:right}
  </style></head>
  <body>
    <h1>Order ${order.order_no}</h1>
    <p><strong>Date:</strong> ${order.order_date} &nbsp;&nbsp; <strong>Company:</strong> ${order.company_name || ""}</p>
    <table>
      <thead>
        <tr>
          <th style="text-align:center;width:40px">#</th>
          <th>Part No</th>
          <th>Product</th>
          <th class="right">Qty</th>
          <th class="right">Price</th>
          <th class="right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows || `<tr><td colspan="6" style="text-align:center;">No items</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="right">Totals</td>
          <td class="right">${totalQty}</td>
          <td></td>
          <td class="right">${totalAmount.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <script>window.print()</script>
  </body></html>`;
}

export default function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await AxiosInstance.get("orders/");
      setOrders(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter(
      (o) =>
        String(o.order_no || "").toLowerCase().includes(t) ||
        (o.items || []).some((it) =>
          String(it?.product_details?.part_no || "").toLowerCase().includes(t)
        )
    );
  }, [orders, q]);

  const exportExcel = (order) => downloadBlob(`${order.order_no}.csv`, "text/csv;charset=utf-8", orderToCSV(order));
  const exportPdf = (order) => {
    const html = orderToPrintableHTML(order);
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return alert("Popup blocked. Allow popups for PDF export.");
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleEdit = (order_id) => {
    navigate(`/purchases/products-order?orderId=${order_id}`);
  };

  const handleDelete = async (order) => {
    if (!confirm(`Delete order ${order.order_no}?`)) return;
    try {
      await AxiosInstance.delete(`orders/${order.id}/`);
      await load();
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order List</h1>

      <div className="flex gap-2 items-center mb-4">
        <Input placeholder="Search by Order No or Part No" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button className="border-emerald-300" onClick={load}>Refresh</Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border w-14 text-center">SL.</th>
              <th className="p-2 border">Order No</th>
              <th className="p-2 border">Order date</th>
              <th className="p-2 border text-right">Items</th>
              <th className="p-2 border text-right">Quantity</th>
              <th className="p-2 border text-right">Total Amount</th>
              <th className="p-2 border text-center">Excel</th>
              <th className="p-2 border text-center">PDF</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-3 text-center" colSpan={9}>Loading...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td className="p-3 text-center text-gray-500" colSpan={9}>No orders found</td></tr>}
            {!loading && filtered.map((o, idx) => {
              const totalQty = (o.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
              const totalAmount = (o.items || []).reduce((s, it) => s + Number(it.quantity || 0) * Number(it.order_price || 0), 0);
              return (
                <tr key={o.id}>
                  <td className="border p-2 text-center">{idx + 1}.</td>
                  <td className="border p-2">{o.order_no}</td>
                  <td className="border p-2">{o.order_date}</td>
                  <td className="border p-2 text-right">{o.items?.length || 0}</td>
                  <td className="border p-2 text-right">{totalQty}</td>
                  <td className="border p-2 text-right">{currency(totalAmount)}</td>
                  <td className="border p-2 text-center"><button onClick={() => exportExcel(o)}>Excel</button></td>
                  <td className="border p-2 text-center"><button onClick={() => exportPdf(o)}>PDF</button></td>
                  <td className="border p-2 text-center">
                    <div className="inline-flex gap-2">
                      <button onClick={() => handleEdit(o.id)} className="bg-green-400 px-2 py-1 text-dark rounded-lg border hover:bg-green-600">Edit</button>
                      <button onClick={() => handleDelete(o)} className="bg-red-400 px-2 py-1 text-dark rounded-lg border hover:bg-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
