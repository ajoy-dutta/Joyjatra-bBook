import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import AxiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

export default function SalesList() {
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
      "&:hover": {
        color: "#0f172a",
      },
    }),

    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        color: "#0f172a",
      },
    }),

    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#0f766e"
        : state.isFocused
        ? "#ecfeff"
        : "white",
      color: state.isSelected ? "white" : "#111827",
      "&:hover": {
        backgroundColor: state.isSelected ? "#0f766e" : "#ecfeff",
      },
    }),

    menu: (base) => ({
      ...base,
      fontSize: "0.875rem",
      zIndex: 30,
    }),

    menuList: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
  };

  // State declarations
  const [allSales, setAllSales] = useState([]);
  const [sales, setSales] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [returnModalSale, setReturnModalSale] = useState(null);
  const [returnData, setReturnData] = useState([]);
  const [payModalSale, setPayModalSale] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(
      JSON.parse(localStorage.getItem("business_category")) || null
  );

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

  const [filters, setFilters] = useState({
    customer: null,
    district: null,
    billNo: "",
  });

  const itemsPerPage = 5;
  const returnModalRef = useRef(null);
  const payModalRef = useRef(null);

  // Data fetching functions
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get("/sales/", {
        params:{business_category:selectedCategory?.id || null}
      });
      setAllSales(res.data);
      setSales(res.data);
    } catch (err) {
      console.error("Failed to load sales:", err);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await AxiosInstance.get("/stocks/", {
        params:{business_category:selectedCategory?.id || null}
      });
      setStockData(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      toast.error("Failed to load stock data");
    }
  };

  const fetchReturnData = async () => {
    try {
      const response = await AxiosInstance.get("/sale-returns/");
      setReturnData(response.data);
    } catch (error) {
      console.error("Error fetching return data:", error);
      toast.error("Failed to load return data");
    }
  };

  // Initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchSales(),
          fetchStockData(),
          fetchReturnData(),
          AxiosInstance.get("/districts/").then((res) => {
            setDistricts(res.data.map((d) => ({ value: d.id, label: d.name })));
          }),
          AxiosInstance.get("/customers/", {
          params:{business_category:selectedCategory?.id || null}
        }).then((res) => {
            setCustomers(
              res.data.map((c) => ({
                value: c.id,
                label: c.customer_name,
              }))
            );
          }),
        ]);
      } catch (error) {
        console.error("Initial data loading failed:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Toggle row expansion
  const toggleRow = (id) => {
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.has(id)
      ? newExpandedRows.delete(id)
      : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  // Filtering logic
  useEffect(() => {
    let filtered = [...allSales];

    if (filters.customer) {
      filtered = filtered.filter(
        (s) => s.customer?.id === filters.customer.value
      );
    }

    if (filters.district) {
      filtered = filtered.filter(
        (s) => s.customer?.district_detail?.id === filters.district.value
      );
    }

    if (filters.billNo.trim() !== "") {
      filtered = filtered.filter((s) =>
        s.invoice_no
          ?.toLowerCase()
          .includes(filters.billNo.trim().toLowerCase())
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

  const handleOpenReturnModal = (sale) => {
    if (!sale || !sale.products || sale.products.length === 0) {
      toast.error("Invalid sale data");
      return;
    }

    const firstProduct = sale.products[0];
    const matchedStock = stockData.find(
      (stock) => stock.product?.id === firstProduct.product?.id
    );

    const alreadyReturnedQty = returnData
      .filter((returnItem) => returnItem.sale_product?.id === firstProduct.id)
      .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

    const dueAmount = (
      parseFloat(sale.total_payable_amount || 0) -
      (sale.payments?.reduce(
        (acc, p) => acc + parseFloat(p.paid_amount || 0),
        0
      ) || 0)
    ).toFixed(2);

    setReturnModalSale(sale);

    setFormData({
      returnDate: new Date().toISOString().slice(0, 10),
      productName: firstProduct.product?.product_name || "",
      saleQty: firstProduct.sale_quantity || "",
      currentQty: matchedStock?.current_stock_quantity || "0",
      price: firstProduct.sale_price || "",
      dueAmount: dueAmount,
      alreadyReturnQty: alreadyReturnedQty.toString(),
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
    const price = parseFloat(formData.price) || 0;
    const returnQty = Math.max(0, parseFloat(inputValue) || 0);
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

    const matchedStock = stockData.find(
      (stock) => stock.product?.id === selectedProduct.product?.id
    );

    const alreadyReturnedQty = returnData
      .filter((returnItem) => returnItem.sale_product?.id === selectedProduct.id)
      .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

    setFormData((prev) => ({
      ...prev,
      productName: selectedProduct.product?.product_name || "",
      saleQty: selectedProduct.sale_quantity || "",
      currentQty: matchedStock?.current_stock_quantity || "0",
      price: selectedProduct.sale_price || "",
      alreadyReturnQty: alreadyReturnedQty.toString(),
      selectedProductIndex: selectedIndex,
      returnQty: "",
      returnAmount: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalReturnQty = parseFloat(formData.returnQty) || 0;
    const saleQty = parseFloat(formData.saleQty) || 0;
    const alreadyReturnedQty = parseFloat(formData.alreadyReturnQty) || 0;

    if (finalReturnQty <= 0) {
      setErrors({ ...errors, returnQty: "Please enter a valid quantity" });
      return;
    }

    if (finalReturnQty + alreadyReturnedQty > saleQty) {
      toast.error("Total return quantity cannot exceed sale quantity!");
      return;
    }

    const saleProductId =
      returnModalSale.products[formData.selectedProductIndex]?.id;
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

      await Promise.all([fetchStockData(), fetchSales(), fetchReturnData()]);

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

  // ======== CLEANED-UP INVOICE PDF (no brand / part no) =========
  const handleGenerateSalePdf = (sale) => {
    const totalQty = sale.products.reduce(
      (sum, item) => sum + parseFloat(item.sale_quantity || 0),
      0
    );
    const totalAmount = parseFloat(sale.total_amount || 0);
    const discount = parseFloat(sale.discount_amount || 0);
    const grossTotal = totalAmount - discount;
    const previousBalance = parseFloat(
      sale.customer?.previous_due_amount || 0
    );
    const netAmount = grossTotal;
    const paidAmount =
      sale.payments?.reduce(
        (sum, payment) => sum + parseFloat(payment.paid_amount || 0),
        0
      ) || 0;
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
    <style>
      @page { margin: 15mm; size: A4; }

      body {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        margin: 0;
        padding: 15px;
        font-size: 14px;
        font-family: Arial;
        box-sizing: border-box;
      }

      .header {
        text-align: center;
        line-height: 1.4;
      }

      .company-name { font-size: 20px; font-weight: bold; }
      .subtitle { font-size: 16px; font-weight: semibold; }
      .contact-info {
        font-size: 12px;
        color: #444;
        margin-top: 2px;
        line-height: 1.3;
      }

      .customer-info {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
      }

      .left-info, .right-info {
        flex: 1;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      th, td {
        border: 1px solid #000;
        padding: 6px;
        text-align: left;
      }

      .text-right { text-align: right; }
      .text-center { text-align: center; }

      .calc-table {
        width: 60%;
        margin-left: auto;
        margin-top: 20px;
        margin-bottom: 30px;
      }

      .calc-table td {
        padding: 6px;
      }

      .calc-table td:last-child {
        text-align: right;
      }

      .main-content { flex: 1; }

      .bottom-section {
        margin-top: auto;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .signature-container {
        display: flex;
        justify-content: space-between;
        margin: 30px 0 10px 0;
        page-break-inside: avoid;
      }

      .signature {
        text-align: center;
        width: 45%;
      }

      .signature-line {
        margin-bottom: 2px;
        border-top: 1px solid #000;
        width: 100%;
      }

      .footer-content {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        border-top: 1px solid #000;
        padding-top: 10px;
        page-break-inside: avoid;
      }

      .footer-left { text-align: left; }
      .footer-right { text-align: right; }
    </style>
  </head>
  <body>
    <div class="main-content">
      <div class="header">
        <div class="company-name">Feroz Autos</div>
        <div class="subtitle">A company which fulfill your demands</div>
        <div class="contact-info">Genuine Motorcycle Parts Importer & WholePurchaser.</div>
        <div class="contact-info">77.R.N.Road, Noldanga Road (Heaven Building), Jashore-7400</div>
        <div class="contact-info">Phone:0421-66095, Mob: 01924-331354, 01711-355328, 01778-117515</div>
        <div class="contact-info">E-mail: heavenautos77jsr@yahoo.com / heavenautojessore@gmail.com</div>
      </div>

      <h2 style="text-align:center; margin: 20px 0;">Sale Invoice</h2>

      <div class="customer-info">
        <div class="left-info">
          <div><strong>Invoice No:</strong> ${sale.invoice_no || "N/A"}</div>
          <div><strong>Customer Name:</strong> ${
            sale.customer?.customer_name || "N/A"
          }</div>
          <div><strong>Address:</strong> ${
            sale.customer?.address || "N/A"
          }</div>
        </div>
        <div class="right-info" style="text-align:right;">
          <div><strong>Sale Date:</strong> ${sale.sale_date || "N/A"}</div>
          <div><strong>Shop Name:</strong> ${
            sale.customer?.shop_name || "N/A"
          }</div>
          <div><strong>Phone:</strong> ${sale.customer?.phone1 || "N/A"}</div>
        </div>
      </div>

      <div><strong>Product Details:</strong> </div>

      <table>
        <thead>
          <tr>
            <th class="text-center">Sl No</th>
            <th class="text-center">Product Name</th>
            <th class="text-center">Quantity</th>
            <th class="text-center">MRP</th>
            <th class="text-center">Price</th>
            <th class="text-center">Total Taka</th>
          </tr>
        </thead>
        <tbody>
          ${sale.products
            .map(
              (item, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td class="text-center">${
                item.product?.product_name || "N/A"
              }</td>
              <td class="text-center">${parseFloat(
                item.sale_quantity || 0
              ).toFixed(2)}</td>
              <td class="text-center">${parseFloat(
                item.product?.product_mrp || 0
              ).toFixed(2)}</td>
              <td class="text-center">${parseFloat(
                item.sale_price || 0
              ).toFixed(2)}</td>
              <td class="text-center">${parseFloat(
                item.total_price || 0
              ).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td colspan="2" style="border: none;"></td>
            <td style="border: none;">Total Quantity</td>
            <td style="border: none;" class="text-right"><strong>${totalQty.toFixed(
              2
            )}</strong></td>
            <td colspan="2" style="border: none;"></td>
          </tr>
        </tbody>
      </table>

      <table class="calc-table">
        <tr><td>Total Sale Amount</td><td>${totalAmount.toFixed(2)}</td></tr>
        <tr><td>(-) Discount</td><td>${discount.toFixed(2)}</td></tr>
        <tr><td>Gross Total</td><td>${grossTotal.toFixed(2)}</td></tr>
        <tr><td>(+) Previous Balance</td><td>${previousBalance.toFixed(
          2
        )}</td></tr>
        <tr><td>Net Amount</td><td>${netAmount.toFixed(2)}</td></tr>
        <tr><td>Paid Taka</td><td>${paidAmount.toFixed(2)}</td></tr>
        <tr><td>Returnable Taka</td><td>0.00</td></tr>
        <tr><td>Due Balance</td><td>${dueAmount.toFixed(2)}</td></tr>
        <tr><td>Total Due Balance</td><td>${totalDueBalance.toFixed(
          2
        )}</td></tr>
      </table>
    </div>

    <div class="bottom-section">
      <div class="signature-container">
        <div class="signature">
          <div class="signature-line"></div>
          Customer Signature
        </div>
        <div class="signature">
          <div class="signature-line"></div>
          Approved By (Feroz Autos)
        </div>
      </div>
      <div class="footer-content">
        <div class="footer-left">
          <div>*Sold goods are not returnable (especially electronics).</div>
          <div>*Save Trees, Save Generations.</div>
        </div>
        <div class="footer-right">
          Print: Admin, ${printDate}
        </div>
      </div>
    </div>

    <script>
      setTimeout(() => { window.print(); }, 200);
    </script>
  </body>
  </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Banks / payments
  const [banks, setBanks] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);

  const [paymentData, setPaymentData] = useState({
    paymentMode: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });

  const [isBank, setIsBank] = useState(false);
  const [isCheque, setIsCheque] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await AxiosInstance.get("/banks/");
        const options = res.data.map((bank) => ({
          value: bank.id,
          label: bank.name,
        }));
        setBanks(options);
      } catch (error) {
        console.error("Error fetching banks:", error);
        toast.error("Failed to load banks");
      }
    };

    const fetchPaymentModes = async () => {
      try {
        const res = await AxiosInstance.get("/payment-mode/");
        const options = res.data.map((mode) => ({
          value: mode.id,
          label: mode.name,
        }));
        setPaymentModes(options);
      } catch (error) {
        console.error("Error fetching payment modes:", error);
        toast.error("Failed to load payment modes");
      }
    };

    fetchBanks();
    fetchPaymentModes();
  }, []);

  // Open Pay dialog when payModalSale is set
  useEffect(() => {
    if (payModalSale && payModalRef.current) {
      // reset form & default paid amount to current due
      setEditingPayment(null);
      setIsBank(false);
      setIsCheque(false);

      const totalPaid =
        payModalSale.payments?.reduce(
          (acc, p) => acc + parseFloat(p.paid_amount || 0),
          0
        ) || 0;
      const due =
        parseFloat(payModalSale.total_payable_amount || 0) - totalPaid;

      setPaymentData({
        paymentMode: "",
        bankName: "",
        accountNo: "",
        chequeNo: "",
        paidAmount: due > 0 ? due.toFixed(2) : "",
      });

      payModalRef.current.showModal();
    }
  }, [payModalSale]);

  const getBankName = (bank) => {
    if (!bank) return "N/A";

    const bankId =
      typeof bank === "object" && bank !== null ? bank.id : Number(bank);
    if (!bankId) return "N/A";

    const option = banks.find((b) => b.value === bankId);
    return option?.label || "N/A";
  };

  const getPaymentModeName = (value) => {
    if (!value) return "N/A";

    // If backend stored plain string like "Cash", "Bank", etc.
    if (typeof value === "string" && isNaN(Number(value))) {
      return value;
    }

    const numericId = Number(value);
    const mode = paymentModes.find((pm) => pm.value === numericId);
    return mode?.label || String(value);
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));

    if (field === "paymentMode") {
      const selectedMode = paymentModes.find((opt) => opt.value === value);
      const modeLabel = selectedMode ? selectedMode.label.toLowerCase() : "";

      setIsBank(modeLabel === "bank");
      setIsCheque(modeLabel === "cheque");

      if (modeLabel !== "bank") {
        setPaymentData((prev) => ({ ...prev, bankName: "", accountNo: "" }));
      }
      if (modeLabel !== "cheque") {
        setPaymentData((prev) => ({ ...prev, chequeNo: "" }));
      }
    }
  };

  const handleResetPaymentForm = () => {
    setEditingPayment(null);
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
    setIsBank(false);
    setIsCheque(false);
  };

  const buildPaymentPayload = () => {
    if (!payModalSale) return null;

    const paid = parseFloat(paymentData.paidAmount || 0);
    if (!paid || paid <= 0) {
      toast.error("Enter a valid paid amount.");
      return null;
    }

    const totalPaid =
      payModalSale.payments?.reduce(
        (acc, p) => acc + parseFloat(p.paid_amount || 0),
        0
      ) || 0;
    const due =
      parseFloat(payModalSale.total_payable_amount || 0) - totalPaid;

    if (paid > due) {
      toast.error("Paid amount cannot be greater than due.");
      return null;
    }

    const selectedMode = paymentModes.find(
      (opt) => opt.value === Number(paymentData.paymentMode)
    );
    const paymentModeLabel = selectedMode?.label || "";

    // 🔥 NOTE: sale_id key to match serializer
    return {
      sale_id: payModalSale.id,
      payment_mode: paymentModeLabel,
      bank_name_id: paymentData.bankName || null,
      account_no: paymentData.accountNo || "",
      cheque_no: paymentData.chequeNo || "",
      paid_amount: paid.toFixed(2),
      remarks: "",
    };
  };

  const handleSavePayment = async () => {
    const payload = buildPaymentPayload();
    if (!payload) return;

    try {
      await AxiosInstance.post("/sale-payments/", payload);
      toast.success("Payment saved successfully.");

      await fetchSales();
      setPayModalSale(null);
      handleResetPaymentForm();
      payModalRef.current?.close();
    } catch (error) {
      console.error("Error saving payment:", error);
      console.log("Server says:", error.response?.data);
      toast.error("Failed to save payment.");
    }
  };

  const handleEditClick = (payment) => {
    // Map payment_mode string (e.g. "Cash") to option value
    const modeOption = paymentModes.find(
      (opt) =>
        String(opt.label).toLowerCase() ===
        String(payment.payment_mode || "").toLowerCase()
    );

    const editData = {
      paymentMode: modeOption?.value || "",
      bankName: payment.bank_name?.id || "",
      accountNo: payment.account_no || "",
      chequeNo: payment.cheque_no || "",
      paidAmount: payment.paid_amount ? String(payment.paid_amount) : "",
    };
    setPaymentData(editData);

    const modeLabel = String(payment.payment_mode || "").toLowerCase();
    setIsBank(modeLabel === "bank");
    setIsCheque(modeLabel === "cheque");

    setEditingPayment(payment.id);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;

    const payload = buildPaymentPayload();
    if (!payload) return;

    try {
      await AxiosInstance.put(`/sale-payments/${editingPayment}/`, payload);
      toast.success("Payment updated successfully.");

      await fetchSales();
      setEditingPayment(null);
      setPayModalSale(null);
      handleResetPaymentForm();
      payModalRef.current?.close();
    } catch (error) {
      console.error("Error updating payment:", error);
      console.log("Server says:", error.response?.data);
      toast.error("Failed to update payment.");
    }
  };

  // Pagination
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const paginatedSales = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sales</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Manage your invoices, payments and product returns.
          </p>
        </div>
        <div className="text-xs md:text-sm text-slate-500">
          Total Invoices:{" "}
          <span className="font-semibold text-slate-700">
            {allSales.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Filter Invoices
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Customer
            </label>
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
            <label className="mb-1 block text-xs font-medium text-slate-600">
              District
            </label>
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
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Bill No
            </label>
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
          {loading
            ? "Loading invoices..."
            : `Showing ${paginatedSales.length} of ${sales.length} invoices`}
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
                  <td
                    colSpan={12}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    {loading ? "Loading..." : "No invoices found."}
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => {
                  const isExpanded = expandedRows.has(sale.id);
                  const paidAmount =
                    sale.payments?.reduce(
                      (acc, p) => acc + parseFloat(p.paid_amount || 0),
                      0
                    ) || 0;
                  const dueAmount =
                    parseFloat(sale.total_payable_amount || 0) - paidAmount;

                  return (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-gray-50">
                        <td
                          className="w-10 text-center cursor-pointer select-none"
                          onClick={() => toggleRow(sale.id)}
                        >
                          {isExpanded ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              −
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              +
                            </span>
                          )}
                        </td>

                        <td className="w-[220px] max-w-[260px]">
                          <div className="font-medium text-slate-800">
                            {sale.customer?.customer_name || "N/A"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Contact: {sale.customer?.phone1 || "N/A"}
                          </div>
                          <div className="truncate text-[11px] text-slate-500">
                            Address:{" "}
                            {sale.customer?.address?.replace(/\r\n/g, ", ") ||
                              "N/A"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            District: {sale.customer?.district || "N/A"}
                          </div>
                        </td>

                        <td className="w-[120px] text-center align-middle">
                          {sale.invoice_no}
                        </td>

                        <td className="w-[110px] text-center align-middle">
                          {sale.sale_date}
                        </td>

                        <td className="w-[80px] text-center align-middle">
                          {parseFloat(sale.total_amount || 0).toFixed(2)}
                        </td>

                        <td className="w-[80px] text-center align-middle">
                          {parseFloat(sale.discount_amount || 0).toFixed(2)}
                        </td>

                        <td className="w-[80px] text-center align-middle">
                          {parseFloat(sale.total_payable_amount || 0).toFixed(
                            2
                          )}
                        </td>

                        <td className="w-[80px] text-center align-middle">
                          {paidAmount.toFixed(2)}
                        </td>

                        <td
                          className={`w-[80px] text-center align-middle font-medium ${
                            dueAmount > 0
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {dueAmount.toFixed(2)}
                        </td>

                        <td className="w-[70px] text-center align-middle">
                          <button
                            onClick={() => handleGenerateSalePdf(sale)}
                            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            Invoice
                          </button>
                        </td>

                        <td className="w-[80px] text-center align-middle">
                          <button
                            onClick={() => {
                              setPayModalSale(sale);
                            }}
                            className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200"
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
                                      <th className="text-center">
                                        Percentage
                                      </th>
                                      <th className="text-center">
                                        Price with %
                                      </th>
                                      <th className="text-center">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sale.products?.length > 0 ? (
                                      sale.products.map((prod) => (
                                        <tr key={prod.id}>
                                          <td className="truncate">
                                            {prod.product?.category_detail
                                              ?.category_name ||
                                              prod.product?.product_name ||
                                              ""}
                                          </td>
                                          <td className="text-center">
                                            {parseFloat(
                                              prod.sale_quantity || 0
                                            ).toFixed(2)}
                                          </td>
                                          <td className="text-center">
                                            {parseFloat(
                                              prod.sale_price || 0
                                            ).toFixed(2)}
                                          </td>
                                          <td className="text-center">
                                            {parseFloat(
                                              prod.percentage || 0
                                            ).toFixed(2)}
                                            %
                                          </td>
                                          <td className="text-center">
                                            {parseFloat(
                                              prod.sale_price_with_percentage ||
                                                0
                                            ).toFixed(2)}
                                          </td>
                                          <td className="text-center">
                                            {parseFloat(
                                              prod.total_price || 0
                                            ).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={6}
                                          className="py-2 text-center text-slate-500"
                                        >
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

      {/* Payment Modal */}
      {payModalSale && (
        <dialog ref={payModalRef} id="pay_modal" className="modal">
          <div className="modal-box relative max-w-5xl bg-white">
            <button
              onClick={() => {
                payModalRef.current?.close();
                setPayModalSale(null);
                handleResetPaymentForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <div className="mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">
                Payment for Invoice {payModalSale.invoice_no}
              </h3>
              <p className="text-xs text-slate-500">
                Customer: {payModalSale.customer?.customer_name || "N/A"}
              </p>
            </div>

            <div className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <div className="grid gap-2 md:grid-cols-4">
                <div>
                  <span className="font-semibold text-slate-700">
                    Total Payable:
                  </span>{" "}
                  {parseFloat(
                    payModalSale.total_payable_amount || 0
                  ).toFixed(2)}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Total Paid:
                  </span>{" "}
                  {(
                    payModalSale.payments?.reduce(
                      (acc, p) => acc + parseFloat(p.paid_amount || 0),
                      0
                    ) || 0
                  ).toFixed(2)}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Due Amount:
                  </span>{" "}
                  {(
                    parseFloat(payModalSale.total_payable_amount || 0) -
                    (payModalSale.payments?.reduce(
                      (acc, p) => acc + parseFloat(p.paid_amount || 0),
                      0
                    ) || 0)
                  ).toFixed(2)}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Invoice Date:
                  </span>{" "}
                  {payModalSale.sale_date || "N/A"}
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">
                Add / Update Payment
              </h4>
              <div className="grid gap-3 text-xs md:grid-cols-5">
                <div>
                  <label className="mb-1 block font-medium text-slate-600">
                    Payment Mode*
                  </label>
                  <Select
                    options={paymentModes}
                    value={
                      paymentData.paymentMode
                        ? paymentModes.find(
                            (opt) =>
                              opt.value === Number(paymentData.paymentMode)
                          ) || null
                        : null
                    }
                    onChange={(selected) =>
                      handlePaymentChange("paymentMode", selected?.value || "")
                    }
                    placeholder="Select mode"
                    className="text-sm"
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600">
                    Bank Name
                  </label>
                  <Select
                    options={banks}
                    value={
                      paymentData.bankName
                        ? banks.find(
                            (opt) => opt.value === Number(paymentData.bankName)
                          ) || null
                        : null
                    }
                    onChange={(selected) =>
                      handlePaymentChange("bankName", selected?.value || "")
                    }
                    placeholder="Select bank"
                    isClearable
                    isDisabled={!isBank}
                    className="text-sm"
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600">
                    Account No
                  </label>
                  <input
                    type="text"
                    value={paymentData.accountNo}
                    onChange={(e) =>
                      handlePaymentChange("accountNo", e.target.value)
                    }
                    disabled={!isBank}
                    className={`w-full rounded-md border px-2 py-1 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 ${
                      !isBank ? "bg-slate-100 text-slate-400" : ""
                    }`}
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600">
                    Cheque No
                  </label>
                  <input
                    type="text"
                    value={paymentData.chequeNo}
                    onChange={(e) =>
                      handlePaymentChange("chequeNo", e.target.value)
                    }
                    disabled={!isCheque}
                    className={`w-full rounded-md border px-2 py-1 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 ${
                      !isCheque ? "bg-slate-100 text-slate-400" : ""
                    }`}
                    placeholder="Cheque number"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-600">
                    Paid Amount*
                  </label>
                  <input
                    type="number"
                    value={paymentData.paidAmount}
                    onChange={(e) =>
                      handlePaymentChange("paidAmount", e.target.value)
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetPaymentForm}
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Reset
                </button>

                {editingPayment ? (
                  <button
                    type="button"
                    onClick={handleUpdatePayment}
                    className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                  >
                    Update Payment
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSavePayment}
                    className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    Save Payment
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="table text-xs md:text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="text-center">SL</th>
                    <th className="text-center">Due Date</th>
                    <th className="text-center">Payment Mode</th>
                    <th className="text-center">Bank Name</th>
                    <th className="text-center">Account Number</th>
                    <th className="text-center">Cheque Number</th>
                    <th className="text-center">Amount</th>
                    <th className="text-center">Create Date</th>
                    <th className="text-center">Due Invoice</th>
                    <th className="text-center">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {payModalSale.payments?.length > 0 ? (
                    payModalSale.payments.map((payment, idx) => (
                      <tr key={payment.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="text-center">
                          {payment.due_date || "N/A"}
                        </td>
                        <td className="text-center">
                          {getPaymentModeName(payment.payment_mode)}
                        </td>
                        <td className="text-center">
                          {getBankName(payment.bank_name)}
                        </td>
                        <td className="text-center">
                          {payment.account_no || "N/A"}
                        </td>
                        <td className="text-center">
                          {payment.cheque_no || "N/A"}
                        </td>
                        <td className="text-center">
                          {parseFloat(payment.paid_amount || 0).toFixed(2)}
                        </td>
                        <td className="text-center">
                          {payment.payment_date
                            ? payment.payment_date.slice(0, 10)
                            : "N/A"}
                        </td>
                        <td className="text-center">
                          {payment.due_invoice || "N/A"}
                        </td>
                        <td className="text-center">
                          <button
                            className="text-xs font-medium text-slate-700 underline hover:text-slate-900"
                            onClick={() => handleEditClick(payment)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-4 text-center text-sm text-slate-500"
                      >
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => {
                payModalRef.current?.close();
                setPayModalSale(null);
                handleResetPaymentForm();
              }}
            >
              close
            </button>
          </form>
        </dialog>
      )}

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

            <form
              onSubmit={handleSubmit}
              className="grid gap-3 text-xs md:text-sm md:grid-cols-5"
            >
              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Return Date
                </label>
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
                <label className="mb-1 block font-medium text-slate-600">
                  Product Name
                </label>

                {returnModalSale.products.length === 1 ? (
                  <input
                    type="text"
                    value={
                      returnModalSale.products[0]?.product?.product_name || ""
                    }
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
                <label className="mb-1 block font-medium text-slate-600">
                  Sale Quantity
                </label>
                <input
                  type="number"
                  name="saleQty"
                  value={
                    formData.saleQty ||
                    (returnModalSale.products.length === 1
                      ? returnModalSale.products[0]?.sale_quantity
                      : "")
                  }
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Current Stock
                </label>
                <input
                  type="number"
                  name="currentQty"
                  value={formData.currentQty || ""}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={
                    formData.price ||
                    (returnModalSale.products.length === 1
                      ? returnModalSale.products[0]?.sale_price
                      : "")
                  }
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Due Amount
                </label>
                <input
                  type="number"
                  name="dueAmount"
                  step="0.01"
                  value={(
                    parseFloat(returnModalSale.total_payable_amount || 0) -
                    (returnModalSale.payments?.reduce(
                      (acc, p) => acc + parseFloat(p.paid_amount || 0),
                      0
                    ) || 0)
                  ).toFixed(2)}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Already Returned Qty
                </label>
                <input
                  type="number"
                  name="alreadyReturnQty"
                  value={formData.alreadyReturnQty || ""}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Return Quantity*
                </label>
                <input
                  type="number"
                  name="returnQty"
                  value={formData.returnQty}
                  onChange={handleReturnQtyChange}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  required
                />
                {errors.returnQty && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.returnQty}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Return Amount*
                </label>
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
                <label className="mb-1 block font-medium text-slate-600">
                  Return Remarks
                </label>
                <input
                  name="returnRemarks"
                  value={formData.returnRemarks}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="col-span-5 mt-2 flex justify-center gap-3 pt-3">
                <button
                  type="reset"
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    const selectedProduct =
                      returnModalSale.products[formData.selectedProductIndex];
                    const matchedStock = stockData.find(
                      (stock) =>
                        stock.product?.id === selectedProduct.product?.id
                    );
                    const alreadyReturnedQty = returnData
                      .filter(
                        (returnItem) =>
                          returnItem.sale_product?.id === selectedProduct.id
                      )
                      .reduce(
                        (sum, item) => sum + (parseFloat(item.quantity) || 0),
                        0
                      );
                    const dueAmount = (
                      parseFloat(returnModalSale.total_payable_amount || 0) -
                      (returnModalSale.payments?.reduce(
                        (acc, p) => acc + parseFloat(p.paid_amount || 0),
                        0
                      ) || 0)
                    ).toFixed(2);

                    setFormData({
                      returnDate: new Date().toISOString().slice(0, 10),
                      productName: selectedProduct.product?.product_name || "",
                      saleQty: selectedProduct.sale_quantity || "",
                      currentQty: matchedStock?.current_stock_quantity || "0",
                      price: selectedProduct.sale_price || "",
                      dueAmount: dueAmount,
                      alreadyReturnQty: alreadyReturnedQty.toString(),
                      returnQty: "",
                      returnAmount: "",
                      returnRemarks: "",
                      selectedProductIndex: formData.selectedProductIndex,
                    });
                    setErrors({});
                  }}
                >
                  Reset
                </button>
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
                  returnModalSale?.products?.some(
                    (product) => product.id === item.sale_product?.id
                  )
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
                          returnModalSale?.products?.some(
                            (product) => product.id === item.sale_product?.id
                          )
                        )
                        .map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">
                              {item.return_date
                                ? new Date(item.return_date).toLocaleString(
                                    "en-GB",
                                    {
                                      dateStyle: "short",
                                    }
                                  )
                                : "N/A"}
                            </td>
                            <td className="text-center">
                              {item.sale_product?.product?.product_name ||
                                "N/A"}
                            </td>
                            <td className="text-center">
                              {item.sale_product?.product?.category_detail
                                ?.company_detail?.company_name || "N/A"}
                            </td>
                            <td className="text-center">
                              {item.sale_product?.sale_quantity || 0}
                            </td>
                            <td className="text-center">
                              {item.quantity || 0}
                            </td>
                            <td className="text-center">
                              {(
                                parseFloat(item.sale_product?.sale_price || 0) *
                                parseFloat(item.quantity || 0)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-4 text-center text-sm text-slate-500">
                    No returns for this invoice yet.
                  </div>
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
