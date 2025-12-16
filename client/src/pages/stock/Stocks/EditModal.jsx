import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AxiosInstance from "../../../components/AxiosInstance";

export default function EditModal({ stock, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    purchase_quantity: "",
    sale_quantity: "",
    damage_quantity: "",
    purchase_price: "",
    sale_price: "",
    net_weight: "",
    manufacture_date: "",
    expiry_date: "",
    remarks: "",
  });

  useEffect(() => {
    if (stock) {
      setFormData({
        purchase_quantity: stock.purchase_quantity || 0,
        sale_quantity: stock.sale_quantity || 0,
        damage_quantity: stock.damage_quantity || 0,
        purchase_price: stock.purchase_price || "",
        sale_price: stock.sale_price || "",
        net_weight: stock.net_weight || "",
        manufacture_date: stock.manufacture_date || null,
        expiry_date: stock.expiry_date || null,
        remarks: stock.remarks && stock.remarks !== "nan" ? stock.remarks : "",

      });
    }
  }, [stock]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const normalize = (value) => (value === "" ? null : value);

  const handleUpdate = async () => {
    const payload = {
        ...formData,
        manufacture_date: normalize(formData.manufacture_date),
        expiry_date: normalize(formData.expiry_date),
    };

    try {
      const res = await AxiosInstance.patch(`/stocks/${stock.id}/`, payload);
      console.log("response",res.data);
      toast.success("Stock updated successfully!");
      onUpdated(res.data);
      onClose();
    } catch (error) {
      toast.error("Failed to update stock");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Stock</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Purchase Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Purchase Quantity</label>
            <input
              type="number"
              name="purchase_quantity"
              value={formData.purchase_quantity}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Sale Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Sale Quantity</label>
            <input
              type="number"
              name="sale_quantity"
              value={formData.sale_quantity}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Damage Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Damage Quantity</label>
            <input
              type="number"
              name="damage_quantity"
              value={formData.damage_quantity}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Current Stock */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Current Stock</label>
            <input
              type="number"
              name="current_stock_quantity"
              value={stock.current_stock_quantity}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Purchase Price */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Purchase Price</label>
            <input
              type="number"
              step="0.01"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Sale Price */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Sale Price</label>
            <input
              type="number"
              step="0.01"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Net Weight */}
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">Net Weight</label>
            <input
              type="text"
              name="net_weight"
              value={formData.net_weight}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Manufacture Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Manufacture Date</label>
            <input
              type="date"
              name="manufacture_date"
              value={formData.manufacture_date}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>

          {/* Expiry Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Expiry Date</label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-4">
          <label className="text-sm font-medium mb-1">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
