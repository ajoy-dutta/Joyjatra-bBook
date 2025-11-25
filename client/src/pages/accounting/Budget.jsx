export default function Budget() {
  const rows = [
    { account: "Sales", period: "2025", budget: "৳ 5,000,000", actual: "৳ 480,000", variance: "-৳ 4,520,000" },
    { account: "Rent Expense", period: "2025", budget: "৳ 600,000", actual: "৳ 50,000", variance: "-৳ 550,000" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Budget</h1>
          <p className="text-sm text-slate-500">
            Plan your income and expenses and compare against actuals.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          New Budget
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option>Year: 2025</option>
            <option>Year: 2024</option>
          </select>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option>View: Summary</option>
            <option>View: By Month</option>
          </select>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Account</th>
              <th className="py-2 px-2">Period</th>
              <th className="py-2 px-2 text-right">Budget</th>
              <th className="py-2 px-2 text-right">Actual</th>
              <th className="py-2 px-2 text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.account} className="border-b last:border-0">
                <td className="py-2 px-2">{r.account}</td>
                <td className="py-2 px-2">{r.period}</td>
                <td className="py-2 px-2 text-right">{r.budget}</td>
                <td className="py-2 px-2 text-right">{r.actual}</td>
                <td className="py-2 px-2 text-right">{r.variance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
