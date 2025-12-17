import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

// ✅ default logo fallback
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

export default function PurchaseInvoices() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ business category state (reactive)
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // ✅ banner info (title/address/phone) from master
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payPurchase, setPayPurchase] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMode: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });

  // ✅ Manual tag for this PDF type (since you removed from DB)
  const DOC_TOP_TAG = "Cash Memo"; // or "ক্যাশ মেমো"

  const safeNumber = (value) => {
    const num = parseFloat(value ?? 0);
    return Number.isNaN(num) ? 0 : num;
  };

  const computeStatus = (totalPayable, totalPaid) => {
    if (totalPayable <= 0 && totalPaid <= 0) return "N/A";
    const due = Math.max(0, totalPayable - totalPaid);
    if (totalPaid <= 0 && totalPayable > 0) return "Unpaid";
    if (due <= 0) return "Paid";
    return "Partially Paid";
  };

  const statusColor = (status) => {
    if (status === "Paid") return "bg-emerald-100 text-emerald-700";
    if (status === "Unpaid") return "bg-red-100 text-red-700";
    if (status === "Partially Paid") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  // ✅ Listen to business switch (same tab + other tabs)
  useEffect(() => {
    const readBusiness = () => {
      setSelectedCategory(JSON.parse(localStorage.getItem("business_category")) || null);
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

  // ✅ Fetch banner for selected business
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

  // -------- Fetch purchases --------
  const fetchPurchases = async (categoryId) => {
    try {
      setLoading(true);
      setError("");

      const res = await AxiosInstance.get("/purchases/", {
        params: { business_category: categoryId },
      });

      const raw = res.data;
      const list = Array.isArray(raw) ? raw : raw.results || [];

      const mapped = list.map((p) => {
        const totalPayable = safeNumber(p.total_payable_amount);
        const payments = p.payments || [];
        const totalPaid = payments.reduce((sum, pay) => sum + safeNumber(pay.paid_amount), 0);

        const due = Math.max(0, totalPayable - totalPaid);
        const status = computeStatus(totalPayable, totalPaid);

        return {
          ...p,
          _totalPayable: totalPayable,
          _totalPaid: totalPaid,
          _due: due,
          _status: status,
          _vendorName: p.vendor?.vendor_name || p.vendor?.shop_name || "N/A",
        };
      });

      mapped.sort((a, b) => new Date(b.purchase_date || "1970-01-01") - new Date(a.purchase_date || "1970-01-01"));
      setPurchases(mapped);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail || err.message || "Failed to load purchase invoices";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refetch purchases + banner whenever business changes
  useEffect(() => {
    const id = selectedCategory?.id || null;
    fetchBanner(id);
    fetchPurchases(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  // -------- Filters --------
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const term = search.trim().toLowerCase();

      if (term) {
        const matches =
          (p.invoice_no || "").toLowerCase().includes(term) ||
          (p._vendorName || "").toLowerCase().includes(term);
        if (!matches) return false;
      }

      if (statusFilter === "all") return true;
      return p._status === statusFilter;
    });
  }, [purchases, search, statusFilter]);

  const totals = useMemo(() => {
    const totalPayable = filteredPurchases.reduce((sum, p) => sum + p._totalPayable, 0);
    const totalPaid = filteredPurchases.reduce((sum, p) => sum + p._totalPaid, 0);
    const totalDue = filteredPurchases.reduce((sum, p) => sum + p._due, 0);
    return { totalPayable, totalPaid, totalDue };
  }, [filteredPurchases]);

  // -------- Payment Modal Logic --------
  const openPayModal = (purchase) => {
    if (purchase._due <= 0) {
      toast("This bill is already fully paid.");
      return;
    }
    setPayPurchase(purchase);
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: purchase._due.toFixed(2),
    });
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    if (savingPayment) return;
    setPayModalOpen(false);
    setPayPurchase(null);
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const isBankLike = paymentData.paymentMode === "Bank" || paymentData.paymentMode === "Cheque";

  const handleSavePayment = async () => {
    if (!payPurchase || savingPayment) return;

    const paid = safeNumber(paymentData.paidAmount);

    if (paid <= 0) return toast.error("Paid amount must be greater than 0");
    if (paid > payPurchase._due + 0.0001) return toast.error("Paid amount cannot be more than due amount");
    if (!paymentData.paymentMode) return toast.error("Select a payment mode");

    const payload = {
      purchase_id: payPurchase.id,
      payment_mode: paymentData.paymentMode,
      bank_name: isBankLike ? paymentData.bankName || "" : "",
      account_no: isBankLike ? paymentData.accountNo || "" : "",
      cheque_no: paymentData.paymentMode === "Cheque" ? paymentData.chequeNo || "" : "",
      paid_amount: paid.toFixed(2),
    };

    try {
      setSavingPayment(true);
      await AxiosInstance.post("/purchase-payments/", payload);
      toast.success("Payment saved successfully");
      await fetchPurchases(selectedCategory?.id || null);
      closePayModal();
    } catch (err) {
      console.error("Error saving purchase payment:", err);
      toast.error("Failed to save payment");
    } finally {
      setSavingPayment(false);
    }
  };

  // -------- PRINT / INVOICE LOGIC --------
  const handleGeneratePurchasePdf = (purchase) => {
    if (!purchase) return;

    // ✅ Header comes from business master (banner), BUT top tag is manual
    const bnHeader = {
      topTag: DOC_TOP_TAG,
      title: banner?.banner_title || selectedCategory?.name || "Business Name",
      address1: banner?.banner_address1 || "",
      address2: banner?.banner_address2 || "",
      mobile: banner?.banner_phone || "",
    };

    const logoUrl = joyjatraLogo;

    const products = purchase.products || [];

    const totalQty = products.reduce((sum, item) => sum + safeNumber(item.purchase_quantity), 0);

    const totalAmount = safeNumber(purchase.total_amount);
    const discount = safeNumber(purchase.discount_amount);
    const grossTotal = totalAmount - discount;

    const previousBalance = safeNumber(purchase.vendor?.previous_due_amount);
    const netAmount = grossTotal;

    const paidAmount =
      (purchase.payments || []).reduce((sum, payment) => sum + safeNumber(payment.paid_amount), 0) || 0;

    const dueAmount = netAmount - paidAmount;
    const totalDueBalance = previousBalance + dueAmount;

    const now = new Date();
    const printDate = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const htmlContent = `
      <html>
      <head>
        <title>Purchase Invoice - ${purchase.invoice_no || ""}</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">

        <style>
          @page { margin: 15mm; size: A4; }
          body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #000; }
          .bn { font-family: "Noto Sans Bengali", Arial, sans-serif; }

          .header-wrap{
            display: grid;
            grid-template-columns: 120px 1fr 120px;
            align-items: center;
            column-gap: 10px;
            margin-bottom: 10px;
          }

          .logo-box{ display: flex; justify-content: flex-start; align-items: center; }
          .logo-img{ width: 110px; height: auto; object-fit: contain; }
          .header-text{ text-align: center; }

          .bn-top-tag {
            display: inline-block;
            font-weight: 700;
            font-size: 14px;
            padding: 2px 10px;
            border: 1px solid #000;
            border-radius: 14px;
            margin-bottom: 6px;
          }

          .company-name { font-size: 26px; font-weight: 800; }
          .contact-info { font-size: 12px; margin-top: 2px; line-height: 1.35; }

          .customer-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin: 10px 0;
          }

          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #000; padding: 4px; font-size: 11px; }
          th { text-align: center; background-color: #f3f4f6; }

          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .product-left { text-align: left !important; }

          .summary-table {
            width: 40%;
            margin-left: auto;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 10px;
          }

          .summary-table th, .summary-table td { border: 1px solid #000; padding: 4px; }
          .summary-table th { text-align: left; background-color: #f3f4f6; }
          .summary-table td { text-align: right; }

          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            font-size: 11px;
          }

          .signature { text-align: center; width: 45%; }
          .signature-line { margin-bottom: 2px; border-top: 1px solid #000; width: 100%; }

          .footer-content {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header-wrap">
          <div class="logo-box">
            <img class="logo-img" src="${logoUrl}" alt="Logo" />
          </div>

          <div class="header-text">
            ${bnHeader.topTag ? `<div class="bn bn-top-tag">${bnHeader.topTag}</div>` : ""}
            <div class="bn company-name">${bnHeader.title || ""}</div>
            ${bnHeader.address1 ? `<div class="bn contact-info">${bnHeader.address1}</div>` : ""}
            ${bnHeader.address2 ? `<div class="bn contact-info">${bnHeader.address2}</div>` : ""}
            ${bnHeader.mobile ? `<div class="bn contact-info">${bnHeader.mobile}</div>` : ""}
          </div>

          <div></div>
        </div>

        <h2 style="text-align:center; margin: 14px 0;">Purchase Invoice</h2>

        <div class="customer-info">
          <div>
            <div><strong>Invoice No:</strong> ${purchase.invoice_no || "N/A"}</div>
            <div><strong>Vendor Name:</strong> ${purchase.vendor?.vendor_name || purchase.vendor?.shop_name || "N/A"}</div>
            <div><strong>Address:</strong> ${purchase.vendor?.address || "N/A"}</div>
          </div>
          <div style="text-align:right;">
            <div><strong>Purchase Date:</strong> ${purchase.purchase_date || "N/A"}</div>
            <div><strong>Phone:</strong> ${purchase.vendor?.phone1 || "N/A"}</div>
          </div>
        </div>

        <div><strong>Product Details:</strong></div>

        <table>
          <thead>
            <tr>
              <th class="text-center">Sl No</th>
              <th class="product-left">Product Name</th>
              <th class="text-center">Quantity</th>
              <th class="text-center">Unit Price</th>
              <th class="text-center">Total Taka</th>
            </tr>
          </thead>
          <tbody>
            ${
              products.length === 0
                ? `<tr><td colspan="5" class="text-center">No products</td></tr>`
                : products
                    .map(
                      (item, index) => `
                        <tr>
                          <td class="text-center">${index + 1}</td>
                          <td class="product-left">${item.product?.product_name || "N/A"}</td>
                          <td class="text-center">${safeNumber(item.purchase_quantity).toFixed(2)}</td>
                          <td class="text-center">${safeNumber(item.purchase_price).toFixed(2)}</td>
                          <td class="text-center">${safeNumber(item.total_price).toFixed(2)}</td>
                        </tr>`
                    )
                    .join("")
            }
            <tr>
              <td colspan="2" class="text-right"><strong>Total</strong></td>
              <td class="text-center"><strong>${totalQty.toFixed(2)}</strong></td>
              <td></td>
              <td class="text-center"><strong>${grossTotal.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="summary-table">
          <tbody>
            <tr><th>Total Amount</th><td>৳ ${totalAmount.toFixed(2)}</td></tr>
            <tr><th>Less Discount</th><td>৳ ${discount.toFixed(2)}</td></tr>
            <tr><th>Net Payable</th><td>৳ ${netAmount.toFixed(2)}</td></tr>
            <tr><th>Paid Amount</th><td>৳ ${paidAmount.toFixed(2)}</td></tr>
            <tr><th>Due Amount</th><td>৳ ${dueAmount.toFixed(2)}</td></tr>
            <tr><th>Previous Balance</th><td>৳ ${previousBalance.toFixed(2)}</td></tr>
            <tr><th>Total Due Balance</th><td>৳ ${totalDueBalance.toFixed(2)}</td></tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="signature">
            <div class="signature-line"></div>
            Supplier Signature
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            Approved By
          </div>
        </div>

        <div class="footer-content">
          <div>
            <div>*Keep this invoice for future reference.</div>
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

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      toast.error("Popup blocked. Please allow popups to print invoice.");
    }
  };

  // -------- UI --------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Purchase Invoices</h1>
          <p className="text-sm text-slate-500">
            Manage supplier bills, track due amounts and record payments.
          </p>

          <div className="mt-1 text-xs text-slate-500">
            Business:{" "}
            <span className="font-semibold text-slate-700">
              {selectedCategory?.name || "N/A"}
            </span>
            {bannerLoading ? <span className="ml-2 text-slate-400">(Loading banner...)</span> : null}
          </div>
        </div>
      </div>

      {/* Filters + Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # / vendor"
            className="text-sm border border-slate-200 rounded-full px-3 py-1.5 w-72 focus:outline-none focus:ring focus:ring-blue-500/30"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
          >
            <option value="all">Status: All</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 text-xs md:text-sm">
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Invoices: <span className="font-semibold">{filteredPurchases.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Total Payable: <span className="font-semibold">৳ {totals.totalPayable.toFixed(2)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Total Paid: <span className="font-semibold text-emerald-700">৳ {totals.totalPaid.toFixed(2)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Total Due: <span className="font-semibold text-red-600">৳ {totals.totalDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm px-3 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-x-auto">
        {loading ? (
          <p className="text-xs md:text-sm text-slate-500">Loading purchase invoices...</p>
        ) : filteredPurchases.length === 0 ? (
          <p className="text-xs md:text-sm text-slate-500">No purchase invoices found.</p>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="border-b bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-2 px-2 text-center">Date</th>
                <th className="py-2 px-2">Invoice No</th>
                <th className="py-2 px-2">Vendor</th>
                <th className="py-2 px-2 text-right">Total Payable</th>
                <th className="py-2 px-2 text-right">Paid</th>
                <th className="py-2 px-2 text-right">Due</th>
                <th className="py-2 px-2 text-center">Status</th>
                <th className="py-2 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 px-2 text-center">{p.purchase_date || "-"}</td>
                  <td className="py-2 px-2 font-mono text-[11px]">
                    {p.invoice_no || `PUR-${p.id}`}
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-medium text-slate-800 text-xs md:text-sm">{p._vendorName}</div>
                  </td>
                  <td className="py-2 px-2 text-right">{p._totalPayable.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">{p._totalPaid.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">{p._due.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`px-2 py-1 text-[11px] rounded-full inline-flex items-center justify-center ${statusColor(p._status)}`}>
                      {p._status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleGeneratePurchasePdf(p)}
                        className="px-3 py-1.5 rounded-full text-[11px] font-medium border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      >
                        Invoice
                      </button>

                      <button
                        onClick={() => openPayModal(p)}
                        disabled={p._due <= 0}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${
                          p._due <= 0
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        {p._due <= 0 ? "Paid" : "Pay Due"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Modal (keep your existing modal UI here) */}
      {payModalOpen && payPurchase && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 space-y-4">
            {/* KEEP your modal content from previous code */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm md:text-base font-semibold">Pay Supplier Due</h2>
              <button onClick={closePayModal} className="text-slate-400 hover:text-slate-600 text-lg">
                ×
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs md:text-sm space-y-1">
              <div className="font-semibold">{payPurchase._vendorName}</div>
              <div className="text-slate-500">
                Invoice:{" "}
                <span className="font-mono">
                  {payPurchase.invoice_no || `PUR-${payPurchase.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Payable</span>
                <span className="font-semibold">৳ {payPurchase._totalPayable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Already Paid</span>
                <span className="font-semibold text-emerald-700">৳ {payPurchase._totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Due</span>
                <span className="font-semibold text-red-600">৳ {payPurchase._due.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">Payment Mode</label>
                <select
                  value={paymentData.paymentMode}
                  onChange={(e) => handlePaymentChange("paymentMode", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
                >
                  <option value="">-- Select --</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {isBankLike && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Bank Name</label>
                    <input
                      type="text"
                      value={paymentData.bankName}
                      onChange={(e) => handlePaymentChange("bankName", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Account No</label>
                    <input
                      type="text"
                      value={paymentData.accountNo}
                      onChange={(e) => handlePaymentChange("accountNo", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Cheque No</label>
                    <input
                      type="text"
                      value={paymentData.chequeNo}
                      onChange={(e) => handlePaymentChange("chequeNo", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.paidAmount}
                  onChange={(e) => handlePaymentChange("paidAmount", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closePayModal}
                disabled={savingPayment}
                className="px-3 py-1.5 rounded-lg text-xs md:text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                disabled={savingPayment}
                className="px-4 py-1.5 rounded-lg text-xs md:text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingPayment ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
