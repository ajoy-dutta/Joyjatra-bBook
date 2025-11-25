export default function Customers() {
  const rows = [
    {
      name: "ABC Ltd.",
      email: "accounts@abc.com",
      phone: "+8801XXXXXXXXX",
      balance: "৳ 25,000",
      invoices: 12,
      status: "Active",
    },
    {
      name: "XYZ Traders",
      email: "billing@xyz.com",
      phone: "+8801YYYYYYYYY",
      balance: "৳ 15,500",
      invoices: 8,
      status: "Active",
    },
  ];

  return (
    <div className="space-y-4">
      <Header
        title="Customers"
        subtitle="Manage customer details, balances, and contact information."
        actionLabel="New Customer"
      />
      <Filters />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Phone</th>
              <th className="py-2 px-2 text-right">Open Balance</th>
              <th className="py-2 px-2 text-center">Invoices</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.name} className="border-b last:border-0">
                <td className="py-2 px-2 font-medium">{c.name}</td>
                <td className="py-2 px-2 text-xs">{c.email}</td>
                <td className="py-2 px-2 text-xs">{c.phone}</td>
                <td className="py-2 px-2 text-right">{c.balance}</td>
                <td className="py-2 px-2 text-center">{c.invoices}</td>
                <td className="py-2 px-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    {c.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    View
                  </button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Statement
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

function Filters() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <input
        type="text"
        placeholder="Search by name / email / phone"
        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-full md:w-80 focus:outline-none focus:ring focus:ring-blue-500/30"
      />
      <div className="flex gap-2 text-xs">
        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
          Export
        </button>
        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
          Import
        </button>
      </div>
    </div>
  );
}
