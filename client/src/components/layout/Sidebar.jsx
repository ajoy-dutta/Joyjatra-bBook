import { NavLink, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";

const menuConfig = [
  {
    title: "Dashboard",
    icon: "📊",
    items: [{ label: "Overview", path: "/dashboard" }],
  },
  {
    title: "Sales",
    icon: "💰",
    items: [
      { label: "Estimates", path: "/sales/estimates" },
      { label: "Invoices", path: "/sales/invoices" },
      { label: "Recurring Invoices", path: "/sales/recurring-invoices" },
      { label: "Checkouts", path: "/sales/checkouts" },
      { label: "Payments", path: "/sales/payments" },
      { label: "Customer Statements", path: "/sales/customer-statements" },
      { label: "Customers", path: "/sales/customers" },
      { label: "Products & Services", path: "/sales/products-services" },
    ],
  },
  {
    title: "Purchases",
    icon: "🧾",
    items: [
      { label: "Bills", path: "/purchases/bills" },
      { label: "Vendors", path: "/purchases/vendors" },
      { label: "Products & Services", path: "/purchases/products-services" },
    ],
  },
  {
    title: "Accounting",
    icon: "📚",
    items: [
      { label: "Manual Journals", path: "/accounting/manual-journals" },
      { label: "Bulk Updates", path: "/accounting/bulk-updates" },
      { label: "Currency Adjustments", path: "/accounting/currency-adjustments" },
      { label: "Chart of Accounts", path: "/accounting/chart-of-accounts" },
      { label: "Budget", path: "/accounting/budget" },
      { label: "Transaction Locking", path: "/accounting/transaction-locking" },
    ],
  },
{
  title: "Stock",
  icon: "📦",
  items: [
    { label: "Inventory", path: "/stock/inventory" },  // ← add this
    { label: "Products", path: "/stock/products" },
    { label: "Damaged Products", path: "/stock/damaged-products" },
  ],
},
  {
    title: "Assets",
    icon: "🏢",
    items: [
      { label: "Current Assets", path: "/assets/current-assets" },
      { label: "Damaged Assets", path: "/assets/damaged-assets" },
    ],
  },
  {
    title: "Reports",
    icon: "📑",
    items: [{ label: "Reports Home", path: "/reports" }],
  },
];

export default function Sidebar() {
  const location = useLocation();

  // auto-open the section that matches current path
  const initialOpen = useMemo(() => {
    const section = menuConfig.find((sec) =>
      sec.items.some((item) => location.pathname.startsWith(item.path))
    );
    return section ? section.title : "Dashboard";
  }, [location.pathname]);

  const [openSection, setOpenSection] = useState(initialOpen);

  const toggleSection = (title) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 h-screen sticky top-0 flex flex-col border-r border-slate-800">
      {/* Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-lg font-bold">
          b
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            bBOOK
          </h1>
          <p className="text-[11px] text-slate-400">
            Cloud Accounting
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 text-sm space-y-2">
        {menuConfig.map((section) => {
          const isOpen = openSection === section.title;
          const hasSingleItem = section.items.length === 1;

          // If only one item, clicking header will navigate directly
          const singleItemPath = hasSingleItem ? section.items[0].path : null;

          return (
            <div
              key={section.title}
              className="rounded-xl bg-slate-900/40 border border-slate-800/80 shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  hasSingleItem
                    ? (window.location.href = singleItemPath)
                    : toggleSection(section.title)
                }
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-900/80 rounded-t-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-300">
                    {section.title}
                  </span>
                </div>
                {!hasSingleItem && (
                  <span
                    className={`text-xs transition-transform duration-200 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                )}
              </button>

              {/* Dropdown items */}
              {!hasSingleItem && (
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="py-1 pb-2 px-1 space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive: activeFromNav }) =>
                            [
                              "block px-3 py-1.5 rounded-lg text-xs flex items-center justify-between",
                              (isActive || activeFromNav)
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-300 hover:bg-slate-800/80",
                            ].join(" ")
                          }
                        >
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>v0.1 • bBOOK</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
          Beta
        </span>
      </div>
    </aside>
  );
}
