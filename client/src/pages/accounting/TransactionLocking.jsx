export default function TransactionLocking() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Transaction Locking</h1>
          <p className="text-sm text-slate-500">
            Prevent changes to transactions before a specific closing date.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4 max-w-xl">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600">
            Lock Date
          </label>
          <input
            type="date"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5"
          />
          <p className="text-xs text-slate-500">
            All transactions dated on or before this date will be locked and
            cannot be edited without admin override.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600">
            Lock Reason / Note
          </label>
          <textarea
            rows={3}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5"
            placeholder="e.g. Monthly closing completed for November 2025."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Last locked: 2025-10-31 by Admin
          </p>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
            Update Lock
          </button>
        </div>
      </div>
    </div>
  );
}
