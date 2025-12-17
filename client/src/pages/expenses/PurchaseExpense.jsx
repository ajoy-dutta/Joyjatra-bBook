// client/src/pages/expenses/PurchaseExpense.jsx

import React, { useEffect, useState, useMemo } from "react";
import AxiosInstance from "../../components/AxiosInstance";

// ✅ logo fallback (same idea like PurchaseInvoices)
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

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

  // ✅ business category (reactive) (same pattern as Expense.jsx)
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // ✅ banner info (category-wise)
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  // ✅ Print header tag (like Purchase Invoice top pill)
  const DOC_TOP_TAG = ""; // you can rename to "Purchase Expense" if your invoice uses that

  // ✅ Listen to business switch (same tab + other tabs)
  useEffect(() => {
    const readBusiness = () => {
      setSelectedCategory(
        JSON.parse(localStorage.getItem("business_category")) || null
      );
    };

    const onStorage = (e) => {
      if (e.key === "business_category") readBusiness();
    };

    const onBusinessChanged = () => readBusiness();

    window.addEventListener("storage", onStorage);
    window.addEventListener("business_category_changed", onBusinessChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("business_category_changed", onBusinessChanged);
    };
  }, []);

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

  // ✅ Fetch banner category-wise (same as Expense.jsx)
  const fetchBanner = async (categoryId) => {
    if (!categoryId) {
      setBanner(null);
      return;
    }
    try {
      setBannerLoading(true);
      const res = await AxiosInstance.get(`/business-categories/${categoryId}/`);
      setBanner(res.data);
    } catch (e) {
      console.error("Failed to fetch banner:", e);
      setBanner(null);
    } finally {
      setBannerLoading(false);
    }
  };

  // ✅ refetch banner when business changes
  useEffect(() => {
    const id = selectedCategory?.id || null;
    fetchBanner(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  // -------- vendor options for filter --------
  const vendorOptions = useMemo(() => {
    const map = new Map();
    purchases.forEach((p) => {
      const v = p.vendor;
      if (!v) return;
      const key =
        v.id != null ? String(v.id) : v.vendor_name || v.shop_name || "";
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
    return v.id != null ? String(v.id) : v.vendor_name || v.shop_name || "";
  };

  // -------- derived values --------
  const filtered = useMemo(() => {
    let result = purchases;

    // text search (vendor name or invoice no)
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((p) => {
        const vendorName = p.vendor?.vendor_name || p.vendor?.shop_name || "";
        return (
          vendorName.toLowerCase().includes(s) ||
          (p.invoice_no || "").toLowerCase().includes(s)
        );
      });
    }

    // vendor filter
    if (filterVendor) {
      result = result.filter((p) => getVendorKey(p) === filterVendor);
    }

    // date range filter - purchase_date assumed "YYYY-MM-DD"
    if (filterStartDate) {
      result = result.filter(
        (p) => p.purchase_date && p.purchase_date >= filterStartDate
      );
    }
    if (filterEndDate) {
      result = result.filter(
        (p) => p.purchase_date && p.purchase_date <= filterEndDate
      );
    }

    return result;
  }, [purchases, search, filterVendor, filterStartDate, filterEndDate]);

  const totalPurchaseExpense = useMemo(
    () => filtered.reduce((sum, p) => sum + safeNumber(p.total_payable_amount), 0),
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
    const headers = ["Date", "Invoice No", "Vendor", "Total Payable"];

    const rows = filtered.map((p) => [
      p.purchase_date || "",
      p.invoice_no || `PU-${p.id}`,
      p.vendor?.vendor_name || p.vendor?.shop_name || "N/A",
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

  // ---------------- PRINT / PDF (MAKE LIKE PURCHASE INVOICE) ----------------
  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const header = {
      topTag: DOC_TOP_TAG,
      title: banner?.banner_title || selectedCategory?.name || "Business Name",
      address1: banner?.banner_address1 || "",
      address2: banner?.banner_address2 || "",
      mobile: banner?.banner_phone || "",
    };

    const rowsHtml =
      filtered.length === 0
        ? `<tr><td colspan="5" class="text-center">No data found</td></tr>`
        : filtered
            .map(
              (p, idx) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="text-center">${p.purchase_date || "-"}</td>
                  <td class="text-center">${p.invoice_no || `PU-${p.id}`}</td>
                  <td>${p.vendor?.vendor_name || p.vendor?.shop_name || "N/A"}</td>
                  <td class="text-right">${safeNumber(p.total_payable_amount).toFixed(2)}</td>
                </tr>
              `
            )
            .join("");

    const html = `
      <html>
      <head>
        <title>Purchase Expense</title>

        <style>
          @page { margin: 15mm; size: A4; }
          body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #000; }

          .topline { display:flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
          .topline-center { flex: 1; text-align: center; font-weight: 700; }
          .topline-left { width: 180px; }
          .topline-right { width: 180px; }

          .header-wrap{
            display: grid;
            grid-template-columns: 120px 1fr 120px;
            align-items: center;
            column-gap: 10px;
            margin-bottom: 10px;
          }
          .logo-box{ display:flex; justify-content:flex-start; align-items:center; }
          .logo-img{ width: 110px; height: auto; object-fit: contain; }

          .header-text{ text-align:center; }
          .top-tag{
            display:inline-block;
            font-weight:700;
            font-size: 13px;
            padding: 2px 10px;
            border: 1px solid #000;
            border-radius: 14px;
            margin-bottom: 6px;
          }
          .company-name{ font-size: 26px; font-weight: 800; }
          .contact-info{ font-size: 12px; margin-top: 2px; line-height: 1.35; }

          h2{ text-align:center; margin: 14px 0; }

          table{ width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td{ border: 1px solid #000; padding: 4px; font-size: 11px; }
          th{ text-align: center; background: #f3f4f6; }
          .text-center{ text-align:center; }
          .text-right{ text-align:right; }

          tfoot td{
            font-weight: 700;
            background: #111827;
            color: #fff;
          }

          .footer-content{
            display:flex;
            justify-content: space-between;
            font-size: 11px;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 14px;
          }
        </style>
      </head>
      <body>
        <div class="topline">
          <div class="topline-left">${printDate}</div>
          <div class="topline-center">Purchase Expense</div>
          <div class="topline-right"></div>
        </div>

        <div class="header-wrap">
          <div class="logo-box">
            <img class="logo-img" src="${joyjatraLogo}" alt="Logo" />
          </div>

          <div class="header-text">
            ${header.topTag ? `<div class="top-tag">${header.topTag}</div>` : ""}
            <div class="company-name">${header.title || ""}</div>
            ${header.address1 ? `<div class="contact-info">${header.address1}</div>` : ""}
            ${header.address2 ? `<div class="contact-info">${header.address2}</div>` : ""}
            ${header.mobile ? `<div class="contact-info">${header.mobile}</div>` : ""}
          </div>

          <div></div>
        </div>

        <h2>Purchase Expense</h2>

        <table>
          <thead>
            <tr>
              <th style="width:40px;">SL</th>
              <th style="width:90px;">Date</th>
              <th style="width:120px;">Invoice No</th>
              <th>Vendor</th>
              <th style="width:110px;">Total Payable</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Total</td>
              <td class="text-right">৳ ${safeNumber(totalPurchaseExpense).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer-content">
          <div>
            <div>*Keep this report for future reference.</div>
            <div>*Save Trees, Save Generations.</div>
          </div>
          <div>Print: Admin, ${printDate}</div>
        </div>

        <script>
          setTimeout(() => { window.print(); }, 200);
        </script>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return alert("Popup blocked. Please allow popups to print.");
    win.document.write(html);
    win.document.close();
  };

  // -------- UI --------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Purchase Expense</h2>
          <p className="text-xs text-slate-500">
            All purchase invoices treated as company expenses.
          </p>

          {/* ✅ optional banner loading indicator like Expense.jsx */}
          <div className="text-xs text-slate-500 mt-1">
            Business:{" "}
            <span className="font-semibold text-slate-700">
              {selectedCategory?.name || "N/A"}
            </span>
            {bannerLoading ? (
              <span className="ml-2 text-slate-400">(Loading banner...)</span>
            ) : null}
          </div>
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
          <div className="text-xs text-slate-500 uppercase">Total Purchase Expense</div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(totalPurchaseExpense)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase">Total Purchase Invoices</div>
          <div className="mt-1 text-lg font-semibold">{filtered.length}</div>
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
          <h3 className="text-sm font-semibold text-slate-800">Purchase Expense Details</h3>
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
                  <th className="py-2 px-2 text-right">Total Payable</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 px-2">{p.purchase_date || "--"}</td>
                    <td className="py-2 px-2">{p.invoice_no || `PU-${p.id}`}</td>
                    <td className="py-2 px-2">
                      {p.vendor?.vendor_name || p.vendor?.shop_name || "N/A"}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {formatCurrency(p.total_payable_amount)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 px-2 text-center text-slate-400">
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
