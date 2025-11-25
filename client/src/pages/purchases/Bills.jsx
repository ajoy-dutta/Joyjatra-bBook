export default function Bills() {
  const rows = [
    {
      date: "2025-11-01",
      billNo: "BILL-001",
      vendor: "Tech Supplies Ltd.",
      dueDate: "2025-11-10",
      amount: "৳ 35,000",
      status: "Unpaid",
    },
    {
      date: "2025-11-03",
      billNo: "BILL-002",
      vendor: "Office World",
      dueDate: "2025-11-20",
      amount: "৳ 12,400",
      status: "Paid",
    },
  ];

  const statusColor = (status) => {
    if (status === "Paid") return "bg-green-100 text-green-700";
    if (status === "Unpaid") return "bg-yellow-100 text-yellow-700";
    if (status === "Overdue") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bills</h1>
          <p className="text-sm text-slate-500">
            Track vendor bills and manage your payables.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          + New Bill
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search bill # / vendor"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-72 focus:outline-none focus:ring focus:ring-blue-500/30"
          />
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
            <option>Status: All</option>
            <option>Paid</option>
            <option>Unpaid</option>
            <option>Overdue</option>
          </select>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
            Export
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
            Bulk Payment
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Bill #</th>
              <th className="py-2 px-2">Vendor</th>
              <th className="py-2 px-2">Due Date</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.billNo} className="border-b last:border-0">
                <td className="py-2 px-2">{row.date}</td>
                <td className="py-2 px-2 font-medium">{row.billNo}</td>
                <td className="py-2 px-2">{row.vendor}</td>
                <td className="py-2 px-2">{row.dueDate}</td>
                <td className="py-2 px-2 text-right">{row.amount}</td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusColor(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-right text-xs space-x-2">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500">
                    View
                  </button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:border-green-500">
                    Pay
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
