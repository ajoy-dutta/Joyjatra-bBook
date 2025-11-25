export default function Products() {
  const rows = [
    { name: "Router", sku: "PRD-010", stock: 25, reorder: 5, value: "৳ 137,500" },
    { name: "Network Cable Roll", sku: "PRD-011", stock: 8, reorder: 10, value: "৳ 24,000" },
  ];

  const stockStatus = (stock, reorder) =>
    stock <= reorder ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stock Products</h1>
          <p className="text-sm text-slate-500">
            Track quantities on hand, reorder levels, and stock value.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          + New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name / SKU"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring focus:ring-blue-500/30"
          />
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option>Filter: All</option>
            <option>Low Stock</option>
            <option>In Stock</option>
          </select>
        </div>
        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">SKU</th>
              <th className="py-2 px-2 text-right">In Stock</th>
              <th className="py-2 px-2 text-right">Reorder Level</th>
              <th className="py-2 px-2 text-right">Stock Value</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.sku} className="border-b last:border-0">
                <td className="py-2 px-2 font-medium">{p.name}</td>
                <td className="py-2 px-2 text-xs">{p.sku}</td>
                <td className="py-2 px-2 text-right">{p.stock}</td>
                <td className="py-2 px-2 text-right">{p.reorder}</td>
                <td className="py-2 px-2 text-right">{p.value}</td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${stockStatus(
                      p.stock,
                      p.reorder
                    )}`}
                  >
                    {p.stock <= p.reorder ? "Low Stock" : "OK"}
                  </span>
                </td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Adjust
                  </button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
