// client/src/pages/expenses/PurchaseExpense.jsx

import React, { useEffect, useState, useMemo } from "react";
import AxiosInstance from "../../components/AxiosInstance";

const safeNumber = (value) => {
  const num = parseFloat(value || 0);
  return Number.isNaN(num) ? 0 : num;
};

export default function PurchaseExpense() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // extra filters
  const [filterVendor, setFilterVendor] = useState(""); // key for vendor
  const [filterStartDate, setFilterStartDate] = useState(""); // YYYY-MM-DD
  const [filterEndDate, setFilterEndDate] = useState(""); // YYYY-MM-DD

  // -------- load data --------
  const loadPurchases = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const res = await AxiosInstance.get("/purchases/", {
        params: searchValue ? { search: searchValue } : {},
      });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : raw?.results || [];
      setPurchases(list);
    } catch (e) {
      console.error("Failed to load purchases for expense view", e);
      setError("Failed to load purchase expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  // -------- vendor options for filter --------
  const vendorOptions = useMemo(() => {
    const map = new Map();
    purchases.forEach((p) => {
      const v = p.vendor;
      if (!v) return;
      const key =
        v.id != null
          ? String(v.id)
          : v.vendor_name || v.shop_name || "";
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: v.vendor_name || v.shop_name || `Vendor #${key}`,
        });
      }
    });
    return Array.from(map.values());
  }, [purchases]);

  const getVendorKey = (p) => {
    const v = p.vendor;
    if (!v) return "";
    return v.id != null
      ? String(v.id)
      : v.vendor_name || v.shop_name || "";
  };

  // -------- derived values --------
  const filtered = useMemo(() => {
    let result = purchases;

    // text search (vendor name or invoice no)
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((p) => {
        const vendorName =
          p.vendor?.vendor_name ||
          p.vendor?.shop_name ||
          "";
        return (
          vendorName.toLowerCase().includes(s) ||
          (p.invoice_no || "").toLowerCase().includes(s)
        );
      });
    }

    // vendor filter
    if (filterVendor) {
      result = result.filter(
        (p) => getVendorKey(p) === filterVendor
      );
    }

    // date range filter - purchase_date assumed "YYYY-MM-DD"
    if (filterStartDate) {
      result = result.filter(
        (p) =>
          p.purchase_date &&
          p.purchase_date >= filterStartDate
      );
    }
    if (filterEndDate) {
      result = result.filter(
        (p) =>
          p.purchase_date &&
          p.purchase_date <= filterEndDate
      );
    }

    return result;
  }, [purchases, search, filterVendor, filterStartDate, filterEndDate]);

  const totalPurchaseExpense = useMemo(
    () =>
      filtered.reduce(
        (sum, p) => sum + safeNumber(p.total_payable_amount),
        0
      ),
    [filtered]
  );

  const formatCurrency = (value) =>
    `৳ ${safeNumber(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // -------- Export / Print helpers --------
  const escapeCsv = (value) => {
    if (value == null) return "";
    const stringValue = String(value);
    if (
      stringValue.includes('"') ||
      stringValue.includes(",") ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCsv = () => {
    const headers = [
      "Date",
      "Invoice No",
      "Vendor",
      "Total Payable",
    ];

    const rows = filtered.map((p) => [
      p.purchase_date || "",
      p.invoice_no || `PU-${p.id}`,
      p.vendor?.vendor_name ||
        p.vendor?.shop_name ||
        "N/A",
      safeNumber(p.total_payable_amount).toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "purchase_expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const content = document.getElementById(
      "purchase-expense-print-area"
    );
    if (!content) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Expense</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              padding: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 4px 6px;
              text-align: right;
            }
            th:nth-child(1), td:nth-child(1),
            th:nth-child(2), td:nth-child(2),
            th:nth-child(3), td:nth-child(3) {
              text-align: left;
            }
            thead { background-color: #f3f4f6; }
            tfoot { background-color: #111827; color: white; }
            h2 { margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h2>Purchase Expense</h2>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // -------- UI --------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Purchase Expense
          </h2>
          <p className="text-xs text-slate-500">
            All purchase invoices treated as company expenses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by vendor or invoice no..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="button"
            onClick={() => loadPurchases(search)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-6 text-sm">
        <div>
          <div className="text-xs text-slate-500 uppercase">
            Total Purchase Expense
          </div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(totalPurchaseExpense)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase">
            Total Purchase Invoices
          </div>
          <div className="mt-1 text-lg font-semibold">
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3 items-center text-xs">
        {/* Vendor filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Vendor:</span>
          <select
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            className="px-2 py-1 rounded-full border border-slate-300 bg-white"
          >
            <option value="">All vendors</option>
            {vendorOptions.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">From:</span>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-2 py-1 rounded-full border border-slate-300 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">To:</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="px-2 py-1 rounded-full border border-slate-300 bg-white"
          />
        </div>

        {/* Clear filters */}
        <button
          type="button"
          onClick={() => {
            setFilterVendor("");
            setFilterStartDate("");
            setFilterEndDate("");
          }}
          className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Clear filter
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export CSV */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="px-3 py-1 rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        >
          Export Excel (CSV)
        </button>

        {/* Print / PDF */}
        <button
          type="button"
          onClick={handlePrint}
          className="px-3 py-1 rounded-full border border-indigo-600 text-indigo-700 hover:bg-indigo-50"
        >
          Print / PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Purchase Expense Details
          </h3>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div id="purchase-expense-print-area">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr className="text-left text-slate-500">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Invoice No</th>
                  <th className="py-2 px-2">Vendor</th>
                  <th className="py-2 px-2 text-right">
                    Total Payable
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 px-2">
                      {p.purchase_date || "--"}
                    </td>
                    <td className="py-2 px-2">
                      {p.invoice_no || `PU-${p.id}`}
                    </td>
                    <td className="py-2 px-2">
                      {p.vendor?.vendor_name ||
                        p.vendor?.shop_name ||
                        "N/A"}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {formatCurrency(p.total_payable_amount)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 px-2 text-center text-slate-400"
                    >
                      No purchase expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
