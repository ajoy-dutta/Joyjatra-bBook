export default function CustomerStatements() {
  return (
    <div className="space-y-4">
      <Header
        title="Customer Statements"
        subtitle="Generate account statements and share them with customers."
        actionLabel="Generate Statement"
      />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Customer
            </label>
            <input
              type="text"
              placeholder="Search customer name"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
              />
              <input
                type="date"
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
              />
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
            Preview Statement
          </button>
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4">
          <p className="text-sm text-slate-500 mb-2">
            Statement preview will appear here. Include opening balance, invoices,
            payments, and closing balance.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
            <p className="font-semibold mb-1">Sample Statement</p>
            <p>Customer: ABC Ltd.</p>
            <p>Period: 2025-11-01 to 2025-11-30</p>
            <p className="mt-2">Opening Balance: ৳ 0.00</p>
            <p>Invoices: ৳ 65,000</p>
            <p>Payments: ৳ 40,000</p>
            <p className="font-semibold mt-2">Closing Balance: ৳ 25,000</p>
          </div>
        </div>
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
      <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">
        {actionLabel}
      </button>
    </div>
  );
}
