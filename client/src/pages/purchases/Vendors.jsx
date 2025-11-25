export default function Vendors() {
  const rows = [
    {
      name: "Tech Supplies Ltd.",
      email: "billing@techsupplies.com",
      phone: "+8801XXXXXXXXX",
      payable: "৳ 35,000",
      bills: 5,
    },
    {
      name: "Office World",
      email: "accounts@officeworld.com",
      phone: "+8801YYYYYYYYY",
      payable: "৳ 0",
      bills: 3,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vendors</h1>
          <p className="text-sm text-slate-500">
            Manage suppliers, their balances, and contact information.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          + New Vendor
        </button>
      </div>

      {/* Filters */}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Phone</th>
              <th className="py-2 px-2 text-right">Outstanding Payable</th>
              <th className="py-2 px-2 text-center">Bills</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.name} className="border-b last:border-0">
                <td className="py-2 px-2 font-medium">{v.name}</td>
                <td className="py-2 px-2 text-xs">{v.email}</td>
                <td className="py-2 px-2 text-xs">{v.phone}</td>
                <td className="py-2 px-2 text-right">{v.payable}</td>
                <td className="py-2 px-2 text-center">{v.bills}</td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    View
                  </button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    Bills
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
