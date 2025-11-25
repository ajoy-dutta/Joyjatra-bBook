export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">Dashboard</h3>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Cash Management"
          value="৳ 250,000"
          description="Total cash & bank balance"
        />
        <DashboardCard
          title="Sales This Month"
          value="৳ 480,000"
          description="Invoices, estimates, and receipts"
        />
        <DashboardCard
          title="Expenses This Month"
          value="৳ 190,000"
          description="Categorized business expenses"
        />
      </div>

      {/* Two-column area: left = tables, right = quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Recent Invoices">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-slate-500">
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b last:border-0">
                  <td className="py-2">INV-001</td>
                  <td className="py-2">ABC Ltd.</td>
                  <td className="py-2">৳ 25,000</td>
                  <td className="py-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Paid
                    </span>
                  </td>
                </tr>
                <tr className="border-b last:border-0">
                  <td className="py-2">INV-002</td>
                  <td className="py-2">XYZ Traders</td>
                  <td className="py-2">৳ 40,000</td>
                  <td className="py-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Inventory Snapshot">
            <p className="text-sm text-slate-600 mb-2">
              Track your inventory levels, damaged products, and stock value.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <MiniStat label="Total Products" value="120" />
              <MiniStat label="Low Stock" value="8" />
              <MiniStat label="Damaged Items" value="3" />
              <MiniStat label="Stock Value" value="৳ 320,000" />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Quick Links">
            <div className="flex flex-col gap-2 text-sm">
              <button className="text-left px-3 py-2 rounded-lg bg-white border hover:border-bbook-primary">
                + New Invoice
              </button>
              <button className="text-left px-3 py-2 rounded-lg bg-white border hover:border-bbook-primary">
                + Record Expense
              </button>
              <button className="text-left px-3 py-2 rounded-lg bg-white border hover:border-bbook-primary">
                + Add Product
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Alerts">
            <ul className="text-sm list-disc list-inside text-slate-600 space-y-1">
              <li>3 invoices overdue</li>
              <li>8 products below reorder level</li>
              <li>Asset depreciation posting due</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, description }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {title}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{description}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}
