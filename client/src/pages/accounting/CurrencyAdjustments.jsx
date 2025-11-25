export default function CurrencyAdjustments() {
  const rows = [
    {
      date: "2025-11-30",
      reference: "FX-001",
      currency: "USD",
      rate: "110.50",
      impact: "৳ 12,000 gain",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Currency Adjustments</h1>
          <p className="text-sm text-slate-500">
            Revalue foreign currency balances using updated exchange rates.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          New Revaluation
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Currency
            </label>
            <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              New Rate (per 1 unit)
            </label>
            <input
              type="number"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5"
              placeholder="e.g. 110.50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              As of Date
            </label>
            <input
              type="date"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5"
            />
          </div>
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Preview unrealized gains/losses before posting adjustment.
          </p>
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">
            Preview Impact
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold mb-3">Recent Adjustments</h2>
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Reference</th>
              <th className="py-2 px-2">Currency</th>
              <th className="py-2 px-2 text-right">Rate Used</th>
              <th className="py-2 px-2">Impact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.reference} className="border-b last:border-0">
                <td className="py-2 px-2">{r.date}</td>
                <td className="py-2 px-2">{r.reference}</td>
                <td className="py-2 px-2">{r.currency}</td>
                <td className="py-2 px-2 text-right">{r.rate}</td>
                <td className="py-2 px-2">{r.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
