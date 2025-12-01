// client/src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import AxiosInstance from "../components/AxiosInstance";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaryExpenses, setSalaryExpenses] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          salesRes,
          expensesRes,
          salaryRes,
          stocksRes,
          customersRes,
          vendorsRes,
        ] = await Promise.all([
          AxiosInstance.get("sales/"),
          AxiosInstance.get("expenses/"),
          AxiosInstance.get("salary-expenses/"),
          AxiosInstance.get("stocks/"),
          AxiosInstance.get("customers/"),
          AxiosInstance.get("vendors/"),
        ]);

        const normalize = (raw) =>
          Array.isArray(raw) ? raw : raw?.results || [];

        setSales(normalize(salesRes.data));
        setExpenses(normalize(expensesRes.data));
        setSalaryExpenses(normalize(salaryRes.data));
        setStocks(stocksRes.data || []);
        setCustomers(normalize(customersRes.data));
        setVendors(normalize(vendorsRes.data));
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
            "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ---------- Helpers ----------
  const safeNumber = (value) => {
    const num = parseFloat(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value) => {
    const num = safeNumber(value);
    return `৳ ${num.toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11

  // ---------- Computed stats ----------
  const {
    salesThisMonth,
    expensesThisMonth,
    netThisMonth,
    totalSalesCount,
    totalCustomers,
    totalVendors,
  } = useMemo(() => {
    let salesThisMonth = 0;
    let expensesThisMonth = 0;
    let netThisMonth = 0;

    const isSameMonth = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return (
        d.getFullYear() === currentYear && d.getMonth() === currentMonth
      );
    };

    sales.forEach((s) => {
      if (isSameMonth(s.sale_date)) {
        salesThisMonth += safeNumber(s.total_payable_amount);
      }
    });

    expenses.forEach((e) => {
      if (isSameMonth(e.expense_date)) {
        expensesThisMonth += safeNumber(e.amount);
      }
    });

    salaryExpenses.forEach((s) => {
      // salary_month = "YYYY-MM"
      if (!s.salary_month) return;
      const [yStr, mStr] = s.salary_month.split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1; // 0-based
      if (y === currentYear && m === currentMonth) {
        expensesThisMonth += safeNumber(s.amount);
      }
    });

    netThisMonth = salesThisMonth - expensesThisMonth;

    return {
      salesThisMonth,
      expensesThisMonth,
      netThisMonth,
      totalSalesCount: sales.length,
      totalCustomers: customers.length,
      totalVendors: vendors.length,
    };
  }, [sales, expenses, salaryExpenses, customers.length, vendors.length]);

  // Inventory snapshot
  const inventorySnapshot = useMemo(() => {
    const totalOnHand = stocks.reduce(
      (sum, i) => sum + (i.current_stock_quantity || 0),
      0
    );
    const lowStockCount = stocks.filter(
      (i) =>
        typeof i.reorder_level === "number" &&
        i.current_stock_quantity <= i.reorder_level
    ).length;
    const damagedCount = stocks.reduce(
      (sum, i) => sum + (i.damage_quantity || 0),
      0
    );
    const stockValue = stocks.reduce(
      (sum, i) => sum + safeNumber(i.current_stock_value),
      0
    );

    return {
      totalOnHand,
      lowStockCount,
      damagedCount,
      stockValue,
    };
  }, [stocks]);

  // Recent invoices (sales)
  const recentInvoices = useMemo(() => {
    return sales.slice(0, 5).map((s) => {
      const totalPayable = safeNumber(s.total_payable_amount);
      const totalPaid =
        s.payments?.reduce(
          (acc, p) => acc + safeNumber(p.paid_amount),
          0
        ) || 0;
      const due = Math.max(0, totalPayable - totalPaid);

      let status = "Unpaid";
      if (totalPaid <= 0 && totalPayable > 0) status = "Unpaid";
      else if (due <= 0 && totalPayable > 0) status = "Paid";
      else if (due > 0 && totalPaid > 0) status = "Partially Paid";
      else status = "N/A";

      return {
        id: s.id,
        invoiceNo: s.invoice_no,
        customer:
          s.customer?.customer_name ||
          s.customer?.shop_name ||
          "N/A",
        amount: totalPayable,
        paid: totalPaid,
        due,
        status,
        date: s.sale_date,
      };
    });
  }, [sales]);

  // Simple 6-month sales vs expense trend (for charts)
  const monthlyTrend = useMemo(() => {
    const months = [];
    const today = new Date();

    // Build last 6 months [oldest ... latest]
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(), // 0-11
        label: d.toLocaleDateString("en-GB", {
          month: "short",
        }),
      });
    }

    const trend = months.map((m) => {
      let salesSum = 0;
      let expenseSum = 0;

      sales.forEach((s) => {
        if (!s.sale_date) return;
        const d = new Date(s.sale_date);
        if (
          d.getFullYear() === m.year &&
          d.getMonth() === m.month
        ) {
          salesSum += safeNumber(s.total_payable_amount);
        }
      });

      expenses.forEach((e) => {
        if (!e.expense_date) return;
        const d = new Date(e.expense_date);
        if (
          d.getFullYear() === m.year &&
          d.getMonth() === m.month
        ) {
          expenseSum += safeNumber(e.amount);
        }
      });

      salaryExpenses.forEach((s) => {
        if (!s.salary_month) return;
        const [yStr, moStr] = s.salary_month.split("-");
        const y = parseInt(yStr, 10);
        const mo = parseInt(moStr, 10) - 1;
        if (y === m.year && mo === m.month) {
          expenseSum += safeNumber(s.amount);
        }
      });

      return {
        ...m,
        sales: salesSum,
        expenses: expenseSum,
      };
    });

    return trend;
  }, [sales, expenses, salaryExpenses]);

  // Data for Recharts
  const salesChartData = useMemo(
    () =>
      monthlyTrend.map((m) => ({
        name: m.label,
        sales: Number(m.sales.toFixed(2)),
        expenses: Number(m.expenses.toFixed(2)),
      })),
    [monthlyTrend]
  );

  const salesVsExpenseData = useMemo(
    () => [
      { name: "Sales", value: Math.max(0, salesThisMonth) },
      { name: "Expenses", value: Math.max(0, expensesThisMonth) },
    ],
    [salesThisMonth, expensesThisMonth]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero / summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 rounded-2xl text-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Business Overview
              </h1>
              <p className="text-sm text-indigo-100 mt-1 max-w-xl">
                Live snapshot of your cash flow, sales performance, and
                inventory health.
              </p>
            </div>
            <div className="text-right text-xs md:text-sm">
              <div className="uppercase tracking-wide text-indigo-200">
                Current Month
              </div>
              <div className="font-semibold text-white">
                {new Date().toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <HeroMiniStat
              label="Sales this month"
              value={formatCurrency(salesThisMonth)}
            />
            <HeroMiniStat
              label="Expenses this month"
              value={formatCurrency(expensesThisMonth)}
            />
            <HeroMiniStat
              label="Estimated net cash"
              value={formatCurrency(netThisMonth)}
              tone={netThisMonth >= 0 ? "good" : "bad"}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Customer & Vendor Base
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-3xl font-bold">
                {totalCustomers}
              </div>
              <div className="text-xs text-slate-500">
                customers
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Vendors:{" "}
              <span className="font-semibold">
                {totalVendors}
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <TagPill label="Active invoices" value={totalSalesCount} />
            <TagPill
              label="Inventory items"
              value={stocks.length}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Top KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Cash Management"
          value={formatCurrency(netThisMonth)}
          description="Approximate net cash (sales - expenses) this month."
          tone={netThisMonth >= 0 ? "good" : "bad"}
        />
        <StatCard
          title="Sales This Month"
          value={formatCurrency(salesThisMonth)}
          description="Based on all sales invoices for the current month."
        />
        <StatCard
          title="Expenses This Month"
          value={formatCurrency(expensesThisMonth)}
          description="Operational & salary expenses recorded this month."
          tone="warn"
        />
      </div>

      {/* Middle section: invoices & inventory + charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Recent invoices */}
          <SectionCard title="Recent Invoices">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-slate-500">
                No invoices found yet. Create a sale to see it here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr className="text-left text-slate-500">
                      <th className="py-2 px-2">Invoice #</th>
                      <th className="py-2 px-2">Customer</th>
                      <th className="py-2 px-2 text-right">
                        Amount
                      </th>
                      <th className="py-2 px-2 text-right">
                        Paid
                      </th>
                      <th className="py-2 px-2 text-right">Due</th>
                      <th className="py-2 px-2 text-center">
                        Status
                      </th>
                      <th className="py-2 px-2 text-right">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b last:border-0"
                      >
                        <td className="py-2 px-2 text-xs font-mono">
                          {inv.invoiceNo || "—"}
                        </td>
                        <td className="py-2 px-2">
                          {inv.customer}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {formatCurrency(inv.paid)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {formatCurrency(inv.due)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <StatusPill status={inv.status} />
                        </td>
                        <td className="py-2 px-2 text-right text-xs text-slate-500">
                          {inv.date
                            ? new Date(
                                inv.date
                              ).toLocaleDateString("en-GB")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Inventory snapshot */}
          <SectionCard title="Inventory Snapshot">
            <p className="text-sm text-slate-600 mb-3">
              Real-time view of your inventory position: units on hand,
              low stock alerts and damaged quantities.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <MiniStat
                label="Units On Hand"
                value={inventorySnapshot.totalOnHand}
              />
              <MiniStat
                label="Low Stock Items"
                value={inventorySnapshot.lowStockCount}
              />
              <MiniStat
                label="Damaged Items"
                value={inventorySnapshot.damagedCount}
              />
              <MiniStat
                label="Stock Value"
                value={formatCurrency(
                  inventorySnapshot.stockValue
                )}
              />
            </div>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN: Charts + quick links + alerts */}
        <div className="space-y-4">
          {/* Sales performance charts */}
          <SectionCard title="Sales Performance (Last 6 Months)">
            {salesChartData.length === 0 ? (
              <p className="text-xs text-slate-500">
                Not enough data yet to build charts.
              </p>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                {/* Bar chart */}
                <ChartCard title="Sales vs Expenses" className="w-40 md:w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar
                        dataKey="sales"
                        name="Sales"
                        fill="#4f46e5"
                      />
                      <Bar
                        dataKey="expenses"
                        name="Expenses"
                        fill="#f97316"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Line chart */}
                <ChartCard title="Sales Trend" className="w-40 md:w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesChartData}>
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        name="Sales"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Donut chart */}
                <ChartCard
                  title="This Month: Sales vs Expenses"
                  className="w-40 md:w-48"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Pie
                        data={salesVsExpenseData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                      >
                        {salesVsExpenseData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={index === 0 ? "#4f46e5" : "#f97316"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}
          </SectionCard>

          {/* Quick links */}
          <SectionCard title="Quick Links">
            <div className="flex flex-col gap-2 text-sm">
              <button className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition">
                + New Invoice
              </button>
              <button className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition">
                + Record Expense
              </button>
              <button className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 transition">
                + Add Product
              </button>
            </div>
          </SectionCard>

          {/* Alerts */}
          <SectionCard title="Alerts">
            <ul className="text-sm list-disc list-inside text-slate-600 space-y-1">
              <li>
                Watch low stock:{" "}
                <span className="font-semibold">
                  {inventorySnapshot.lowStockCount}
                </span>{" "}
                products at or below reorder level.
              </li>
              <li>
                Active invoices this month:{" "}
                <span className="font-semibold">
                  {totalSalesCount}
                </span>
              </li>
              <li>
                Net cash this month:{" "}
                <span
                  className={
                    netThisMonth >= 0
                      ? "text-emerald-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {formatCurrency(netThisMonth)}
                </span>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// ===== Helper Components =====

function StatCard({ title, value, description, tone = "neutral" }) {
  const toneClasses = {
    neutral: "bg-white border-slate-200",
    good: "bg-emerald-50 border-emerald-100",
    warn: "bg-amber-50 border-amber-100",
    bad: "bg-red-50 border-red-100",
  };
  return (
    <div
      className={`rounded-xl border shadow-sm p-4 ${toneClasses[tone]}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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
      <div className="text-[10px] uppercase text-slate-500">
        {label}
      </div>
      <div className="text-sm font-semibold mt-1">
        {value ?? "—"}
      </div>
    </div>
  );
}

