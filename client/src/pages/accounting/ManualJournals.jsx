export default function ManualJournals() {
  const journals = [
    {
      date: "2025-11-01",
      reference: "MJ-001",
      description: "Prepaid expense adjustment",
      lines: 2,
      totalDebit: "৳ 10,000",
      status: "Posted",
    },
    {
      date: "2025-11-05",
      reference: "MJ-002",
      description: "Year-end adjustment",
      lines: 4,
      totalDebit: "৳ 50,000",
      status: "Draft",
    },
  ];

  const statusCls = (status) =>
    status === "Posted"
      ? "bg-green-100 text-green-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manual Journals</h1>
          <p className="text-sm text-slate-500">
            Post adjusting entries directly to the general ledger.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          + New Journal
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search reference / description"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-72 focus:outline-none focus:ring focus:ring-blue-500/30"
          />
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option>Status: All</option>
            <option>Posted</option>
            <option>Draft</option>
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
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Reference</th>
              <th className="py-2 px-2">Description</th>
              <th className="py-2 px-2 text-center">Lines</th>
              <th className="py-2 px-2 text-right">Total Debit</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((j) => (
              <tr key={j.reference} className="border-b last:border-0">
                <td className="py-2 px-2">{j.date}</td>
                <td className="py-2 px-2 font-medium">{j.reference}</td>
                <td className="py-2 px-2">{j.description}</td>
                <td className="py-2 px-2 text-center">{j.lines}</td>
                <td className="py-2 px-2 text-right">{j.totalDebit}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusCls(j.status)}`}>
                    {j.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    View
                  </button>
                  {j.status === "Draft" && (
                    <button className="px-2 py-1 rounded border border-slate-200 hover:border-green-500">
                      Post
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
