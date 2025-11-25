export default function ProductsServicesSales() {
  const items = [
    { name: "Web Design Service", sku: "SRV-001", price: "৳ 15,000", type: "Service", tax: "15%" },
    { name: "Hosting Plan", sku: "SRV-002", price: "৳ 2,000", type: "Service", tax: "10%" },
    { name: "Router", sku: "PRD-010", price: "৳ 5,500", type: "Product", tax: "15%" },
  ];

  return (
    <div className="space-y-4">
      <Header
        title="Products & Services (Sales)"
        subtitle="Configure items available for invoicing and sales."
        actionLabel="New Item"
      />
      <Filters />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">SKU</th>
              <th className="py-2 px-2 text-right">Selling Price</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Tax</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.sku} className="border-b last:border-0">
                <td className="py-2 px-2 font-medium">{i.name}</td>
                <td className="py-2 px-2 text-xs">{i.sku}</td>
                <td className="py-2 px-2 text-right">{i.price}</td>
                <td className="py-2 px-2">{i.type}</td>
                <td className="py-2 px-2">{i.tax}</td>
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
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name / SKU"
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring focus:ring-blue-500/30"
        />
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
          <option>Type: All</option>
          <option>Product</option>
          <option>Service</option>
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
