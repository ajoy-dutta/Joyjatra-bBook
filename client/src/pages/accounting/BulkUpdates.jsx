export default function BulkUpdates() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bulk Updates</h1>
          <p className="text-sm text-slate-500">
            Apply changes to multiple transactions or records at once.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">
          Bulk Action History
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Module
            </label>
            <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option>Invoices</option>
              <option>Bills</option>
              <option>Customers</option>
              <option>Vendors</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Action
            </label>
            <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5">
              <option>Change Status</option>
              <option>Change Account</option>
              <option>Add Tag</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              New Value
            </label>
            <input
              type="text"
              placeholder="e.g. Paid, Sales Account, Important"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5"
            />
          </div>
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Select filters and review affected records before applying bulk update.
          </p>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
            Review & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
