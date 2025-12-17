import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";

const emptyForm = {
  name: "",
  banner_top_tag: "",
  banner_title: "",
  banner_address1: "",
  banner_address2: "",
  banner_phone: "",
};

export default function BusinessCategory() {
  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState([]);

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const isEditing = !!editingId;

  const fetchCategories = async () => {
    try {
      setLoadingList(true);
      const res = await AxiosInstance.get("/business-categories/");
      setCategories(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load business categories.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = (cat) => {
    setError("");
    setEditingId(cat.id);
    setFormData({
      name: cat.name || "",
      banner_top_tag: cat.banner_top_tag || "",
      banner_title: cat.banner_title || "",
      banner_address1: cat.banner_address1 || "",
      banner_address2: cat.banner_address2 || "",
      banner_phone: cat.banner_phone || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    if (saving) return;
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await AxiosInstance.put(`/business-categories/${editingId}/`, formData);
      } else {
        await AxiosInstance.post("/business-categories/", formData);
      }

      setEditingId(null);
      setFormData(emptyForm);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string"
          ? err.response.data
          : "Something went wrong while saving.");
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await AxiosInstance.delete(`/business-categories/${id}/`);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [categories]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Business Category
        </h1>
        <p className="text-sm text-slate-500">
          Manage businesses and set the invoice/report banner information per category.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-4 md:p-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Category" : "Add New Category"}
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              These fields will be used in invoice/report PDFs.
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="px-4 md:px-6 pb-2">
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 md:p-6 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Name */}
            <Field
              label="Category Name"
              name="name"
              placeholder="e.g. Joyjatra Food Corner"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* Top Tag
            <Field
              label="Banner Top Tag"
              name="banner_top_tag"
              placeholder="e.g. ক্যাশ মেমো"
              value={formData.banner_top_tag}
              onChange={handleChange}
            /> */}

            {/* Title */}
            <Field
              label="Banner Title"
              name="banner_title"
              placeholder="e.g. জয়যাত্রা ফুড কর্ণার"
              value={formData.banner_title}
              onChange={handleChange}
            />

            {/* Phone */}
            <Field
              label="Phone"
              name="banner_phone"
              placeholder="e.g. মোবাঃ ০১৩১৬-৮১৬৮819"
              value={formData.banner_phone}
              onChange={handleChange}
            />

            {/* Address 1 */}
            <Field
              label="Address Line 1"
              name="banner_address1"
              placeholder="e.g. ২২/৭ হরিনাথ দত্ত লেন, ..."
              value={formData.banner_address1}
              onChange={handleChange}
            />

            {/* Address 2 */}
            <Field
              label="Address Line 2"
              name="banner_address2"
              placeholder="e.g. (নোভা হাসপাতালের পাশে)"
              value={formData.banner_address2}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (!saving) setFormData(emptyForm);
              }}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={saving || loadingList}
              className={`px-5 py-2 rounded-xl text-white font-medium disabled:opacity-60 ${
                isEditing ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? (isEditing ? "Updating..." : "Saving...") : isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* List/Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              Business Categories
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Click edit to update banner fields.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-800">{sortedCategories.length}</span>
          </div>
        </div>

        <div className="px-4 md:px-6 pb-6">
          {loadingList ? (
            <div className="text-sm text-slate-500">Loading categories...</div>
          ) : sortedCategories.length === 0 ? (
            <div className="text-sm text-slate-500">No categories found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-600">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Banner Title</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map((cat, idx) => (
                    <tr
                      key={cat.id}
                      className={`border-b last:border-0 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-700">{cat.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{cat.name}</div>
                        <div className="text-xs text-slate-500">
                          {cat.banner_address1 || cat.banner_address2
                            ? `${cat.banner_address1 || ""}${cat.banner_address2 ? `, ${cat.banner_address2}` : ""}`
                            : "—"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {cat.banner_title || "—"}
                        {cat.banner_top_tag ? (
                          <div className="mt-1 inline-flex text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {cat.banner_top_tag}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{cat.banner_phone || "—"}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small reusable input */
function Field({ label, name, value, onChange, placeholder, required = false }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                   focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400"
      />
    </div>
  );
}
