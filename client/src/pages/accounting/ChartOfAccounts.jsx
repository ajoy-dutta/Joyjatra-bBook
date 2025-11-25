export default function ChartOfAccounts() {
  const accounts = [
    { code: "1000", name: "Cash at Bank", type: "Asset", balance: "৳ 250,000" },
    { code: "1100", name: "Accounts Receivable", type: "Asset", balance: "৳ 95,000" },
    { code: "2000", name: "Accounts Payable", type: "Liability", balance: "৳ 40,000" },
    { code: "4000", name: "Sales", type: "Income", balance: "৳ 480,000" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Chart of Accounts</h1>
          <p className="text-sm text-slate-500">
            Manage all ledger accounts used for your financial reporting.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          + New Account
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by code / name"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring focus:ring-blue-500/30"
          />
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option>Type: All</option>
            <option>Asset</option>
            <option>Liability</option>
            <option>Equity</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>
        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
          Export COA
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2">Account Name</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2 text-right">Current Balance</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.code} className="border-b last:border-0">
                <td className="py-2 px-2 font-mono text-xs">{a.code}</td>
                <td className="py-2 px-2 font-medium">{a.name}</td>
                <td className="py-2 px-2">{a.type}</td>
                <td className="py-2 px-2 text-right">{a.balance}</td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Edit
                  </button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-red-500">
                    Archive
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
