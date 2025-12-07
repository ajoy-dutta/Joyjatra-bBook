import { useEffect, useRef, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";

export default function AddProductModal({ editProduct, closeModal, refreshProducts }) {
  const modalRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );


  const [formData, setFormData] = useState({
    business_category: selectedCategory.id,
    product_name: "",
    product_code: "",
    price: "",
    unit: "",
    remarks: "",
  });

  // Populate form if editing
  useEffect(() => {
    if (editProduct) {
      setFormData({
        business_category: selectedCategory.id,
        product_name: editProduct.product_name || "",
        product_code: editProduct.product_code || "",
        price: editProduct.price || "",
        unit: editProduct.unit || "",
        remarks: editProduct.remarks || "",
      });
    }
  }, [editProduct]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current === e.target) closeModal();
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_name.trim()) newErrors.product_name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) < 0) newErrors.price = "Valid price is required";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editProduct) {
        // Update existing product
        await AxiosInstance.put(`/products/${editProduct.id}/`, {
          ...formData,
          price: parseFloat(formData.price)
        });
      } else {
        // Add new product
        await AxiosInstance.post("/products/", {
          ...formData,
          price: parseFloat(formData.price)
        });
      }
      refreshProducts();
      closeModal();
    } catch (err) {
      if (err.response?.data) {
        const fieldErrors = {};
        Object.keys(err.response.data).forEach(k => {
          fieldErrors[k] = Array.isArray(err.response.data[k]) ? err.response.data[k][0] : err.response.data[k];
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: editProduct ? "Failed to update product" : "Failed to add product" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[999] p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-slideUp border border-slate-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Fill in the product details below
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 text-sm flex-1">{errors.submit}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                📦 Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Enter Product Name"
                className={`w-full border rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200
                  ${errors.product_name ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-400 hover:border-slate-400'}
                `}
              />
              {errors.product_name && <p className="text-red-500 text-xs mt-1">⚠️ {errors.product_name}</p>}
            </div>

            {/* Product Code */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                🏷️ Product Code
              </label>
              <input
                type="text"
                name="product_code"
                value={formData.product_code}
                onChange={handleChange}
                placeholder="Enter Product Code"
                className="w-full border rounded-xl px-4 py-3 text-sm border-slate-300 focus:ring-blue-500 focus:border-blue-400 hover:border-slate-400"
              />
            </div>

            {/* Price & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  💰 Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.000"
                  step="0.001"
                  className={`w-full border rounded-xl px-4 py-3 text-sm
                    ${errors.price ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-400 hover:border-slate-400'}
                  `}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">⚠️ {errors.price}</p>}
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  📏 Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="pcs, kg, etc."
                  className={`w-full border rounded-xl px-4 py-3 text-sm
                    ${errors.unit ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-400 hover:border-slate-400'}
                  `}
                />
                {errors.unit && <p className="text-red-500 text-xs mt-1">⚠️ {errors.unit}</p>}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                📝 Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes (optional)"
                className="w-full border rounded-xl px-4 py-3 text-sm resize-none border-slate-300 focus:ring-blue-500 focus:border-blue-400 hover:border-slate-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50/80 p-6 flex justify-between items-center">
            <button
              type="button"
              onClick={closeModal}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {editProduct ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editProduct ? "Update Product" : "Save Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
