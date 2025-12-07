import { useEffect, useState } from "react";
import AddProductModal from "./AddProductModal";
import AxiosInstance from "../../../components/AxiosInstance";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // For edit modal
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );


  const getProducts = async () => {
    try {
      const res = await AxiosInstance.get(`products/?business_category=${selectedCategory.id}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await AxiosInstance.delete(`/products/${id}/`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setOpenModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Product List</h1>
        <button
          onClick={() => {
            setEditProduct(null); // New product
            setOpenModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          + New Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-500 uppercase text-xs tracking-wider">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">SKU</th>
              <th className="py-3 px-3 text-right">Price</th>
              <th className="py-3 px-3 text-right">Unit</th>
              <th className="py-3 px-3">Remarks</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 font-medium">{p.product_name}</td>
                <td className="py-2 px-3 text-xs text-slate-600">{p.product_code}</td>
                <td className="py-2 px-3 text-right font-semibold">{p.price}</td>
                <td className="py-2 px-3 text-right">{p.unit}</td>
                <td className="py-2 px-3">{p.remarks || "-"}</td>
                <td className="py-2 px-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 rounded-lg border border-slate-200 hover:border-blue-500 text-blue-600 hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 rounded-lg border border-slate-200 hover:border-red-500 text-red-600 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <AddProductModal
          closeModal={() => setOpenModal(false)}
          refreshProducts={getProducts}
          editProduct={editProduct} // Pass the product to edit
        />
      )}
    </div>
  );
}
