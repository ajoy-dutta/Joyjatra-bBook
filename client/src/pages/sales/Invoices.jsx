import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import AxiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PaymentModal from "./PaymentModal";



export default function SalesList() {
  // ✅ Manual tag for PDF (since removed from DB)
  const DOC_TOP_TAG = "ক্যাশ মেমো"; // or "Cash Memo"

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "34px",
      height: "34px",
      fontSize: "0.875rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      borderColor: state.isFocused ? "#0f766e" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 1px #0f766e" : "none",
      paddingTop: "0px",
      paddingBottom: "0px",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#ffffff",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "34px",
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#9ca3af",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#111827",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    input: (base) => ({
      ...base,
      fontSize: "0.875rem",
      margin: "0",
      padding: "0",
      color: "#111827",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "34px",
      display: "flex",
      alignItems: "center",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#e5e7eb",
      height: "16px",
      marginTop: "auto",
      marginBottom: "auto",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": { color: "#0f172a" },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": { color: "#0f172a" },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected ? "#0f766e" : state.isFocused ? "#ecfeff" : "white",
      color: state.isSelected ? "white" : "#111827",
      "&:hover": { backgroundColor: state.isSelected ? "#0f766e" : "#ecfeff" },
    }),
    menu: (base) => ({ ...base, fontSize: "0.875rem", zIndex: 30 }),
    menuList: (base) => ({ ...base, fontSize: "0.875rem" }),
  };

  // ✅ business category (reactive)
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // ✅ banner info from business master
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(false);


  // Main states
  const [allSales, setAllSales] = useState([]);
  const [sales, setSales] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [returnData, setReturnData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Return modal
  const [returnModalSale, setReturnModalSale] = useState(null);
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().slice(0, 10),
    productName: "",
    saleQty: "",
    currentQty: "",
    price: "",
    dueAmount: "",
    alreadyReturnQty: "",
    returnQty: "",
    returnAmount: "",
    returnRemarks: "",
    selectedProductIndex: 0,
  });
  const [errors, setErrors] = useState({});
  const returnModalRef = useRef(null);
  const navigate = useNavigate();

  // Payment modal
  const [payModalSale, setPayModalSale] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    customer: null,
    district: null,
    billNo: "",
  });

  const safeNumber = (v) => {
    const n = parseFloat(v ?? 0);
    return Number.isNaN(n) ? 0 : n;
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

  // ✅ fetch banner
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

  // Data fetches
  const fetchSales = async (categoryId) => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get("/sales/", {
        params: { business_category: categoryId || null },
      });

      const raw = res.data;
      const list = Array.isArray(raw) ? raw : raw.results || [];

      setAllSales(list);
      setSales(list);
    } catch (err) {
      console.error("Failed to load sales:", err);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async (categoryId) => {
    try {
      const res = await AxiosInstance.get("/stocks/", {
        params: { business_category: categoryId || null },
      });
      const raw = res.data;
      setStockData(Array.isArray(raw) ? raw : raw.results || []);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      toast.error("Failed to load stock data");
    }
  };

  const fetchReturnData = async () => {
    try {
      const res = await AxiosInstance.get("/sale-returns/");
      const raw = res.data;
      setReturnData(Array.isArray(raw) ? raw : raw.results || []);
    } catch (error) {
      console.error("Error fetching return data:", error);
      toast.error("Failed to load return data");
    }
  };

  const fetchDistricts = async () => {
    const res = await AxiosInstance.get("/districts/");
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw.results || [];
    setDistricts(list.map((d) => ({ value: d.id, label: d.name })));
  };

  const fetchCustomers = async (categoryId) => {
    const res = await AxiosInstance.get("/customers/", {
      params: { business_category: categoryId || null },
    });
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw.results || [];
    setCustomers(
      list.map((c) => ({
        value: c.id,
        label: c.customer_name,
      }))
    );
  };

 
  // ✅ refetch everything when business changes
  useEffect(() => {
    const id = selectedCategory?.id || null;

    const run = async () => {
      try {
        await Promise.all([
          fetchBanner(id),
          fetchSales(id),
          fetchStockData(id),
          fetchReturnData(),
          fetchDistricts(),
          fetchCustomers(id),
        ]);
      } catch (e) {
        console.error("Initial/business data loading failed:", e);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  // Expand row
  const toggleRow = (id) => {
    const newSet = new Set(expandedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedRows(newSet);
  };

  // Filtering logic
  useEffect(() => {
    let filtered = [...allSales];

    if (filters.customer) {
      filtered = filtered.filter((s) => s.customer?.id === filters.customer.value);
    }

    if (filters.district) {
      filtered = filtered.filter((s) => s.customer?.district_detail?.id === filters.district.value);
    }

    if (filters.billNo.trim() !== "") {
      filtered = filtered.filter((s) =>
        (s.invoice_no || "").toLowerCase().includes(filters.billNo.trim().toLowerCase())
      );
    }

    setSales(filtered);
    setCurrentPage(1);
  }, [filters, allSales]);

  // Filter handlers
  const handleCustomerChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, customer: selectedOption }));
  };
  const handleDistrictChange = (selectedOption) => {
    setFilters((prev) => ({ ...prev, district: selectedOption }));
  };
  const handleBillNoChange = (e) => {
    setFilters((prev) => ({ ...prev, billNo: e.target.value }));
  };

  // ===== Return modal logic =====
  const handleOpenReturnModal = (sale) => {
    if (!sale || !sale.products || sale.products.length === 0) {
      toast.error("Invalid sale data");
      return;
    }

    const firstProduct = sale.products[0];
    const matchedStock = stockData.find((stock) => stock.product?.id === firstProduct.product?.id);

    const alreadyReturnedQty = returnData
      .filter((returnItem) => returnItem.sale_product?.id === firstProduct.id)
      .reduce((sum, item) => sum + safeNumber(item.quantity), 0);

    const dueAmount = (
      safeNumber(sale.total_payable_amount) -
      (sale.payments?.reduce((acc, p) => acc + safeNumber(p.paid_amount), 0) || 0)
    ).toFixed(2);

    setReturnModalSale(sale);
    setFormData({
      returnDate: new Date().toISOString().slice(0, 10),
      productName: firstProduct.product?.product_name || "",
      saleQty: firstProduct.sale_quantity || "",
      currentQty: matchedStock?.current_stock_quantity || "0",
      price: firstProduct.sale_price || "",
      dueAmount,
      alreadyReturnQty: String(alreadyReturnedQty),
      returnQty: "",
      returnAmount: "",
      returnRemarks: "",
      selectedProductIndex: 0,
    });

    setErrors({});
    returnModalRef.current?.showModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReturnQtyChange = (e) => {
    const inputValue = e.target.value;
    const price = safeNumber(formData.price);
    const returnQty = Math.max(0, safeNumber(inputValue));
    const returnAmount = (returnQty * price).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      returnQty: inputValue,
      returnAmount,
    }));
    setErrors((prev) => ({ ...prev, returnQty: "" }));
  };

  const handleProductSelectChange = (e) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedProduct = returnModalSale.products[selectedIndex];

    const matchedStock = stockData.find((stock) => stock.product?.id === selectedProduct.product?.id);

    const alreadyReturnedQty = returnData
      .filter((returnItem) => returnItem.sale_product?.id === selectedProduct.id)
      .reduce((sum, item) => sum + safeNumber(item.quantity), 0);

    setFormData((prev) => ({
      ...prev,
      productName: selectedProduct.product?.product_name || "",
      saleQty: selectedProduct.sale_quantity || "",
      currentQty: matchedStock?.current_stock_quantity || "0",
      price: selectedProduct.sale_price || "",
      alreadyReturnQty: String(alreadyReturnedQty),
      selectedProductIndex: selectedIndex,
      returnQty: "",
      returnAmount: "",
    }));
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    const finalReturnQty = safeNumber(formData.returnQty);
    const saleQty = safeNumber(formData.saleQty);
    const alreadyReturnedQty = safeNumber(formData.alreadyReturnQty);

    if (finalReturnQty <= 0) {
      setErrors({ ...errors, returnQty: "Please enter a valid quantity" });
      return;
    }

    if (finalReturnQty + alreadyReturnedQty > saleQty) {
      toast.error("Total return quantity cannot exceed sale quantity!");
      return;
    }

    const saleProductId = returnModalSale.products[formData.selectedProductIndex]?.id;
    if (!saleProductId) {
      toast.error("Invalid product selected!");
      return;
    }

    try {
      await AxiosInstance.post("/sale-returns/", {
        sale_product: saleProductId,
        quantity: finalReturnQty,
        return_date: formData.returnDate,
        remarks: formData.returnRemarks,
      });

      toast.success("Return created successfully");

      await Promise.all([
        fetchStockData(selectedCategory?.id || null),
        fetchSales(selectedCategory?.id || null),
        fetchReturnData(),
      ]);

      returnModalRef.current?.close();
      setReturnModalSale(null);
      setFormData({
        returnDate: new Date().toISOString().slice(0, 10),
        productName: "",
        saleQty: "",
        currentQty: "",
        price: "",
        dueAmount: "",
        alreadyReturnQty: "",
        returnQty: "",
        returnAmount: "",
        returnRemarks: "",
        selectedProductIndex: 0,
      });
      setErrors({});
    } catch (error) {
      console.error("Error posting return:", error);
      toast.error("Failed to create return");
    }
  };

  // Pagination
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const paginatedSales = sales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sales</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Manage your invoices, payments and product returns.
          </p>

          <div className="mt-1 text-xs text-slate-500">
            Business:{" "}
            <span className="font-semibold text-slate-700">{selectedCategory?.name || "N/A"}</span>
            {bannerLoading ? <span className="ml-2 text-slate-400">(Loading banner...)</span> : null}
          </div>
        </div>

        <div className="text-xs md:text-sm text-slate-500">
          Total Invoices: <span className="font-semibold text-slate-700">{allSales.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700">Filter Invoices</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Customer</label>
            <Select
              options={customers}
              isClearable
              onChange={handleCustomerChange}
              placeholder="Select customer"
              className="text-sm"
              styles={customSelectStyles}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">District</label>
            <Select
              options={districts}
              isClearable
              onChange={handleDistrictChange}
              placeholder="Select district"
              className="text-sm"
              styles={customSelectStyles}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Bill No</label>
            <input
              type="text"
              value={filters.billNo}
              onChange={handleBillNoChange}
              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none ring-0 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              placeholder="Search by bill no"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
          {loading ? "Loading invoices..." : `Showing ${paginatedSales.length} of ${sales.length} invoices`}
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra-zebra text-xs md:text-sm">
            <thead className="bg-slate-800 text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="w-10 text-center"></th>
                <th className="w-[220px]">Customer Details</th>
                <th className="w-[120px] text-center">Bill No</th>
                <th className="w-[110px] text-center">Bill Date</th>
                <th className="w-[80px] text-center">Total</th>
                <th className="w-[80px] text-center">Discount</th>
                <th className="w-[80px] text-center">Payable</th>
                <th className="w-[80px] text-center">Paid</th>
                <th className="w-[80px] text-center">Due</th>
                <th className="w-[70px] text-center">Invoice</th>
                <th className="w-[80px] text-center">Pay Due</th>
                <th className="w-[80px] text-center">Return</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-sm text-slate-500">
                    {loading ? "Loading..." : "No invoices found."}
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => {
                  const isExpanded = expandedRows.has(sale.id);
                  const paidAmount =
                    sale.payments?.reduce((acc, p) => acc + safeNumber(p.paid_amount), 0) || 0;
                  const dueAmount = safeNumber(sale.total_payable_amount) - paidAmount;

                  return (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="w-10 text-center cursor-pointer select-none" onClick={() => toggleRow(sale.id)}>
                          {isExpanded ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">−</span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">+</span>
                          )}
                        </td>

                        <td className="w-[220px] max-w-[260px]">
                          <div className="font-medium text-slate-800">{sale.customer?.customer_name || "N/A"}</div>
                          <div className="text-[11px] text-slate-500">Contact: {sale.customer?.phone1 || "N/A"}</div>
                          <div className="truncate text-[11px] text-slate-500">
                            Address: {sale.customer?.address?.replace(/\r\n/g, ", ") || "N/A"}
                          </div>
                          <div className="text-[11px] text-slate-500">District: {sale.customer?.district || "N/A"}</div>
                        </td>

                        <td className="w-[120px] text-center align-middle">{sale.invoice_no}</td>
                        <td className="w-[110px] text-center align-middle">{sale.sale_date}</td>
                        <td className="w-[80px] text-center align-middle">{safeNumber(sale.total_amount).toFixed(2)}</td>
                        <td className="w-[80px] text-center align-middle">{safeNumber(sale.discount_amount).toFixed(2)}</td>
                        <td className="w-[80px] text-center align-middle">{safeNumber(sale.total_payable_amount).toFixed(2)}</td>
                        <td className="w-[80px] text-center align-middle">{paidAmount.toFixed(2)}</td>

                        <td className={`w-[80px] text-center align-middle font-medium ${dueAmount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                          {dueAmount.toFixed(2)}
                        </td>


                        <td className="w-[70px] text-center align-middle">
                          <button
                            onClick={() => navigate(`/sales/invoice/${sale.id}`)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Invoice
                          </button>
                        </td>


                        <td className="w-[80px] text-center align-middle">
                          <button
                            onClick={() => setPayModalSale(sale)}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs"
                          >
                            Pay
                          </button>
                        </td>

                        <td className="w-[80px] text-center align-middle">
                          <button
                            className="inline-flex items-center rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-600"
                            onClick={() => handleOpenReturnModal(sale)}
                          >
                            Return
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={12} className="p-0">
                            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Products for invoice {sale.invoice_no}
                              </div>
                              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                <table className="table text-xs md:text-sm">
                                  <thead className="bg-slate-700 text-white">
                                    <tr>
                                      <th className="text-center">Item</th>
                                      <th className="text-center">Quantity</th>
                                      <th className="text-center">Price</th>
                                      <th className="text-center">Percentage</th>
                                      <th className="text-center">Price with %</th>
                                      <th className="text-center">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sale.products?.length > 0 ? (
                                      sale.products.map((prod) => (
                                        <tr key={prod.id}>
                                          <td className="truncate">
                                            {prod.product?.category_detail?.category_name || prod.product?.product_name || ""}
                                          </td>
                                          <td className="text-center">{safeNumber(prod.sale_quantity).toFixed(2)}</td>
                                          <td className="text-center">{safeNumber(prod.sale_price).toFixed(2)}</td>
                                          <td className="text-center">{safeNumber(prod.percentage).toFixed(2)}%</td>
                                          <td className="text-center">{safeNumber(prod.sale_price_with_percentage).toFixed(2)}</td>
                                          <td className="text-center">{safeNumber(prod.total_price).toFixed(2)}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={6} className="py-2 text-center text-slate-500">
                                          No products found
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`rounded-full border px-3 py-1 text-xs ${
                currentPage === i + 1
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}


      <PaymentModal
        sale={payModalSale}
        onClose={() => setPayModalSale(null)}
        fetchSales={fetchSales}
        selectedCategory={selectedCategory}
        safeNumber={safeNumber}
        customSelectStyles={customSelectStyles}
      />


      {/* Return Modal */}
      <dialog ref={returnModalRef} className="modal">
        {returnModalSale && (
          <div className="modal-box max-w-5xl rounded-xl bg-white p-4 shadow-lg">
            <form method="dialog">
              <button
                type="button"
                onClick={() => {
                  returnModalRef.current?.close();
                  setReturnModalSale(null);
                  setFormData({
                    returnDate: new Date().toISOString().slice(0, 10),
                    productName: "",
                    saleQty: "",
                    currentQty: "",
                    price: "",
                    dueAmount: "",
                    alreadyReturnQty: "",
                    returnQty: "",
                    returnAmount: "",
                    returnRemarks: "",
                    selectedProductIndex: 0,
                  });
                  setErrors({});
                }}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </button>
            </form>

            <div className="mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">
                Product Return - Invoice {returnModalSale.invoice_no}
              </h3>
              <p className="text-xs text-slate-500">
                Customer: {returnModalSale.customer?.customer_name || "N/A"}
              </p>
            </div>

            <form onSubmit={handleSubmitReturn} className="grid gap-3 text-xs md:text-sm md:grid-cols-5">
              <div>
                <label className="mb-1 block font-medium text-slate-600">Return Date</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block font-medium text-slate-600">Product Name</label>

                {returnModalSale.products.length === 1 ? (
                  <input
                    type="text"
                    value={returnModalSale.products[0]?.product?.product_name || ""}
                    readOnly
                    className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                  />
                ) : (
                  <select
                    name="selectedProductIndex"
                    value={formData.selectedProductIndex}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    onChange={handleProductSelectChange}
                    required
                  >
                    {returnModalSale.products.map((product, index) => (
                      <option key={index} value={index}>
                        {product.product?.product_name || "Unknown Product"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Sale Quantity</label>
                <input
                  type="number"
                  name="saleQty"
                  value={
                    formData.saleQty ||
                    (returnModalSale.products.length === 1 ? returnModalSale.products[0]?.sale_quantity : "")
                  }
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Current Stock</label>
                <input
                  type="number"
                  name="currentQty"
                  value={formData.currentQty || ""}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Price</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={formData.price || (returnModalSale.products.length === 1 ? returnModalSale.products[0]?.sale_price : "")}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Due Amount</label>
                <input
                  type="number"
                  name="dueAmount"
                  step="0.01"
                  value={(
                    safeNumber(returnModalSale.total_payable_amount) -
                    (returnModalSale.payments?.reduce((acc, p) => acc + safeNumber(p.paid_amount), 0) || 0)
                  ).toFixed(2)}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Already Returned Qty</label>
                <input
                  type="number"
                  name="alreadyReturnQty"
                  value={formData.alreadyReturnQty || ""}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Return Quantity*</label>
                <input
                  type="number"
                  name="returnQty"
                  value={formData.returnQty}
                  onChange={handleReturnQtyChange}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  required
                />
                {errors.returnQty && <p className="mt-1 text-xs text-rose-500">{errors.returnQty}</p>}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">Return Amount*</label>
                <input
                  type="text"
                  name="returnAmount"
                  value={formData.returnAmount}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-medium text-slate-600">Return Remarks</label>
                <input
                  name="returnRemarks"
                  value={formData.returnRemarks}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="col-span-5 mt-2 flex justify-center gap-3 pt-3">
                <button
                  type="submit"
                  className="rounded-full bg-slate-800 px-5 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                >
                  Save Return
                </button>
              </div>
            </form>

            <div className="mt-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                {returnData?.some((item) =>
                  returnModalSale?.products?.some((product) => product.id === item.sale_product?.id)
                ) ? (
                  <table className="table table-zebra text-xs md:text-sm">
                    <thead className="bg-slate-800 text-xs text-white">
                      <tr>
                        <th className="text-center">SL</th>
                        <th className="text-center">Return Date</th>
                        <th className="text-center">Product Name</th>
                        <th className="text-center">Company</th>
                        <th className="text-center">Sold Qty</th>
                        <th className="text-center">Returned Qty</th>
                        <th className="text-center">Returned Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnData
                        .filter((item) =>
                          returnModalSale?.products?.some((product) => product.id === item.sale_product?.id)
                        )
                        .map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">
                              {item.return_date
                                ? new Date(item.return_date).toLocaleString("en-GB", { dateStyle: "short" })
                                : "N/A"}
                            </td>
                            <td className="text-center">{item.sale_product?.product?.product_name || "N/A"}</td>
                            <td className="text-center">
                              {item.sale_product?.product?.category_detail?.company_detail?.company_name || "N/A"}
                            </td>
                            <td className="text-center">{item.sale_product?.sale_quantity || 0}</td>
                            <td className="text-center">{item.quantity || 0}</td>
                            <td className="text-center">
                              {(safeNumber(item.sale_product?.sale_price) * safeNumber(item.quantity)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-4 text-center text-sm text-slate-500">No returns for this invoice yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
