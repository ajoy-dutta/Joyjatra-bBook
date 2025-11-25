import { useEffect, useRef, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";

export default function AddProductModal({ closeModal, refreshProducts }) {
  const modalRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    stock: "",
    reorder_level: "",
    stock_value: "",
  });

  // Reusable handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Close modal by outside click
  const handleOutsideClick = (e) => {
    if (modalRef.current === e.target) {
      closeModal();
    }
  };

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU code is required";
    }
    
    if (formData.stock === "" || formData.stock < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }
    
    if (formData.reorder_level === "" || formData.reorder_level < 0) {
      newErrors.reorder_level = "Valid reorder level is required";
    }
    
    if (formData.stock_value === "" || formData.stock_value < 0) {
      newErrors.stock_value = "Valid stock value is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addProduct = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await AxiosInstance.post("/products/", formData);
      refreshProducts();
      closeModal();
      
      // Show success message (you can replace with toast notification)
      console.log("Product added successfully!");
    } catch (err) {
      console.error("Add Product Error:", err);
      setErrors({ submit: "Failed to add product. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press to submit
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      addProduct();
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, icon }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        {icon}
        {label}
        <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className={`w-full border rounded-xl px-4 py-3 text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200
                   ${errors[name] 
                     ? "border-red-300 focus:ring-red-400 bg-red-50" 
                     : "border-slate-300 focus:ring-blue-500 focus:border-blue-400 hover:border-slate-400"
                   }`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          ⚠️ {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div
      ref={modalRef}
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[999] 
                 animate-fadeIn p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform 
                   animate-slideUp border border-slate-200/60 overflow-hidden"
      >
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
                  Add New Product
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

        {/* Form Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
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
            <InputField 
              label="Product Name" 
              name="name" 
              icon="📦"
              placeholder="e.g., Apple iPhone 14 Pro"
            />
            
            <InputField 
              label="SKU Code" 
              name="sku" 
              icon="🏷️"
              placeholder="e.g., IPH14-PRO-128"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="In Stock" 
                name="stock" 
                type="number" 
                icon="📊"
                placeholder="0"
              />
              
              <InputField 
                label="Reorder Level" 
                name="reorder_level" 
                type="number" 
                icon="⚠️"
                placeholder="10"
              />
            </div>
            
            <InputField 
              label="Stock Value" 
              name="stock_value" 
              type="number" 
              icon="💰"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50/80 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={closeModal}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl text-sm font-medium border border-slate-300 bg-white text-slate-700 
                         hover:bg-slate-50 hover:border-slate-400 active:scale-95 disabled:opacity-50
                         transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>

            <button
              onClick={addProduct}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                         hover:from-blue-700 hover:to-blue-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Product
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}