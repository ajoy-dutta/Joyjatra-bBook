// src/pages/stock/Inventory.jsx

export default function Inventory() {
  const items = [
    {
      name: "Router",
      sku: "PRD-010",
      category: "Networking",
      onHand: 25,
      reorderLevel: 5,
      movingSpeed: "Fast-moving",
      forecastDays: 12,
    },
    {
      name: "Network Cable Roll",
      sku: "PRD-011",
      category: "Networking",
      onHand: 8,
      reorderLevel: 10,
      movingSpeed: "Medium",
      forecastDays: 5,
    },
    {
      name: "UPS Unit",
      sku: "PRD-012",
      category: "Power",
      onHand: 3,
      reorderLevel: 4,
      movingSpeed: "Slow",
      forecastDays: 30,
    },
  ];

  const totalOnHand = items.reduce((sum, i) => sum + i.onHand, 0);
  const lowStockCount = items.filter((i) => i.onHand <= i.reorderLevel).length;
  const fastMovingCount = items.filter((i) => i.movingSpeed === "Fast-moving").length;
  const damagedCount = 3; // example static number for now

  const stockStatusClass = (item) => {
    if (item.onHand <= item.reorderLevel) return "bg-red-100 text-red-700";
    if (item.movingSpeed === "Fast-moving") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6">
      {/* Header / Hero */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inventory Management</h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Maintain optimal inventory levels with real-time tracking of purchases, sales, and stock
            movement. Reduce carrying costs, prevent stock-outs, and make informed decisions with
            demand forecasting.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
            Adjust Stock
          </button>
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">
            Record Damage / Loss
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Features / Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FeatureCard
          title="Inventory Tracking"
          points={[
            "Track product stock from the moment you create it.",
            "Get real-time updates from every purchase and sale.",
            "Instantly reflect any damage, loss, or adjustments.",
          ]}
        />
        <FeatureCard
          title="Reorder Levels & Alerts"
          points={[
            "Set reorder levels for each item.",
            "Receive timely alerts when stock hits minimum levels.",
            "Ensure the right amount of inventory is always on hand.",
          ]}
        />
        <FeatureCard
          title="Demand Forecasting"
          points={[
            "Analyze inventory data to predict future demand.",
            "Minimize stockouts and overstocking risks.",
            "Support production and purchasing decisions with data.",
          ]}
        />
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by product name / SKU / category"
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-72 focus:outline-none focus:ring focus:ring-blue-500/30"
            />
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option>Filter: All</option>
              <option>Fast-moving</option>
              <option>Low stock</option>
              <option>Slow moving</option>
            </select>
          </div>
          <div className="flex gap-2 text-xs">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
              Export
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
              View Stock Movement
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Product</th>
              <th className="py-2 px-2">SKU</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2 text-right">On Hand</th>
              <th className="py-2 px-2 text-right">Reorder Level</th>
              <th className="py-2 px-2">Movement</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Forecast (days)</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.sku} className="border-b last:border-0">
                <td className="py-2 px-2 font-medium">{item.name}</td>
                <td className="py-2 px-2 text-xs font-mono">{item.sku}</td>
                <td className="py-2 px-2 text-xs">{item.category}</td>
                <td className="py-2 px-2 text-right">{item.onHand}</td>
                <td className="py-2 px-2 text-right">{item.reorderLevel}</td>
                <td className="py-2 px-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                    {item.movingSpeed}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${stockStatusClass(item)}`}>
                    {item.onHand <= item.reorderLevel ? "Low Stock" : "Healthy"}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">{item.forecastDays} days</td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Adjust
                  </button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Movements
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Demand / notes section */}
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-xs text-slate-600">
        <p className="font-semibold mb-1">Inventory & Demand Insights</p>
        <p>
          Use real-time stock levels, sales history, and purchase patterns to forecast demand and plan
          replenishments. Combine this with your production and supply timelines to avoid delays and
          meet customer demand on time.
        </p>
      </div>
    </div>
  );
}

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
