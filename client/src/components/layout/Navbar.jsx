import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith("/sales")) return "Sales";
    if (location.pathname.startsWith("/purchases")) return "Purchases";
    if (location.pathname.startsWith("/accounting")) return "Accounting";
    if (location.pathname.startsWith("/stock")) return "Stock";
    if (location.pathname.startsWith("/assets")) return "Assets";
    if (location.pathname.startsWith("/reports")) return "Reports";
    return "Dashboard";
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div>
        <h2 className="text-lg font-semibold">{getTitle()}</h2>
        <p className="text-xs text-slate-500">
          Manage your finances, stock, and assets in one place.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search in bBOOK..."
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
        />
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
          FF
        </div>
      </div>
    </header>
  );
}
