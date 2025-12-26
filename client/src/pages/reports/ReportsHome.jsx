import { Link } from "react-router-dom";

export default function ReportsHome() {
  const reports = [
    {
      name: "Accounts",
      category: "Financial",
      description: "Income,Expense Details Report.",
      path: "/reports/accounts",
    },
    {
      name: "Profit & Loss",
      category: "Financial",
      description: "Income, expenses and net profit for a period.",
      path: "/reports/profit-loss",
    },
    {
      name: "Balance Sheet",
      category: "Financial",
      description: "Assets, liabilities and equity snapshot.",
      path: null,
    },
    {
      name: "Expense Report",
      category: "Financial",
      description: "general expense, purchase, slary etc. report.",
      path:"/reports/expense-report/",
    },

    {
      name: "Sales Report",
      category: "Financial",
      description: "Detailed sales transactions and summaries.",
      path:"/reports/sales-report/",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-slate-500">
            Analyze your business performance with pre-built financial and management reports.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search reports"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring focus:ring-blue-500/30"
          />
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option>Category: All</option>
            <option>Financial</option>
            <option>Sales</option>
            <option>Purchases</option>
            <option>Stock</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <div
            key={r.name}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                {r.category}
              </div>
              <h2 className="text-sm font-semibold mb-1">{r.name}</h2>
              <p className="text-xs text-slate-500">{r.description}</p>
            </div>

            <div className="mt-4 flex justify-between items-center">
              {r.path ? (
                <Link
                  to={r.path}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
                >
                  View Report
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg bg-slate-300 text-white text-xs cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}

              <button className="text-[11px] text-slate-500 hover:text-blue-600">
                Customize
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
