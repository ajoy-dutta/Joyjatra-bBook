import { useState, useEffect } from "react";
import Select from "react-select";
import AxiosInstance from "../../components/AxiosInstance";
import { toast } from "react-hot-toast";

export default function ProductPurchase() {
  // ---------- Custom Select Styles ----------
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "32px",
      height: "32px",
      fontSize: "0.875rem",
      borderRadius: "0.475rem",
      borderColor: state.isFocused ? "#0f172a" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 1px #0f172a" : "none",
      display: "flex",
      alignItems: "center",
      paddingTop: "0px",
      paddingBottom: "0px",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "32px",
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#9ca3af",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
    input: (base) => ({
      ...base,
      fontSize: "0.875rem",
      padding: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "32px",
      display: "flex",
      alignItems: "center",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#0f172a"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#020617",
    }),
  };

  // ---------- Vendor ----------
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorData, setVendorData] = useState({
    vendorName: "",
    division: "",
    district: "",
    country: "",
    vendorType: "",
    shopName: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    dob: "",
    nidNo: "",
  });

  // ---------- Products & Stocks ----------
  const [productList, setProductList] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState(null);

  const productNameOptions = productList.map((p) => ({
    label: p.product_name,
    value: p.id,
  }));

  const [currentStock, setCurrentStock] = useState(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("0.00");

  // NEW: manufacture & expiry for the current line
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [addedProducts, setAddedProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(
      JSON.parse(localStorage.getItem("business_category")) || null
    );

  // ---------- Payments ----------
  const [paymentModes, setPaymentModes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentData, setPaymentData] = useState({
    paymentMode: "", // label string, e.g. "Cash"
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });

  // ---------- Load base data ----------
  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const [vendorsRes, stocksRes, productsRes, pmRes, bankRes] =
          await Promise.all([
            AxiosInstance.get("/vendors/",{
              params: { business_category: selectedCategory?.id || undefined }
            }),
            AxiosInstance.get("/stocks/",{
              params: { business_category: selectedCategory?.id || undefined }
            }),
            AxiosInstance.get("/products/",{
              params: { business_category: selectedCategory?.id || undefined }
            }),
            AxiosInstance.get("/payment-mode/"),
            AxiosInstance.get("/banks/"),
          ]);

        setVendors(vendorsRes.data);
        setStockList(stocksRes.data);
        setProductList(productsRes.data);

        setPaymentModes(
          pmRes.data.map((pm) => ({
            value: pm.id,
            label: pm.name,
          }))
        );
        setBanks(
          bankRes.data.map((b) => ({
            value: b.id,
            label: b.name,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load initial data");
      }
    };

    loadBaseData();
  }, []);

  // ---------- Vendor Select ----------
  const vendorOptions = vendors.map((v) => ({
    label: v.vendor_name,
    value: v.id,
  }));

  const handleVendorSelect = (selected) => {
    setSelectedVendor(selected);

    if (!selected) {
      setVendorData({
        vendorName: "",
        division: "",
        district: "",
        country: "",
        vendorType: "",
        shopName: "",
        phone1: "",
        phone2: "",
        email: "",
        address: "",
        dob: "",
        nidNo: "",
      });
      setSelectedProductName(null);
      setCurrentStock(0);
      return;
    }

    const v = vendors.find((x) => x.id === selected.value);
    if (!v) return;

    setVendorData({
      vendorName: v.vendor_name || "",
      division: v.division || "",
      district: v.district || "",
      country: v.country || "",
      vendorType: v.vendor_type || "",
      shopName: v.shop_name || "",
      phone1: v.phone1 || "",
      phone2: v.phone2 || "",
      email: v.email || "",
      address: v.address || "",
      dob: v.date_of_birth || "",
      nidNo: v.nid_no || "",
    });
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- Product Name Change ----------
  const handleProductNameChange = (item) => {
    setSelectedProductName(item);

    if (!item) {
      setCurrentStock(0);
      return;
    }

    const prod = productList.find((p) => p.id === item.value);
    const stock = stockList.find((s) => s.product?.id === prod?.id);
    setCurrentStock(stock ? stock.current_stock_quantity : 0);
  };

  // ---------- Calculations ----------
  useEffect(() => {
    const base = parseFloat(purchasePrice) || 0;
    const qty = parseInt(purchaseQuantity) || 0;
    const total = base * qty;
    setTotalPrice(total ? total.toFixed(2) : "0.00");
  }, [purchasePrice, purchaseQuantity]);

  useEffect(() => {
    const total = addedProducts.reduce(
      (sum, p) => sum + parseFloat(p.totalPrice || 0),
      0
    );
    setTotalAmount(total);

    const discount = parseFloat(discountAmount) || 0;
    const payable = total - discount;
    setTotalPayableAmount(payable > 0 ? payable : 0);
  }, [addedProducts, discountAmount]);

  const totalPaidAmount = payments.reduce(
    (sum, p) => sum + parseFloat(p.paidAmount || 0),
    0
  );

  // ---------- Add Product ----------
  const addProduct = () => {
    if (!selectedProductName) {
      toast.error("Select a product");
      return;
    }
    if (!purchaseQuantity || parseInt(purchaseQuantity) <= 0) {
      toast.error("Enter a valid purchase quantity");
      return;
    }
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      toast.error("Enter a valid purchase price");
      return;
    }
    if (!manufactureDate) {
      toast.error("Enter manufacture date");
      return;
    }
    if (!expiryDate) {
      toast.error("Enter expiry date");
      return;
    }
    if (expiryDate < manufactureDate) {
      toast.error("Expiry cannot be before manufacture date");
      return;
    }

    const existing = addedProducts.find(
      (p) => p.id === selectedProductName.value
    );
    if (existing) {
      toast.error("This product is already added");
      return;
    }

    setAddedProducts((prev) => [
      ...prev,
      {
        id: selectedProductName.value,
        productName: selectedProductName.label,
        currentStock,
        purchaseQuantity,
        purchasePrice,
        totalPrice,
        manufactureDate,
        expiryDate,
      },
    ]);

    setSelectedProductName(null);
    setPurchaseQuantity("");
    setPurchasePrice("");
    setTotalPrice("0.00");
    setCurrentStock(0);
    setManufactureDate("");
    setExpiryDate("");
  };

  const removeProduct = (index) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Payments ----------
  const handlePaymentChange = (name, value) => {
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedPaymentMode = paymentModes.find(
    (pm) => pm.value === paymentData.paymentMode
  );

  const isCheque = selectedPaymentMode?.label === "Cheque";
  const isBank = selectedPaymentMode?.label === "Bank";

  const handleAddPayment = () => {
    if (!paymentData.paymentMode || !paymentData.paidAmount) {
      toast.error("Payment Mode and Paid Amount are required");
      return;
    }

    console.log("PaymentData",paymentData)

    setPayments((prev) => [...prev, paymentData]);

    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const handleRemovePayment = (index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Submit ----------
  const resetForm = () => {
    setSelectedVendor(null);
    setVendorData({
      vendorName: "",
      division: "",
      district: "",
      country: "",
      vendorType: "",
      shopName: "",
      phone1: "",
      phone2: "",
      email: "",
      address: "",
      dob: "",
      nidNo: "",
    });
    setSelectedProductName(null);
    setCurrentStock(0);
    setPurchaseQuantity("");
    setPurchasePrice("");
    setTotalPrice("0.00");
    setManufactureDate("");
    setExpiryDate("");
    setAddedProducts([]);
    setTotalAmount(0);
    setDiscountAmount("");
    setTotalPayableAmount(0);
    setPayments([]);
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVendor) {
      toast.error("Select vendor");
      return;
    }
    if (!addedProducts.length) {
      toast.error("Add products");
      return;
    }
    if (!payments.length) {
      toast.error("Add payments");
      return;
    }

    const payload = {
      business_category: selectedCategory?.id || null,
      vendor_id: selectedVendor.value,
      purchase_date: purchaseDate,
      total_amount: parseFloat(totalAmount) || 0,
      discount_amount: parseFloat(discountAmount) || 0,
      total_payable_amount: parseFloat(totalPayableAmount) || 0,
      products: addedProducts.map((p) => ({
        product_id: p.id,
        purchase_quantity: parseInt(p.purchaseQuantity, 10),
        purchase_price: parseFloat(p.purchasePrice),
        total_price: parseFloat(p.totalPrice),
        // NEW – make sure your PurchaseProduct serializer accepts these:
        manufacture_date: p.manufactureDate,
        expiry_date: p.expiryDate,
      })),
      payments: payments.map((p) => ({
        payment_mode: p.paymentMode,
        bank: p.bankName || null,
        account_no: p.accountNo || null,
        cheque_no: p.chequeNo || null,
        paid_amount: parseFloat(p.paidAmount),
      })),
    };

    try {
      await AxiosInstance.post("/purchases/", payload);
      toast.success("Purchase saved successfully!");
      resetForm();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to submit purchase");
    }
  };

  // ---------- Enter key navigation ----------
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    const allFocusable = Array.from(
      document.querySelectorAll(
        `input:not([type="hidden"]),
         select,
         textarea,
         button,
         [tabindex]:not([tabindex="-1"])`
      )
    ).filter(
      (el) =>
        el.offsetParent !== null &&
        !el.disabled &&
        !(el.readOnly === true || el.getAttribute("readonly") !== null)
    );

    const currentIndex = allFocusable.indexOf(e.target);

    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextEl = allFocusable[i];
        nextEl.focus();
        break;
      }
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Vendor Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg">Vendor Details</h2>
            <p className="text-xs text-slate-500">
              Select a vendor to auto-fill their profile and contact
              information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Select Vendor
            </label>
            <Select
              options={vendorOptions}
              value={selectedVendor}
              onChange={handleVendorSelect}
              isClearable
              placeholder="Search vendor..."
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>

          <ReadonlyInput
            label="Division"
            name="division"
            value={vendorData.division}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="District"
            name="district"
            value={vendorData.district}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="Country"
            name="country"
            value={vendorData.country}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="Vendor Type"
            name="vendorType"
            value={vendorData.vendorType}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="Shop Name"
            name="shopName"
            value={vendorData.shopName}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="Phone 1"
            name="phone1"
            value={vendorData.phone1}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="Phone 2"
            name="phone2"
            value={vendorData.phone2}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="E-mail"
            name="email"
            value={vendorData.email}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="Date of Birth"
            name="dob"
            type="date"
            value={vendorData.dob}
            onChange={handleVendorChange}
          />
          <ReadonlyInput
            label="NID No."
            name="nidNo"
            value={vendorData.nidNo}
            onChange={handleVendorChange}
          />
        </div>
      </section>

      {/* Product Purchase Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold text-lg">Product Purchase</h2>
            <p className="text-xs text-slate-500">
              Add purchased food items with manufacture &amp; expiry dates for
              safe inventory tracking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full text-sm border border-slate-200 px-2 py-1.5 rounded-lg focus:outline-none focus:ring focus:ring-slate-900/10"
              required
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Product Name *
            </label>
            <Select
              options={productNameOptions}
              value={selectedProductName}
              onChange={handleProductNameChange}
              isClearable
              placeholder="Select product..."
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Current Stock
            </label>
            <input
              type="number"
              value={currentStock}
              disabled
              placeholder="0"
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-slate-50 text-slate-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Purchase Qty *
            </label>
            <input
              type="number"
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-slate-900/10"
              placeholder="Qty"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Purchase Price *
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-slate-900/10"
              placeholder="Per unit"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Manufacture Date *
            </label>
            <input
              type="date"
              value={manufactureDate}
              onChange={(e) => setManufactureDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring focus:ring-slate-900/10"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Expiry Date *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring focus:ring-slate-900/10"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Line Total
            </label>
            <input
              type="text"
              value={totalPrice}
              readOnly
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-slate-50 text-slate-700"
            />
          </div>

          <div className="flex items-end">
            <button
              className="w-full md:w-auto px-4 py-2 bg-slate-900 text-sm text-white rounded-lg hover:bg-slate-800 shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                addProduct();
              }}
              onKeyDown={handleKeyDown}
            >
              + Add Product
            </button>
          </div>
        </div>

        {addedProducts.length > 0 && (
          <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left">Product</th>
                  <th className="px-2 py-2 text-right">Current</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-right">Price</th>
                  <th className="px-2 py-2 text-right">Total</th>
                  <th className="px-2 py-2 text-center">Mfg</th>
                  <th className="px-2 py-2 text-center">Expiry</th>
                  <th className="px-2 py-2 text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                {addedProducts.map((prod, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-2 py-2 font-medium">
                      {prod.productName}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {prod.currentStock}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {prod.purchaseQuantity}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {prod.purchasePrice}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {prod.totalPrice}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {prod.manufactureDate}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {prod.expiryDate}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeProduct(idx)}
                        className="px-2 py-1 text-[11px] text-white bg-red-600 hover:bg-red-700 rounded"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Total Amount
            </label>
            <input
              type="text"
              value={
                isNaN(Number(totalAmount))
                  ? "0.00"
                  : Number(totalAmount).toFixed(2)
              }
              readOnly
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="discount"
              className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500"
            >
              Discount Amount
            </label>
            <input
              id="discount"
              type="number"
              min={0}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-slate-900/10"
              placeholder="0.00"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
              Total Payable
            </label>
            <input
              type="text"
              value={
                isNaN(Number(totalPayableAmount))
                  ? "0.00"
                  : Number(totalPayableAmount).toFixed(2)
              }
              readOnly
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-semibold text-lg">Payment</h3>
            <p className="text-xs text-slate-500">
              Record how this purchase was paid for (cash, bank, or cheque).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Payment Mode */}
          <div>
            <label className="block text-xs mb-1 font-medium uppercase tracking-wide text-slate-500">
              Payment Mode *
            </label>

            <Select
              options={paymentModes}
              value={
                paymentModes.find(
                  (opt) => opt.value === paymentData.paymentMode
                ) || null
              }
              onChange={(selected) =>
                handlePaymentChange(
                  "paymentMode",
                  selected ? selected.value : null
                )
              }
              placeholder="Select..."
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>


          {/* Bank Name */}
          <div>
            <label className="block text-xs mb-1 font-medium uppercase tracking-wide text-slate-500">
              Bank Name
            </label>

            <Select
              options={banks}
              value={
                banks.find(
                  (opt) => opt.value === paymentData.bankName
                ) || null
              }
              onChange={(selected) =>
                handlePaymentChange(
                  "bankName",
                  selected ? selected.value : null
                )
              }
              placeholder="Select"
              isClearable
              isDisabled={!isBank}
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>


          {/* Account No */}
          <div>
            <label className="block text-xs mb-1 font-medium uppercase tracking-wide text-slate-500">
              Account No
            </label>
            <input
              type="text"
              value={paymentData.accountNo}
              onChange={(e) =>
                handlePaymentChange("accountNo", e.target.value)
              }
              disabled={!isBank}
              className={`w-full border text-sm px-2 py-1.5 rounded-lg ${
                !isBank ? "bg-gray-100 text-gray-500" : ""
              }`}
              onKeyDown={handleKeyDown}
              placeholder="Account No"
            />
          </div>

          {/* Cheque No */}
          <div>
            <label className="block text-xs mb-1 font-medium uppercase tracking-wide text-slate-500">
              Cheque No
            </label>
            <input
              type="text"
              value={paymentData.chequeNo}
              onChange={(e) =>
                handlePaymentChange("chequeNo", e.target.value)
              }
              disabled={!isCheque}
              className={`w-full border px-2 py-1.5 rounded-lg ${
                !isCheque ? "bg-gray-100 text-sm text-gray-400" : ""
              }`}
              placeholder="Cheque No"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-xs mb-1 font-medium uppercase tracking-wide text-slate-500">
              Paid Amount *
            </label>
            <input
              type="number"
              value={paymentData.paidAmount}
              onChange={(e) =>
                handlePaymentChange("paidAmount", e.target.value)
              }
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-slate-900/10"
              placeholder="0.00"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAddPayment();
              }}
              className="w-full md:w-auto px-4 py-2 bg-slate-900 text-sm text-white rounded-lg hover:bg-slate-800 shadow-sm"
              onKeyDown={handleKeyDown}
            >
              Add Payment
            </button>
          </div>
        </div>

        {/* Payments Table */}
        {payments.length > 0 && (
          <div className="mt-3 overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full border-collapse text-xs md:text-sm text-center">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border border-slate-100 px-2 py-1">#</th>
                  <th className="border border-slate-100 px-2 py-1">
                    Mode
                  </th>
                  <th className="border border-slate-100 px-2 py-1">
                    Bank
                  </th>
                  <th className="border border-slate-100 px-2 py-1">
                    Account No
                  </th>
                  <th className="border border-slate-100 px-2 py-1">
                    Cheque No
                  </th>
                  <th className="border border-slate-100 px-2 py-1">
                    Paid Amount
                  </th>
                  <th className="border border-slate-100 px-2 py-1">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-100 px-2 py-1">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-100 px-2 py-1">
                      {paymentModes.find((mode) => mode.value === pay.paymentMode)
                        ?.label || "N/A"}
                    </td>
                    <td className="border border-slate-100 px-2 py-1">
                      {banks.find((bank) => bank.value === pay.bankName)
                        ?.label || "N/A"}
                    </td>
                    <td className="border border-slate-100 px-2 py-1">
                      {pay.accountNo}
                    </td>
                    <td className="border border-slate-100 px-2 py-1">
                      {pay.chequeNo}
                    </td>
                    <td className="border border-slate-100 px-2 py-1">
                      {parseFloat(pay.paidAmount || 0).toFixed(2)}
                    </td>
                    <td className="border border-slate-100 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => handleRemovePayment(idx)}
                        className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-[11px]"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Paid */}
        <div className="flex items-center gap-2 mt-4">
          <label className="block text-xs mb-1 font-medium uppercase tracking-wide text-slate-500">
            Total Paid Amount
          </label>
          <input
            type="text"
            value={
              isNaN(Number(totalPaidAmount))
                ? "0.00"
                : Number(totalPaidAmount).toFixed(2)
            }
            readOnly
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-slate-50"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-center pb-6">
        <button
          onClick={handleSubmit}
          className="px-8 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-full shadow hover:bg-slate-800"
          onKeyDown={handleKeyDown}
        >
          Save Purchase
        </button>
      </div>
    </div>
  );
}

// --- Small helper for readonly vendor inputs ---
function ReadonlyInput({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-1 font-medium text-xs uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm placeholder-gray-400 bg-slate-50 text-slate-500"
        readOnly
      />
    </div>
  );
}
