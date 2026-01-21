import { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";

export default function AccountForm({ selected, onClose, onSaved }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );


  const [form, setForm] = useState({
    business_category: selectedCategory ? selectedCategory.id : null,
    code: "",
    name: "",
    account_type: "ASSET",
  });

  useEffect(() => {
    AxiosInstance.get("accounts/").then((res) => setAccounts(res.data));

    if (selected) {
      setForm({
        ...selected,
        parent: selected.parent || "",
      });
    }
  }, [selected]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (selected) {
      await AxiosInstance.put(`accounts/${selected.id}/`, form);
    } else {
      await AxiosInstance.post("accounts/", form);
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {selected ? "Edit Account" : "Create New Account"}
          </h3>
          <p className="text-sm text-gray-500">
            Chart of Accounts configuration
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Account Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. 1110"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Cash"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="account_type"
              value={form.account_type}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300
                       text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-5 py-2 text-sm rounded-md bg-blue-600
                       text-white hover:bg-blue-700 transition font-medium"
          >
            {selected ? "Update Account" : "Save Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
