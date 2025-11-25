export default function DamagedProducts() {
  const rows = [
    { name: "Router", sku: "PRD-010", qty: 2, date: "2025-11-04", reason: "Physical damage" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Damaged Products</h1>
          <p className="text-sm text-slate-500">
            Track items written off due to damage or loss.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
          Record Damage
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Product</th>
              <th className="py-2 px-2">SKU</th>
              <th className="py-2 px-2 text-right">Quantity</th>
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-b last:border-0">
                <td className="py-2 px-2">{r.name}</td>
                <td className="py-2 px-2 text-xs">{r.sku}</td>
                <td className="py-2 px-2 text-right">{r.qty}</td>
                <td className="py-2 px-2">{r.date}</td>
                <td className="py-2 px-2">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
