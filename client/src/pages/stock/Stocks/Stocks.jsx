// src/pages/stock/Inventory.jsx
import { useState, useEffect } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import toast from "react-hot-toast";
import DamageModal from "./DamageModal";
import EditModal from "./EditModal";
import AddModal from "./AddModal";


// Recharts imports for expired-products chart
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Stocks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedEditStock, setSelectedEditStock] = useState(null);
  const [AddStockModal, setAddStockModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ✅ read selected business category from localStorage
  const [selectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // Fetch stocks from API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // if no category in localStorage, just load none
        if (!selectedCategory?.id) {
          setItems([]);
          setLoading(false);
          return;
        }

        const res = await AxiosInstance.get("stocks/", {
          params: { business_category: selectedCategory.id },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
        toast.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [selectedCategory]);

  const updateItem = (updatedStock) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updatedStock.id ? updatedStock : i))
    );
  };

  const addItem = (newStock) => {
    setItems((prev) => [...prev, newStock]);
  };


  // ---- Date helpers ----
  const today = new Date();
  const parseDate = (d) => (d ? new Date(d) : null);

  const isExpired = (item) => {
    const exp = parseDate(item.expiry_date);
    return exp && exp < today;
  };

  // 🔔 WARNING: expiring within next 2 days
  const isExpiringSoon = (item) => {
    const exp = parseDate(item.expiry_date);
    if (!exp) return false;
    const diffMs = exp - today;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 2; // next 2 days
  };

  // ---- KPI calculations ----
  const totalOnHand = items.reduce(
    (sum, i) => sum + (i.current_stock_quantity || 0),
    0
  );
  const lowStockCount = items.filter(
    (i) => i.current_stock_quantity <= i.reorder_level
  ).length;
  const fastMovingCount = items.filter(
    (i) => i.moving_speed === "Fast-moving"
  ).length;
  const damagedCount = items.reduce(
    (sum, i) => sum + (i.damage_quantity || 0),
    0
  );

  // Total units already expired
  const expiredUnits = items
    .filter((i) => isExpired(i))
    .reduce((sum, i) => sum + (i.current_stock_quantity || 0), 0);

  // total units expiring in the next 2 days
  const expiringSoonUnits = items
    .filter((i) => isExpiringSoon(i))
    .reduce((sum, i) => sum + (i.current_stock_quantity || 0), 0);

  // Data for expired products chart
  const expiredChartData = items
    .filter((i) => isExpired(i) && (i.current_stock_quantity || 0) > 0)
    .map((i) => ({
      name: i.product?.product_name || "Unknown",
      expiredQty: i.current_stock_quantity || 0,
    }));

  const stockStatusClass = (item) => {
    if (isExpired(item)) return "bg-red-100 text-red-700";
    if (item.current_stock_quantity <= item.reorder_level)
      return "bg-red-100 text-red-700";
    if (item.moving_speed === "Fast-moving")
      return "bg-green-100 text-green-700";
    if (isExpiringSoon(item)) return "bg-amber-100 text-amber-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const stockStatusLabel = (item) => {
    if (isExpired(item)) return "Expired";
    if (item.current_stock_quantity <= item.reorder_level) return "Low Stock";
    if (isExpiringSoon(item)) return "Expiring Soon";
    if (item.moving_speed === "Fast-moving") return "Fast-moving";
    return "Healthy";
  };

  // ---- Search + filter ----
  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    const name = item.product?.product_name?.toLowerCase() || "";
    const code = item.product?.product_code?.toLowerCase() || "";
    const category = item.product?.category_name?.toLowerCase() || "";

    const matchesSearch =
      !term || name.includes(term) || code.includes(term) || category.includes(term);

    let matchesFilter = true;
    switch (statusFilter) {
      case "Low stock":
        matchesFilter = item.current_stock_quantity <= 10;
        break;
      case "Expired":
        matchesFilter = isExpired(item);
        break;
      case "Expiring soon":
        matchesFilter = isExpiringSoon(item);
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  // ---- Export handlers ----

  // Excel = CSV export of the current filtered view
  const handleExportExcel = () => {
    if (!filteredItems.length) {
      toast.error("No data to export");
      return;
    }

    const header = [
      "Product",
      "Code",
      "PurchaseQty",
      "SaleQty",
      "OnHand",
      "Damage",
      "Mfg",
      "Exp",
      "Status",
    ];

    const rows = filteredItems.map((item) => [
      item.product?.product_name || "",
      item.product?.product_code || "",
      item.purchase_quantity ?? "",
      item.sale_quantity ?? "",
      item.current_stock_quantity ?? "",
      item.damage_quantity ?? "",
      item.manufacture_date || "",
      item.expiry_date || "",
      stockStatusLabel(item),
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // .csv opens in Excel fine
    link.download = "inventory.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF = open a clean window with a table and trigger print (user can save as PDF)
  const handleExportPDF = () => {
    if (!filteredItems.length) {
      toast.error("No data to export");
      return;
    }

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup blocked. Please allow popups for this site.");
      return;
    }

    const tableRows = filteredItems
      .map(
        (item) => `
          <tr>
            <td>${item.product?.product_name || ""}</td>
            <td>${item.product?.product_code || ""}</td>
            <td style="text-align:right;">${item.purchase_quantity ?? ""}</td>
            <td style="text-align:right;">${item.sale_quantity ?? ""}</td>
            <td style="text-align:right;">${item.current_stock_quantity ?? ""}</td>
            <td style="text-align:right;">${item.damage_quantity ?? ""}</td>
            <td>${item.manufacture_date || ""}</td>
            <td>${item.expiry_date || ""}</td>
            <td>${stockStatusLabel(item)}</td>
          </tr>`
      )
      .join("");

    win.document.write(`
      <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            h1 { text-align: center; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 4px 6px; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Inventory Report</h1>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>PurchaseQty</th>
                <th>SaleQty</th>
                <th>OnHand</th>
                <th>Damage</th>
                <th>Mfg</th>
                <th>Exp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    // small delay so content fully renders before print dialog
    setTimeout(() => {
      win.print(); // user chooses "Save as PDF"
    }, 300);
  };

  if (loading) return <p>Loading inventory...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inventory Management</h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Maintain optimal inventory levels with real-time tracking of
            purchases, sales, stock movement, and food safety dates. Reduce
            waste, prevent stock-outs, and ensure expired items are not served.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Units On Hand"
          value={totalOnHand}
          description="All active inventory items currently in stock."
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          description="Reached or below reorder level, needs attention."
          tone="warn"
        />
        <StatCard
          title="Fast-moving Items"
          value={fastMovingCount}
          description="High-demand items to replenish continuously."
          tone="good"
        />
        <StatCard
          title="Damaged / Lost"
          value={damagedCount}
          description="Recorded damaged or written-off items."
          tone="bad"
        />
        <StatCard
          title="Expired Units On Hand"
          value={expiredUnits}
          description="Units past expiry that should not be served."
          tone={expiredUnits > 0 ? "bad" : "good"}
        />
        <StatCard
          title="Expiring Soon (2 days)"
          value={expiringSoonUnits}
          description="Units that will expire within the next 2 days."
          tone={expiringSoonUnits > 0 ? "warn" : "good"}
        />
      </div>

      {/* Expired products chart */}
      {expiredChartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold mb-2">
            Expired Products (by current stock quantity)
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Shows products whose expiry date has passed but still have units in
            stock.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiredChartData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="expiredQty" name="Expired Qty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by product name / SKU / category"
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-72 focus:outline-none focus:ring focus:ring-blue-500/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Filter: All</option>
              <option value="Low stock">Low stock</option>
              <option value="Expired">Expired</option>
              <option value="Expiring soon">Expiring soon</option>
            </select>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
             <button
              type="button"
              onClick={() => setAddStockModal(true)}
              className="px-3 py-1.5 text-sm rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
            >
              Add new Stock
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 text-sm rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
            >
              Export Excel
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-500 text-slate-700 hover:bg-slate-50"
            >
              Export PDF
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Prod</th>
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2 text-right">PurchaseQty</th>
              <th className="py-2 px-2 text-right">SaleQty</th>
              <th className="py-2 px-2 text-right">OH</th>
              <th className="py-2 px-2 text-right">Damage</th>
              <th className="py-2 px-2">Mfg</th>
              <th className="py-2 px-2">Exp</th>
              <th className="py-2 px-2">Stat</th>
              <th className="py-2 px-2">Add Dmg</th>
              <th className="py-2 px-2 text-right">Act</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="py-4 px-2 text-center text-slate-400"
                >
                  No items found.
                </td>
              </tr>
            )}

            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2 px-2 font-medium">
                  {item.product?.product_name || "Unnamed"}
                </td>
                <td className="py-2 px-2 text-xs font-mono">
                  {item.product?.product_code || "-"}
                </td>
                <td className="py-2 px-2 text-right">
                  {item.purchase_quantity}
                </td>
                <td className="py-2 px-2 text-right">
                  {item.sale_quantity}
                </td>
                <td className="py-2 px-2 text-right">
                  {item.current_stock_quantity}
                </td>
                <td className="py-2 px-2 text-right">
                  {item.damage_quantity}
                </td>
                <td className="py-2 px-2">
                  {item.manufacture_date || "-"}
                </td>
                <td className="py-2 px-2">
                  {item.expiry_date || "-"}
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${stockStatusClass(
                      item
                    )}`}
                  >
                    {stockStatusLabel(item)}
                  </span>
                </td>
                <td
                  className="text-center cursor-pointer text-green-600 font-bold text-2xl"
                  onClick={() => setSelectedStock(item)}
                >
                  +
                </td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button
                    className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500"
                    onClick={() => setSelectedEditStock(item)}
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Damage Modal */}
      {selectedStock && (
        <DamageModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onUpdated={updateItem}
        />
      )}

      {selectedEditStock && (
        <EditModal
          stock={selectedEditStock}
          onClose={() => setSelectedEditStock(null)}
          onUpdated={updateItem}
        />
      )}


      {AddStockModal && (
        <AddModal
          business_category={selectedCategory.id}
          onClose={() => setAddStockModal(false)}
          onAdd={addItem}
        />
      )}
    </div>
  );
}

// --- Helper components ---
function StatCard({ title, value, description, tone = "neutral" }) {
  const toneClasses = {
    neutral: "bg-white border-slate-200",
    good: "bg-emerald-50 border-emerald-100",
    warn: "bg-amber-50 border-amber-100",
    bad: "bg-red-50 border-red-100",
  };
  return (
    <div className={`rounded-xl border shadow-sm p-4 ${toneClasses[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{description}</div>
    </div>
  );
}

function FeatureCard({ title, points }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
