export default function CurrentAssets() {
  const assets = [
    { name: "Office Laptop - Dell", code: "FA-001", purchaseDate: "2024-01-10", cost: "৳ 80,000", bookValue: "৳ 60,000" },
    { name: "Office AC Unit", code: "FA-002", purchaseDate: "2023-06-15", cost: "৳ 55,000", bookValue: "৳ 40,000" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Current Assets</h1>
          <p className="text-sm text-slate-500">
            Track fixed assets and their depreciation.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          + New Asset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Asset Name</th>
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2">Purchase Date</th>
              <th className="py-2 px-2 text-right">Cost</th>
              <th className="py-2 px-2 text-right">Book Value</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.code} className="border-b last:border-0">
                <td className="py-2 px-2">{a.name}</td>
                <td className="py-2 px-2 text-xs font-mono">{a.code}</td>
                <td className="py-2 px-2">{a.purchaseDate}</td>
                <td className="py-2 px-2 text-right">{a.cost}</td>
                <td className="py-2 px-2 text-right">{a.bookValue}</td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    View
                  </button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Depreciation
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
