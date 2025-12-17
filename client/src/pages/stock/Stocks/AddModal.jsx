import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";

export default function AddModal({ onClose, business_category, onAdd }) {
  const [products, setProducts] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [formData, setFormData] = useState({
    business_category: business_category || null,
    inventory_category: "",
    product_id: "",
    purchase_quantity: "",
    sale_quantity: "",
    damage_quantity: "",
    current_stock_quantity: "",
    purchase_price: "",
    sale_price: "",
    current_stock_value: "",
    net_weight: "",
    manufacture_date: "",
    expiry_date: "",
    remarks: "",
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await AxiosInstance.get("products/", {
          params: { business_category: business_category },
        });
        setProducts(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch products");
      }
    };
    fetchProducts();
  }, [business_category]);



   useEffect(() => {
    const fetchInventoryCategory = async () => {
      try {
        const response = await AxiosInstance.get("inventory-categories/");
        setInventoryCategories(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch inventory categories");
      }
    };
    fetchInventoryCategory();
  }, [business_category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const normalize = (value) => (value === "" ? null : value);

  const handleSubmit = async () => {
    if (!formData.product) {
      toast.error("Please select a product");
      return;
    }
    if (!formData.business_category) {
      toast.error("Business category is required");
      return;
    }

    const payload = {
      ...formData,
      product_id: formData.product,
      inventory_category: formData.inventory_category, // ID
      business_category: formData.business_category, // ID
      purchase_quantity: normalize(formData.purchase_quantity),
      sale_quantity: normalize(formData.sale_quantity),
      damage_quantity: normalize(formData.damage_quantity),
      current_stock_quantity: normalize(formData.current_stock_quantity),
      purchase_price: normalize(formData.purchase_price),
      sale_price: normalize(formData.sale_price),
      net_weight: normalize(formData.net_weight),
      manufacture_date: normalize(formData.manufacture_date),
      expiry_date: normalize(formData.expiry_date),
      remarks: normalize(formData.remarks),
    };

    try {
      const res = await AxiosInstance.post("stocks/", payload);
      toast.success("Stock added successfully!");
      onAdd(res.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add stock");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Add Stock</h2>

        <div className="grid grid-cols-2 gap-4">

          {/* Category Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">category *</label>
            <select
              name="inventory_category"
              value={formData.inventory_category}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
              required
            >
              <option value="">Select product</option>
              {inventoryCategories.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Product *</label>
            <select
              name="product"
              value={formData.product}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Purchase Quantity</label>
            <input
              type="number"
              name="purchase_quantity"
              value={formData.purchase_quantity}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Sale Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Sale Quantity</label>
            <input
              type="number"
              name="sale_quantity"
              value={formData.sale_quantity}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Damage Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Damage Quantity</label>
            <input
              type="number"
              name="damage_quantity"
              value={formData.damage_quantity}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Current Stock Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Current Stock Quantity</label>
            <input
              type="number"
              name="current_stock_quantity"
              value={formData.current_stock_quantity}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Purchase Price */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Purchase Price</label>
            <input
              type="number"
              step="0.01"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Sale Price */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Sale Price</label>
            <input
              type="number"
              step="0.01"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Net Weight */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Net Weight</label>
            <input
              type="text"
              name="net_weight"
              value={formData.net_weight}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Manufacture Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Manufacture Date</label>
            <input
              type="date"
              name="manufacture_date"
              value={formData.manufacture_date}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Expiry Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="border px-2 rounded"
            />
          </div>

          {/* Remarks */}
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="border px-2 rounded w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
}
