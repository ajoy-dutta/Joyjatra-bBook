import React, { Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import AxiosInstance from "../../components/AxiosInstance";
const todayStr = new Date().toISOString().slice(0, 10);

function autoGenerateCode(name) {
  if (!name) return "";
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-") // spaces -> dash
    .replace(/[^A-Z0-9-]/g, ""); // remove special chars
}

export default function AssetsPage() {

  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  const getEmptyForm =(category)=> ({
      business_category: category,
      name: "",
      code: "",
      purchase_date: todayStr,
      total_qty: "",
      damaged_qty: "0",
    });
  
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(getEmptyForm(selectedCategory?.id || null));
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // control whether we keep updating code from name
  const [autoCode, setAutoCode] = useState(true);

  // combobox state
  const [nameQuery, setNameQuery] = useState("");
  const [codeQuery, setCodeQuery] = useState("");

  const filteredByName =
    nameQuery === ""
      ? assets
      : assets.filter((a) =>
          a.name.toLowerCase().includes(nameQuery.toLowerCase())
        );

  const filteredByCode =
    codeQuery === ""
      ? assets
      : assets.filter((a) =>
          a.code.toLowerCase().includes(codeQuery.toLowerCase())
        );

  // =============================
  // Load Assets
  // =============================
  const loadAssets = async () => {
    try {
      const res = await AxiosInstance.get("assets/",{
        params:{business_category:selectedCategory?.id || null}
      });
      setAssets(res.data);
    } catch (e) {
      console.error("Failed to load assets", e);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // =============================
  // Handle basic inputs
  // =============================
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "total_qty" || name === "damaged_qty") {
      if (value === "") {
        setForm((p) => ({ ...p, [name]: "" }));
      } else if (/^\d+$/.test(value)) {
        setForm((p) => ({ ...p, [name]: value }));
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm(getEmptyForm(selectedCategory?.id || null));
    setEditingId(null);
    setAutoCode(true);
    setNameQuery("");
    setCodeQuery("");
  };

  // =============================
  // Submit Create / Update
  // =============================
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.code) {
      alert("Name and Code are required.");
      return;
    }

    const total = Number(form.total_qty || 0);
    const damaged = Number(form.damaged_qty || 0);

    if (total <= 0) {
      alert("Total quantity must be greater than 0.");
      return;
    }

    if (damaged > total) {
      alert("Damaged quantity cannot be more than total quantity.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        total_qty: total,
        damaged_qty: damaged,
      };

      if (editingId) {
        await AxiosInstance.put(`assets/${editingId}/`, payload);
        alert("Asset updated.");
      } else {
        // backend can merge by code for "add more" behaviour
        await AxiosInstance.post("assets/", payload);
        alert("Asset saved.");
      }

      resetForm();
      await loadAssets();
    } catch (e) {
      console.error("Save asset failed", e);
      alert("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // Edit
  // =============================
  const onEdit = (asset) => {
    setForm({
      business_category:selectedCategory?.id || null,
      name: asset.name,
      code: asset.code,
      purchase_date: asset.purchase_date || todayStr,
      total_qty: String(asset.total_qty),
      damaged_qty: String(asset.damaged_qty),
    });
    setEditingId(asset.id);
    setAutoCode(false); // don't overwrite code while editing
    setNameQuery(asset.name);
    setCodeQuery(asset.code);
  };

  // =============================
  // Delete
  // =============================
  const onDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await AxiosInstance.delete(`assets/${id}/`);
      await loadAssets();
      if (editingId === id) resetForm();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  // hint: if code exists & not editing, show info
  const existingByCode =
    !editingId && form.code
      ? assets.find((a) => a.code === form.code)
      : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets</h1>
          <p className="text-sm text-slate-500">
            Manage assets and stock quantities in one place.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm">
          <div className="bg-white rounded-xl shadow p-3 min-w-[140px]">
            <div className="text-slate-500">Total Assets</div>
            <div className="text-lg font-semibold">{assets.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow p-3 min-w-[140px]">
            <div className="text-slate-500">Total Qty</div>
            <div className="text-lg font-semibold">
              {assets.reduce((s, a) => s + Number(a.total_qty), 0)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-3 min-w-[140px]">
            <div className="text-slate-500">Damaged Qty</div>
            <div className="text-lg font-semibold text-red-600">
              {assets.reduce((s, a) => s + Number(a.damaged_qty), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
          {/* Asset Name with autocomplete (HeadlessUI Combobox) */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Asset Name <span className="text-red-600">*</span>
            </label>
            <Combobox
              value={form.name}
              onChange={(value) => {
                // when user selects or presses enter
                const match = assets.find((a) => a.name === value);
                if (match) {
                  setForm((p) => ({
                    ...p,
                    name: match.name,
                    code: match.code,
                  }));
                  setAutoCode(false);
                  setCodeQuery(match.code);
                } else {
                  setForm((p) => ({
                    ...p,
                    name: value,
                    code: autoCode ? autoGenerateCode(value) : p.code,
                  }));
                }
                setNameQuery("");
              }}
            >
              <div className="relative">
                <div className="relative w-full cursor-default overflow-hidden rounded border border-gray-300 bg-white text-left focus-within:ring-1 focus-within:ring-blue-500">
                  <Combobox.Input
                    className="w-full border-none py-1 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none"
                    placeholder="Laptop"
                    displayValue={(value) => value}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNameQuery(value);
                      setForm((p) => ({
                        ...p,
                        name: value,
                        code: autoCode ? autoGenerateCode(value) : p.code,
                      }));
                    }}
                    required
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                </div>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => {}}
                >
                  <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                    {filteredByName.length === 0 && nameQuery !== "" ? (
                      <div className="relative cursor-default select-none px-3 py-2 text-gray-500">
                        Create "{nameQuery}"
                      </div>
                    ) : (
                      filteredByName.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item.name}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-8 pr-3 ${
                              active ? "bg-blue-600 text-white" : "text-gray-900"
                            }`
                          }
                        >
                          {({ active, selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-semibold" : "font-normal"
                                }`}
                              >
                                {item.name} ({item.code})
                              </span>
                              {selected && (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                    active ? "text-white" : "text-blue-600"
                                  }`}
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
            </div>
            </Combobox>
          </div>

          {/* Code with autocomplete (HeadlessUI Combobox) */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Code <span className="text-red-600">*</span>
            </label>
            <Combobox
              value={form.code}
              onChange={(value) => {
                setForm((p) => ({ ...p, code: value }));
                setCodeQuery("");
                setAutoCode(false);
              }}
            >
              <div className="relative">
                <div className="relative w-full cursor-default overflow-hidden rounded border border-gray-300 bg-white text-left focus-within:ring-1 focus-within:ring-blue-500">
                  <Combobox.Input
                    className="w-full border-none py-1 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none"
                    placeholder="AUTO-GENERATED"
                    displayValue={(value) => value}
                    onChange={(event) => {
                      const value = event.target.value;
                      setCodeQuery(value);
                      setForm((p) => ({ ...p, code: value }));
                      setAutoCode(false);
                    }}
                    required
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                </div>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                    {filteredByCode.length === 0 && codeQuery !== "" ? (
                      <div className="relative cursor-default select-none px-3 py-2 text-gray-500">
                        Use "{codeQuery}"
                      </div>
                    ) : (
                      filteredByCode.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item.code}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-8 pr-3 ${
                              active ? "bg-blue-600 text-white" : "text-gray-900"
                            }`
                          }
                        >
                          {({ active, selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-semibold" : "font-normal"
                                }`}
                              >
                                {item.code} – {item.name}
                              </span>
                              {selected && (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                                    active ? "text-white" : "text-blue-600"
                                  }`}
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>
            {existingByCode && (
              <p className="text-[11px] text-amber-600 mt-1">
                An asset with this code already exists. Saving will add to it:
                total {existingByCode.total_qty}, damaged{" "}
                {existingByCode.damaged_qty}.
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              name="purchase_date"
              value={form.purchase_date}
              onChange={onChange}
              type="date"
              className="border border-gray-300 rounded px-3 py-1 w-full"
            />
          </div>

          {/* Total Qty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Total Qty <span className="text-red-600">*</span>
            </label>
            <input
              name="total_qty"
              value={form.total_qty}
              onChange={onChange}
              type="text"
              inputMode="numeric"
              placeholder="10"
              required
              className="border border-gray-300 rounded px-3 py-1 w-full"
            />
          </div>

          {/* Damaged Qty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Damaged Qty
            </label>
            <input
              name="damaged_qty"
              value={form.damaged_qty}
              onChange={onChange}
              type="text"
              inputMode="numeric"
              placeholder="2"
              className="border border-gray-300 rounded px-3 py-1 w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update Asset" : "Save Asset"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-2 px-2">SL</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2">Purchase Date</th>
              <th className="py-2 px-2 text-right">Total Qty</th>
              <th className="py-2 px-2 text-right text-red-600">Damaged</th>
              <th className="py-2 px-2 text-right">Usable</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a, idx) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2">{a.name}</td>
                <td className="py-2 px-2 text-xs font-mono">{a.code}</td>
                <td className="py-2 px-2">{a.purchase_date}</td>
                <td className="py-2 px-2 text-right">{a.total_qty}</td>
                <td className="py-2 px-2 text-right text-red-600">
                  {a.damaged_qty}
                </td>
                <td className="py-2 px-2 text-right">{a.usable_qty}</td>
                <td className="py-2 px-2 text-right space-x-2">
                  <button
                    onClick={() => onEdit(a)}
                    className="px-2 py-1 rounded border border-slate-200 hover:border-blue-500"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(a.id)}
                    className="px-2 py-1 rounded border border-slate-200 hover:border-red-500 text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {assets.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-4 px-2 text-center text-slate-400"
                >
                  No assets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
