export default function Invoices() {
  return (
    <div className="space-y-4">
      <Header
        title="Invoices"
        subtitle="Manage invoices, track payment status, and follow up on overdue bills."
        actionLabel="New Invoice"
      />
      <Filters
        searchPlaceholder="Search invoice # / customer"
        statusOptions={["All", "Paid", "Pending", "Overdue", "Draft"]}
      />
      <InvoicesTable />
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
        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
          Send Reminders
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Overdue: "bg-red-100 text-red-700",
    Draft: "bg-slate-100 text-slate-700",
  };
  const cls = map[status] || "bg-slate-100 text-slate-700";
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${cls}`}>
      {status}
    </span>
  );
}

function InvoicesTable() {
  const rows = [
    {
      date: "2025-11-01",
      number: "INV-001",
      customer: "ABC Ltd.",
      dueDate: "2025-11-10",
      amount: "৳ 25,000",
      status: "Paid",
    },
    {
      date: "2025-11-03",
      number: "INV-002",
      customer: "XYZ Traders",
      dueDate: "2025-11-13",
      amount: "৳ 40,000",
      status: "Pending",
    },
    {
      date: "2025-11-05",
      number: "INV-003",
      customer: "Delta Imports",
      dueDate: "2025-11-12",
      amount: "৳ 18,500",
      status: "Overdue",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50">
          <tr className="text-left text-slate-500">
            <th className="py-2 px-2">Date</th>
            <th className="py-2 px-2">Invoice #</th>
            <th className="py-2 px-2">Customer</th>
            <th className="py-2 px-2">Due Date</th>
            <th className="py-2 px-2 text-right">Amount</th>
            <th className="py-2 px-2">Status</th>
            <th className="py-2 px-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.number} className="border-b last:border-0">
              <td className="py-2 px-2">{row.date}</td>
              <td className="py-2 px-2 font-medium">{row.number}</td>
              <td className="py-2 px-2">{row.customer}</td>
              <td className="py-2 px-2">{row.dueDate}</td>
              <td className="py-2 px-2 text-right">{row.amount}</td>
              <td className="py-2 px-2">
                <StatusBadge status={row.status} />
              </td>
              <td className="py-2 px-2 text-right space-x-2 text-xs">
                <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                  View
                </button>
                <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
