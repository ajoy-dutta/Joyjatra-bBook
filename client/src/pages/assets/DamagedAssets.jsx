export default function DamagedAssets() {
  const assets = [
    { name: "Old Laptop", code: "FA-010", disposedOn: "2025-09-30", reason: "Not repairable", writeOff: "৳ 15,000" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Damaged / Disposed Assets</h1>
          <p className="text-sm text-slate-500">
            Record assets that were written off due to damage or disposal.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
          Record Disposal
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Asset Name</th>
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2">Disposed On</th>
              <th className="py-2 px-2">Reason</th>
              <th className="py-2 px-2 text-right">Write-off Amount</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.code} className="border-b last:border-0">
                <td className="py-2 px-2">{a.name}</td>
                <td className="py-2 px-2 text-xs font-mono">{a.code}</td>
                <td className="py-2 px-2">{a.disposedOn}</td>
                <td className="py-2 px-2">{a.reason}</td>
                <td className="py-2 px-2 text-right">{a.writeOff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
