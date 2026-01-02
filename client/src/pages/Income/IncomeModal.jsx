import { useEffect, useState } from "react";

export default function IncomeModal({
isOpen,
onClose,
selectedCategory,
onSubmit,
categories,
initialData = null,
}) {
  const [formData, setFormData] = useState({
    business_category: selectedCategory.id,
    category: "",
    date: "",
    amount: "",
    received_by: "",
    note: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        business_category: initialData.business_category || selectedCategory?.id || "",
        category: initialData.category,
        date: initialData.date,
        amount: initialData.amount,
        received_by: initialData.received_by,
        note: initialData.note || "",
      });
    } else {
      setFormData({
        business_category: selectedCategory?.id || "",
        category: "",
        date: "",
        amount: "",
        received_by: "",
        note: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">
            {initialData ? "Edit Income" : "Add Income"}
          </h3>
          <button onClick={onClose} className="text-xl">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            name="received_by"
            placeholder="Received By"
            value={formData.received_by}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="note"
            placeholder="Note"
            value={formData.note}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
