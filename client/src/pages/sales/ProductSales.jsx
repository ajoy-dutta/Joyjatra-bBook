
import { useState, useEffect } from "react";
import Select from "react-select";
import AxiosInstance from "../../components/AxiosInstance"
import { toast } from "react-hot-toast";
import { useRef } from "react";

export default function CustomerProductSale() {
  // Custom styles for react-select with vertical centering
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "0.875rem",
      border: "1px solid #000000",
      borderRadius: "0.275rem",
      borderColor: state.isFocused ? "#000000" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
      // Remove default padding
      paddingTop: "0px",
      paddingBottom: "0px",
      // Ensure flex alignment
      display: "flex",
      alignItems: "center",
    }),

    valueContainer: (base) => ({
      ...base,
      height: "30px",
      padding: "0 6px",
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
      color: "#000000",
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
      color: "#000000",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "30px",
      display: "flex",
      alignItems: "center",
    }),

    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#d1d5db",
      height: "16px", // Shorter separator
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
        color: "#000000",
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
        color: "#000000",
      },
    }),

    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#000000"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#000000",
      "&:hover": {
        backgroundColor: state.isSelected ? "#000000" : "#f3f4f6",
      },
    }),

    menu: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),

    menuList: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
  };

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    district: "",
    customer_type: "",
    shop_name: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    date_of_birth: "",
    nid_no: "",
    courier_name: "",
    remarks: "",
    previous_due_amount: "",
  });

  // Product section states
  const [productList, setProductList] = useState([]);

  // const [selectedCompany, setSelectedCompany] = useState(null);
  const [stockList, setStockList] = useState([]);

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [salePrice, setSalePrice] = useState("");
  const [salePriceWithPercentage, setSalePriceWithPercentage] =
    useState("0.00");
  const [addedProducts, setAddedProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);

  // Fetch customers, companies and products on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await AxiosInstance.get("/customers/");
        setCustomers(res.data);
      } catch (error) {
        toast.error("Failed to load customers");
      }
    };


    const fetchProducts = async () => {
      try {
        const res = await AxiosInstance.get("/products/");
        setProductList(res.data);
      } catch (err) {
        toast.error("Failed to load products");
      }
    };

    fetchCustomers();
    fetchProducts();
  }, []);



  const fetchStocks = async () => {
      try {
        const res = await AxiosInstance.get("/stocks/");
        setStockList(res.data);
        console.log(stockList);
      } catch (err) {
        toast.error("Failed to load stock data");
      }
    };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Customer select options
  const customerOptions = customers.map((c) => ({
    label: c.customer_name,
    value: c.id,
    ...c,
  }));

  // Handle customer data change
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value || "", // Ensure value is always a string
    }));
  };

  // Handle customer select
  const handleCustomerSelect = (selectedOption) => {
    setSelectedCustomer(selectedOption);
    if (selectedOption) {
      // When a customer is selected, populate the form with their data
      setCustomerData({
        customer_name: selectedOption.customer_name || "",
        district: selectedOption.district || "",
        customer_type: selectedOption.customer_type || "",
        shop_name: selectedOption.shop_name || "",
        phone1: selectedOption.phone1 || "",
        phone2: selectedOption.phone2 || "",
        email: selectedOption.email || "",
        address: selectedOption.address || "",
        date_of_birth: selectedOption.date_of_birth || "",
        nid_no: selectedOption.nid_no || "",
        courier_name: selectedOption.courier_name || "",
        remarks: selectedOption.remarks || "",
        previous_due_amount: selectedOption.previous_due_amount || 0,
      });
    } else {
      // Clear form when no customer is selected
      setCustomerData({
        customer_name: "",
        district: "",
        customer_type: "",
        shop_name: "",
        phone1: "",
        phone2: "",
        email: "",
        address: "",
        date_of_birth: "",
        nid_no: "",
        courier_name: "",
        remarks: "",
        previous_due_amount: "",
      });
    }
  };

  

  const [saleMRP, setSaleMRP] = useState("");
  const [price, setPrice] = useState("");
  const [percentage, setPercentage] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [totalPrice, setTotalPrice] = useState("0.00");
  const [currentStock, setCurrentStock] = useState(0);
  const [selectedProductName, setSelectedProductName] = useState(null);
  const [selectedPartNumber, setSelectedPartNumber] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);


  // Product name and part no options for selects
  const productNameOptions = productList.map((p) => ({
    label: p.product_name,
    value: p.id,
    part_no: p.part_no,
  }));

  const partNumberOptions = productList.map((p) => ({
    label: p.part_no,
    value: p.id,
    product_name: p.product_name,
  }));

  // Common function to set product data
  const setProductData = (product) => {
    if (!product) return;

    // Find stock data by matching product ID
    const stockItem = stockList.find(
      (s) => s.product?.id === product.id && s.part_no === product.part_no
    );
    const stockQty = stockItem ? stockItem.current_stock_quantity : 0;
    setCurrentStock(stockQty);

    // Set MRP from product_mrp
    const mrpValue = parseFloat(stockItem.purchase_price || 0);
    setSaleMRP(mrpValue.toFixed(2));
    setPrice(mrpValue.toFixed(2));

    setSaleQuantity("");
    setPercentage("");
    setTotalPrice("0.00");
  };

  const handleProductNameChange = (val) => {
    if (!val) {
      setSelectedProductName(null);
      setSelectedPartNumber(null);
      setCurrentStock(0);
      setSaleMRP("");
      setPrice("");
      setPercentage("");
      setTotalPrice("0.00");
      setSaleQuantity("");
    } else {
      setSelectedProductName(val);

      const prod = productList.find((p) => p.id === val.value);
      if (prod) {
        setSelectedPartNumber({ label: prod.part_no, value: prod.part_no });
        setSelectedProduct({ label: prod.id, value: prod.part_no });
        setProductData(prod);
      }
    }
  };




  const handlePartNumberChange = (val) => {
    if (!val) {
      setSelectedPartNumber(null);
      setSelectedProductName(null);
      setCurrentStock(0);
      setSaleMRP("");
      setPrice("");
      setPercentage("");
      setTotalPrice("0.00");
      setSaleQuantity("");
    } else {
      setSelectedPartNumber(val);

      const prod = productList.find((p) => p.id === val.value);
      console.log("Found product by part number:", prod);
      if (prod) {
        setSelectedProductName({ label: prod.product_name, value: prod.id });
        setSelectedProduct({ label: prod.id, value: prod.part_no });
        setProductData(prod);
      }
    }
  };

  useEffect(() => {
    if (!selectedProduct) {
      console.log("No product selected");
      return;
    }

    const stockItem = stockList.find(
      (s) => s.product?.id === parseInt(selectedProduct.label) && s.part_no === selectedProduct.value
    );

    if(stockItem && stockItem.current_stock_quantity < saleQuantity) {  
      toast.error(`Sale quantity cannot exceed current stock (${stockItem.current_stock_quantity})`);
      setSaleQuantity(stockItem.current_stock_quantity);
      return;            
    }

    const basePrice = parseFloat(stockItem.purchase_price || 0);
    const perc = parseFloat(percentage) || 0;
    const qty = parseInt(saleQuantity) || 0;

    const priceWithPerc = basePrice + (basePrice * perc) / 100;
    setPrice(priceWithPerc.toFixed(2));

    if (qty > 0){
      const tPrice = priceWithPerc * qty;
      setTotalPrice(tPrice.toFixed(2));
    } else {
      console.log("No quantity provided, setting total to 0");
      setTotalPrice("0.00");
    }
  }, [percentage, saleQuantity]);


  // Add product to table
  const addProduct = () => {
    if (!selectedProductName) {
      toast.error("Please select a product");
      return;
    }

    if (!saleQuantity || saleQuantity <= 0) {
      toast.error("Please enter a valid sale quantity");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error("Price is required");
      return;
    }

    const existingProduct = addedProducts.find(
      (p) => p.id === selectedProductName.value
    );
    if (existingProduct) {
      toast.error("This product is already added to the list");
      return;
    }


    const newProd = {
      id: selectedProductName.value,
      productName: selectedProductName.label,
      partNumber: selectedPartNumber ? selectedPartNumber.value : "",
      currentStock: parseInt(currentStock),
      saleQuantity: parseInt(saleQuantity),
      saleMRP: parseFloat(saleMRP),
      price: parseFloat(price),
      percentage: parseFloat(percentage) || 0,
      totalPrice: parseFloat(totalPrice),
    };

    setAddedProducts((prev) => [...prev, newProd]);

    toast.success("Product added successfully");

    // Reset product fields but keep company
    setSelectedProductName(null);
    setSelectedPartNumber(null);
    setCurrentStock(0);
    setSaleQuantity("");
    setSaleMRP("");
    setPrice("");
    setPercentage("");
    setTotalPrice("0.00");
  };

  // Remove product from table
  const removeProduct = (idx) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    const total = addedProducts.reduce(
      (acc, p) => acc + parseFloat(p.totalPrice),
      0
    );
    setTotalAmount(total);

    const discount = parseFloat(discountAmount) || 0;
    const payable = total - discount;
    setTotalPayableAmount(payable > 0 ? payable : 0);
  }, [addedProducts, discountAmount]);

  const [paymentModes, setPaymentModes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [paymentData, setPaymentData] = useState({
    paymentMode: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });
  const [addedPayments, setAddedPayments] = useState([]);

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pmRes, bankRes] = await Promise.all([
          AxiosInstance.get("/payment-mode/"),
          AxiosInstance.get("/banks/"),
        ]);
        setPaymentModes(
          pmRes.data.map((pm) => ({
            value: pm.id,
            label: pm.name,
          }))
        );
        setBanks(
          bankRes.data.map((bank) => ({
            value: bank.id,
            label: bank.name,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payment data");
      }
    };
    fetchData();
  }, []);

  const handlePaymentChange = (name, value) => {
    console.log("paymenMode", name);
    console.log("value", value);
    
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = () => {
    if (!paymentData.paymentMode || !paymentData.paidAmount) {
      toast.error("Payment Mode and Paid Amount are required");
      return;
    }

    setPayments((prev) => [...prev, paymentData]);

    // reset paymentData
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const selectedPaymentModeLabel = paymentModes.find(
    (pm) => pm.label === paymentData.paymentMode
  )?.label;

  const isCheque = selectedPaymentModeLabel === "Cheque";
  const isBank = selectedPaymentModeLabel === "Bank";

  const handleRemovePayment = (index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  useEffect(() => {
    const total = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.paidAmount || 0),
      0
    );
    setTotalPaidAmount(total);
  }, [payments]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (addedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    try {
      const payload = {
        customer_id: selectedCustomer.value,
        sale_date: saleDate,
        total_amount: parseFloat(totalAmount),
        discount_amount: parseFloat(discountAmount) || 0,
        total_payable_amount: parseFloat(totalPayableAmount),

        // Products data - matches SaleProduct model
        products: addedProducts.map((product) => ({
          product_id: product.id,
          part_no: product.partNumber,
          sale_quantity: parseInt(product.saleQuantity),
          sale_price: parseFloat(product.price),
          percentage: parseFloat(product.percentage) || 0,
          sale_price_with_percentage: parseFloat(
            product.price * (1 + (product.percentage || 0) / 100)
          ).toFixed(2),
          total_price: parseFloat(product.totalPrice),
        })),

        // Payments data - matches SalePayment model
        payments: payments.map((payment) => ({
          payment_mode: payment.paymentMode,
          bank_name: payment.bankName || null,
          account_no: payment.accountNo || null,
          cheque_no: payment.chequeNo || null,
          paid_amount: parseFloat(payment.paidAmount),
          remarks: payment.remarks || null,
        })),
      };

      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      const response = await AxiosInstance.post("/sales/", payload);
      toast.success("Sale created successfully!");

      // Reset form
      resetForm();
      fetchStocks();
    } catch (error) {
      console.error("Submission error:", error.response?.data);

      if (error.response?.data) {
        if (error.response.data.products) {
          error.response.data.products.forEach((err, index) => {
            if (err.product) {
              toast.error(`Product ${index + 1}: ${err.product.join(" ")}`);
            }
          });
        } else {
          for (const [field, errors] of Object.entries(error.response.data)) {
            toast.error(
              `${field}: ${Array.isArray(errors) ? errors.join(" ") : errors}`
            );
          }
        }
      } else {
        toast.error("Failed to submit sale. Please check console for details.");
      }
    }
  };

  // Reset form function
  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerData({
      customer_name: "",
      district: "",
      customer_type: "",
      shop_name: "",
      phone1: "",
      phone2: "",
      email: "",
      address: "",
      date_of_birth: "",
      nid_no: "",
      courier_name: "",
      remarks: "",
      previous_due_amount: "",
    });
    setSelectedProductName(null);
    setSelectedPartNumber(null);
    setSaleDate(new Date().toISOString().split("T")[0]);
    setAddedProducts([]);
    setTotalAmount(0);
    setDiscountAmount("");
    setTotalPayableAmount(0);
    setPayments([]);
    setTotalPaidAmount(0);
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    // Skip if react-select menu is open
    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    // Select all focusable elements
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
        el.offsetParent !== null && // visible
        !el.disabled && // not disabled
        !(el.readOnly === true || el.getAttribute("readonly") !== null) // not readonly
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

  return (
    <div className="max-w-7xl mx-auto p-4  ">
      {/* Customer Section */}
      <section>
        <h2 className="font-semibold text-lg my-2">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <label className="block mb-1 font-medium text-sm">
              Select Customer
            </label>
            <Select
              options={customerOptions}
              value={selectedCustomer}
              onChange={handleCustomerSelect}
              isClearable
              placeholder="Select..."
              className="text-sm"
              styles={customSelectStyles}
              readOnly
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">District</label>
            <input
              type="text"
              name="district"
              value={customerData.district}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="District..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Customer Type *
            </label>
            <input
              type="text"
              name="customer_type"
              value={customerData.customer_type}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Type..."
              required
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Shop Name *
            </label>
            <input
              type="text"
              name="shop_name"
              value={customerData.shop_name}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Shop Name..."
              required
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Phone 1 *</label>
            <input
              type="text"
              name="phone1"
              value={customerData.phone1}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Phone..."
              required
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Phone 2</label>
            <input
              type="text"
              name="phone2"
              value={customerData.phone2}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Alt phone..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">E-mail Id</label>
            <input
              type="email"
              name="email"
              value={customerData.email}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Email..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Address *</label>
            <input
              type="text"
              name="address"
              value={customerData.address}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Address..."
              required
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={customerData.date_of_birth}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">NID No.</label>
            <input
              type="text"
              name="nid_no"
              value={customerData.nid_no}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="NID number..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">
              Courier Name
            </label>
            <input
              type="text"
              name="courier_name"
              value={customerData.courier_name}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Courier Name..."
              readOnly
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Remarks</label>
            <input
              name="remarks"
              value={customerData.remarks}
              onChange={handleCustomerChange}
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="Remarks..."
              rows="2"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </section>

      {/* Product Sale Section */}
      <section>
        <h2 className="font-semibold text-lg my-2">Product Sale</h2>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
            {/* Sale Date */}
            <div>
              <label className="block text-sm mb-1 font-medium">
                Sale Date *
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full text-sm border px-2 py-1 rounded"
                required
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                Product Name *
              </label>
              <Select
                options={productNameOptions}
                value={selectedProductName}
                onChange={handleProductNameChange}
                isClearable
                placeholder="Select product name"
                className="text-sm"
                styles={customSelectStyles}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Part Number */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                Part Number *
              </label>
              <Select
                options={partNumberOptions}
                value={selectedPartNumber}
                onChange={handlePartNumberChange}
                isClearable
                placeholder="Select part number"
                className="text-sm"
                styles={customSelectStyles}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Current Stock */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                Current Stock Quantity
              </label>
              <input
                type="number"
                value={currentStock}
                disabled
                placeholder="Current stock will appear here"
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              />
            </div>

            {/* Sale Quantity */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                Sale Quantity *
              </label>
              <input
                type="number"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                placeholder="Enter sale quantity"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* MRP (product_mrp) */}
            <div>
              <label className="block mb-1 font-medium text-sm">MRP</label>
              <input
                type="number"
                value={saleMRP} // this is MRP from backend
                readOnly
                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Percentage (user input) */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                Percentage *
              </label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                placeholder="Enter percentage"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Price (product_bdt) */}
            <div>
              <label className="block mb-1 font-medium text-sm">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Total Price */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                Total Price
              </label>
              <input
                type="text"
                value={totalPrice}
                readOnly
                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Add Button */}

            <div className="flex items-end">
              <button
                className="
                  px-4 py-2 text-sm text-white rounded 
                  bg-sky-800 
                  hover:bg-sky-700
                  focus:bg-green-700     /* When button is focused */
                  focus:ring-2 
                  focus:ring-green-400 
                  focus:outline-none
                "
                tabIndex="0"
                onClick={(e) => {
                  e.preventDefault();
                  addProduct();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addProduct();
                  }
                }}
              >
                Add Product
              </button>
            </div>

          </div>
        </section>

        {/* Product Table */}
        {addedProducts.length > 0 && (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-sky-800 text-md text-white">
                <tr>
                  <th className="border px-2 py-1">Product Name</th>
                  <th className="border px-2 py-1">Part Number</th>
                  <th className="border px-2 py-1">Current Stock</th>
                  <th className="border px-2 py-1">Sale Qty</th>
                  <th className="border px-2 py-1">Sale Price</th>
                  <th className="border px-2 py-1">Percentage</th>

                  <th className="border px-2 py-1">Total Price</th>
                  <th className="border px-2 py-1">Remove</th>
                </tr>
              </thead>
              <tbody>
                {addedProducts.map((prod, idx) => (
                  <tr key={idx}>
                    <td className="border text-center px-2 py-1">
                      {prod.productName}
                    </td>
                    <td className="border text-center px-2 py-1">
                      {prod.partNumber}
                    </td>
                    <td className="border text-center px-2 py-1">
                      {prod.currentStock}
                    </td>
                    <td className="border text-center px-2 py-1">
                      {prod.saleQuantity}
                    </td>
                    <td className="border text-center px-2 py-1">
                      {prod.price}
                    </td>
                    <td className="border text-center px-2 py-1">
                      {prod.percentage}
                    </td>

                    <td className="border text-center px-2 py-1">
                      {prod.totalPrice}
                    </td>
                    <td className="border  px-2 py-1 text-center">
                      <button
                        onClick={() => removeProduct(idx)}
                        className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-xs"
                        onKeyDown={handleKeyDown}
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

        {/* Totals Section */}
        <div className="mt-2 max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center flex-1">
              <label className="block mb-1 font-medium text-sm">
                Total Amount:
              </label>
              <input
                type="text"
                value={
                  isNaN(Number(totalAmount))
                    ? "0.00"
                    : Number(totalAmount).toFixed(2)
                }
                readOnly
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="flex items-center flex-1">
              <label
                htmlFor="discount"
                className="block mb-1 font-medium text-sm"
              >
                Discount Amount:
              </label>
              <input
                id="discount"
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                placeholder="0.00"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="flex items-center flex-1">
              <label className="block mb-1 font-medium text-sm">
                Total Payable Amount:
              </label>
              <input
                type="text"
                value={
                  isNaN(Number(totalPayableAmount))
                    ? "0.00"
                    : Number(totalPayableAmount).toFixed(2)
                }
                readOnly
                className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="">
        <h3 className="font-semibold text-lg my-2">Payment</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {/* Payment Mode */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              Payment Mode*
            </label>
            <Select
              options={paymentModes}
              value={
                    paymentModes.find((pm) => pm.label === paymentData.paymentMode) || null
                  }
              onChange={(selected) =>
                handlePaymentChange(
                  "paymentMode",
                  selected ? selected.label : ""
                )
              }
              placeholder="Select"
              className="text-sm"
              styles={customSelectStyles}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm mb-1 font-medium">Bank Name</label>
            <Select
              options={banks}
              value={
                banks.find((opt) => opt.value === paymentData.bankName) || null
              }
              onChange={(selected) =>
                handlePaymentChange("bankName", selected ? selected.value : "")
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
            <label className="block text-sm mb-1 font-medium">Account No</label>
            <input
              type="text"
              value={paymentData.accountNo}
              onChange={(e) => handlePaymentChange("accountNo", e.target.value)}
              disabled={!isBank}
              className={`w-full border text-sm px-2 py-1 rounded ${
                !isBank ? "bg-gray-100 text-gray-500" : ""
              }`}
              placeholder="Account No"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Cheque No */}
          <div>
            <label className="block text-sm mb-1 font-medium">Cheque No</label>
            <input
              type="text"
              value={paymentData.chequeNo}
              onChange={(e) => handlePaymentChange("chequeNo", e.target.value)}
              disabled={!isCheque}
              className={`w-full border px-2 py-1 rounded ${
                !isCheque ? "bg-gray-100 text-sm text-gray-400" : ""
              }`}
              placeholder="Cheque No"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              Paid Amount*
            </label>
            <input
              type="number"
              value={paymentData.paidAmount}
              onChange={(e) =>
                handlePaymentChange("paidAmount", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm placeholder-gray-400"
              placeholder="0.00"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="flex items-end">
              <button
                className="
                  px-4 py-2 text-sm text-white rounded 
                  bg-sky-800 
                  hover:bg-sky-700
                  focus:bg-green-700     /* When button is focused */
                  focus:ring-2 
                  focus:ring-green-400 
                  focus:outline-none
                "
                tabIndex="0"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddPayment();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPayment();
                  }
                }}
              >
                Add
              </button>
          </div>


        </div>
      </div>

      {payments.length > 0 && (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full border text-center text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Payment Mode</th>
                <th className="border px-2 py-1">Bank Name</th>
                <th className="border px-2 py-1">Account No</th>
                <th className="border px-2 py-1">Cheque No</th>
                <th className="border px-2 py-1">Paid Amount</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">
                    {paymentModes.find((mode) => mode.value === pay.paymentMode)
                      ?.label || "N/A"}
                  </td>
                  <td className="border px-2 py-1">
                    {banks.find((bank) => bank.value === pay.bankName)?.label ||
                      "N/A"}
                  </td>
                  <td className="border px-2 py-1">{pay.accountNo}</td>
                  <td className="border px-2 py-1">{pay.chequeNo}</td>
                  <td className="border px-2 py-1">
                    {parseFloat(pay.paidAmount).toFixed(2)}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleRemovePayment(idx)}
                      className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-xs"
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

      <div className="flex items-center gap-2 mt-4">
        <label className="block text-sm mb-1 font-medium">
          Total Paid Amount:
        </label>
        <input
          type="number"
          value={
            isNaN(Number(totalPaidAmount))
              ? "0.00"
              : Number(totalPaidAmount).toFixed(2)
          }
          readOnly
          className="border rounded px-2 py-1 text-sm placeholder-gray-400"
        />
      </div>

      <div className=" flex justify-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 text-sm bg-sky-800 text-white rounded hover:bg-sky-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}