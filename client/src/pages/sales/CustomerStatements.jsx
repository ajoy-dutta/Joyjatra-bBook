// client/src/pages/sales/CustomerStatements.jsx

import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import AxiosInstance from "../../components/AxiosInstance";

export default function CustomerStatements() {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
      JSON.parse(localStorage.getItem("business_category")) || null
  );

  const safeNumber = (value) => {
    const num = parseFloat(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  // ---------- Load customers + sales ----------

  const loadCustomers = async () => {
    try {
      const res = await AxiosInstance.get("customers/", {
        params:{business_category:selectedCategory?.id || null}
      });
      const raw = res.data;
      const items = Array.isArray(raw) ? raw : raw.results || [];
      setCustomers(items);
    } catch (err) {
      console.error(err);
      // non-fatal, but helpful
    }
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await AxiosInstance.get("sales/", {
        params:{business_category:selectedCategory?.id || null}
      });
      const raw = res.data;
      const items = Array.isArray(raw) ? raw : raw.results || [];
      setSales(items);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load sales for statement";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadSales();
  }, []);

  // ---------- Derived data for selected customer ----------

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (c) => String(c.id) === String(selectedCustomerId)
      ) || null,
    [customers, selectedCustomerId]
  );

  const {
    statementRows,
    totalInvoiced,
    totalReceived,
    openingBalance,
    closingBalance,
  } = useMemo(() => {
    if (!selectedCustomer) {
      return {
        statementRows: [],
        totalInvoiced: 0,
        totalReceived: 0,
        openingBalance: 0,
        closingBalance: 0,
      };
    }

    const customerSales = sales.filter(
      (sale) =>
        String(sale.customer?.id) === String(selectedCustomer.id)
    );

    const rows = [];

    const opening = safeNumber(selectedCustomer.previous_due_amount);
    let runningBalance = opening;

    // Opening balance as first row (if non-zero)
    if (opening !== 0) {
      rows.push({
        type: "Opening Balance",
        date: null,
        sortDate: new Date("1970-01-01"),
        reference: "-",
        description: "Previous due balance",
        debit: opening > 0 ? opening : 0,
        credit: opening < 0 ? -opening : 0,
        balance: runningBalance,
      });
    }

    let invoiceTotal = 0;
    let paymentTotal = 0;

    customerSales.forEach((sale) => {
      const saleDate = new Date(sale.sale_date || "1970-01-01");
      const saleAmount = safeNumber(sale.total_payable_amount);

      // Invoice row (debit)
      invoiceTotal += saleAmount;
      runningBalance += saleAmount;

      rows.push({
        type: "Invoice",
        date: sale.sale_date,
        sortDate: saleDate,
        reference: sale.invoice_no || "N/A",
        description: "Sale invoice",
        debit: saleAmount,
        credit: 0,
        balance: runningBalance,
      });

      const payments = sale.payments || [];
      payments.forEach((p) => {
        const payDate = new Date(
          p.payment_date || sale.sale_date || "1970-01-01"
        );
        const paid = safeNumber(p.paid_amount);

        paymentTotal += paid;
        runningBalance -= paid;

        rows.push({
          type: "Payment",
          date: p.payment_date
            ? p.payment_date.slice(0, 10)
            : sale.sale_date || null,
          sortDate: payDate,
          reference: `PAY-${p.id}`,
          description: p.payment_mode
            ? `Payment (${p.payment_mode})`
            : "Payment received",
          debit: 0,
          credit: paid,
          balance: runningBalance,
        });
      });
    });

    // Sort all rows by date
    rows.sort((a, b) => a.sortDate - b.sortDate);

    // Ensure balance is recomputed in order (in case we changed order)
    let running = opening;
    const recomputedRows = rows.map((row) => {
      running = running + row.debit - row.credit;
      return { ...row, balance: running };
    });

    return {
      statementRows: recomputedRows,
      totalInvoiced: invoiceTotal,
      totalReceived: paymentTotal,
      openingBalance: opening,
      closingBalance: running,
    };
  }, [sales, selectedCustomer, safeNumber]);

  // ---------- UI helpers ----------

  const filteredCustomers = useMemo(() => {
    if (!searchCustomer.trim()) return customers;
    const term = searchCustomer.toLowerCase();
    return customers.filter(
      (c) =>
        (c.customer_name || "").toLowerCase().includes(term) ||
        (c.shop_name || "").toLowerCase().includes(term) ||
        (c.phone1 || "").toLowerCase().includes(term)
    );
  }, [customers, searchCustomer]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Customer Statement
          </h1>
          <p className="text-sm text-slate-500">
            View invoices, payments and running balance for a
            customer.
          </p>
        </div>
      </div>

      {/* Customer selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search + dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600">
            Select Customer
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FaSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchCustomer}
                onChange={(e) =>
                  setSearchCustomer(e.target.value)
                }
                placeholder="Search by name, shop or phone..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
              />
            </div>
          </div>
          <select
            value={selectedCustomerId}
            onChange={(e) =>
              setSelectedCustomerId(e.target.value)
            }
            className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
          >
            <option value="">-- Choose a customer --</option>
            {filteredCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name}{" "}
                {c.shop_name ? `(${c.shop_name})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-slate-500 text-[11px]">
              Opening Balance
            </div>
            <div className="text-lg font-semibold">
              ৳ {openingBalance.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-slate-500 text-[11px]">
              Total Invoiced
            </div>
            <div className="text-lg font-semibold">
              ৳ {totalInvoiced.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-slate-500 text-[11px]">
              Total Received
            </div>
            <div className="text-lg font-semibold">
              ৳ {totalReceived.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-slate-500 text-[11px]">
              Closing Balance
            </div>
            <div
              className={[
                "text-lg font-semibold",
                closingBalance > 0
                  ? "text-amber-700"
                  : closingBalance < 0
                  ? "text-emerald-700"
                  : "text-slate-800",
              ].join(" ")}
            >
              ৳ {closingBalance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Customer info */}
      {selectedCustomer && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs md:text-sm flex flex-col md:flex-row md:justify-between gap-2">
          <div>
            <div className="font-semibold">
              {selectedCustomer.customer_name}
            </div>
            <div className="text-slate-500">
              {selectedCustomer.shop_name}
            </div>
          </div>
          <div className="text-slate-500">
            <div>Phone: {selectedCustomer.phone1 || "N/A"}</div>
            <div>Address: {selectedCustomer.address || "N/A"}</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm px-3 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* Statement table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-x-auto">
        {loading ? (
          <p className="text-xs md:text-sm text-slate-500">
            Loading statement...
          </p>
        ) : !selectedCustomer ? (
          <p className="text-xs md:text-sm text-slate-500">
            Please select a customer to view statement.
          </p>
        ) : statementRows.length === 0 ? (
          <p className="text-xs md:text-sm text-slate-500">
            No invoices or payments found for this customer.
          </p>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="border-b bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-2 py-2 text-center">Date</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Reference</th>
                <th className="px-2 py-2">Description</th>
                <th className="px-2 py-2 text-right">Debit</th>
                <th className="px-2 py-2 text-right">Credit</th>
                <th className="px-2 py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {statementRows.map((row, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="px-2 py-1.5 text-center">
                    {row.date || "-"}
                  </td>
                  <td className="px-2 py-1.5">{row.type}</td>
                  <td className="px-2 py-1.5 font-mono text-[11px]">
                    {row.reference}
                  </td>
                  <td className="px-2 py-1.5">
                    {row.description || "-"}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {row.debit ? row.debit.toFixed(2) : ""}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {row.credit ? row.credit.toFixed(2) : ""}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {row.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