function HeroMiniStat({ label, value, tone = "neutral" }) {
  const toneText =
    tone === "good"
      ? "text-emerald-300"
      : tone === "bad"
      ? "text-red-300"
      : "text-indigo-100";
  return (
    <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10">
      <div className="text-[11px] uppercase tracking-wide font-semibold text-indigo-100">
        {label}
      </div>
      <div className={`mt-1 text-lg font-bold ${toneText}`}>
        {value}
      </div>
    </div>
  );
}

function TagPill({ label, value }) {
  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <span className="text-[10px] uppercase text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold mt-1">{value}</span>
    </div>
  );
}

function StatusPill({ status }) {
  const base = "px-2 py-1 text-[11px] rounded-full inline-flex";
  let cls = "bg-slate-100 text-slate-700";
  if (status === "Paid") cls = "bg-emerald-100 text-emerald-700";
  else if (status === "Unpaid")
    cls = "bg-red-100 text-red-700";
  else if (status === "Partially Paid")
    cls = "bg-amber-100 text-amber-700";

  return <span className={`${base} justify-center ${cls}`}>{status}</span>;
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div
      className={`bg-slate-50 border border-slate-200 rounded-lg p-3 h-64 flex flex-col items-center ${className}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2 text-center">
        {title}
      </div>
      <div className="flex-1 min-h-0 w-full">
        {children}
      </div>
    </div>
  );
}
