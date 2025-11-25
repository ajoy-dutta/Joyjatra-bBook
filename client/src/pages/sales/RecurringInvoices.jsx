export default function RecurringInvoices() {
  return (
    <div className="space-y-4">
      <Header
        title="Recurring Invoices"
        subtitle="Automate billing for subscriptions and repeat customers."
        actionLabel="New Recurring Invoice"
      />
      <Filters
        searchPlaceholder="Search template name / customer"
        statusOptions={["All", "Active", "Paused", "Ended"]}
      />
      <CardTable
        columns={["Template", "Customer", "Frequency", "Next Run", "Amount", "Status"]}
        records={[
          ["Monthly Hosting", "ABC Ltd.", "Monthly", "2025-12-01", "৳ 10,000", "Active"],
          ["Service Contract", "XYZ Traders", "Quarterly", "2026-01-15", "৳ 35,000", "Paused"],
        ]}
      />
    </div>
  );
}

function Header({ title, subtitle, actionLabel }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
        + {actionLabel}
      </button>
    </div>
  );
}

function Filters({ searchPlaceholder, statusOptions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring focus:ring-blue-500/30"
        />
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
          {statusOptions.map((status) => (
            <option key={status}>Status: {status}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 text-xs">
        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
          Export
        </button>
      </div>
    </div>
  );
}

function CardTable({ columns, records }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50">
          <tr className="text-left text-slate-500">
            {columns.map((col) => (
              <th key={col} className="py-2 px-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2 px-2 ${
                    j === row.length - 2 ? "text-right" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
