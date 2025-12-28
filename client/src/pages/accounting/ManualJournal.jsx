import { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import { useNavigate } from 'react-router-dom';



export default function OpeningBalanceEntry() {
  const businessCategory = JSON.parse(
    localStorage.getItem("business_category")
  );

  const [form, setForm] = useState({
    account: "",
    entry_type: "",
    amount: "",
    as_of_date: "",
    remarks: "",
  });

  const navigate = useNavigate();

  
  /* =========================
     HANDLE CHANGE
  ========================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SUBMIT
  ========================== */
  const submitOpeningBalance = async () => {
    try {
      if (
        !form.account ||
        !form.entry_type ||
        !form.amount ||
        !form.as_of_date
      ) {
        alert("All required fields must be filled");
        return;
      }

      await AxiosInstance.post("opening-balances/", {
        business_category: businessCategory.id,
        account: form.account,
        entry_type: form.entry_type,
        amount: Number(form.amount),
        as_of_date: form.as_of_date,
        remarks: form.remarks,
      });

      alert("Opening balance saved successfully");

      setForm({
        account: "",
        entry_type: "",
        amount: "",
        as_of_date: "",
        remarks: "",
      });
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
          "Failed to save opening balance (duplicate or invalid data)"
      );
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-4xl mx-auto p-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Opening Balance Entry
        </h2>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => navigate('/accounting/journal-list')}
        >
          Go to Journalist
        </button>
      </div>
          
      <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Type (STATIC) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Account Type *
          </label>
          <select
            name="account"
            className="w-full border rounded px-3 py-2"
            value={form.account}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="ASSET">Asset</option>
            <option value="LIABILITY">Liability</option>
            <option value="EQUITY">Equity</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        

        {/* Entry Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Entry Type *
          </label>
          <select
            name="entry_type"
            className="w-full border rounded px-3 py-2"
            value={form.entry_type}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="CASH">Cash</option>
            <option value="RECEIVABLE">Receivable</option>
            <option value="PAYABLE">Payable</option>
            <option value="CAPITAL">Capital</option>
            <option value="SALES">Sales</option>
            <option value="PURCHASE">Purchase</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Amount *
          </label>
          <input
            type="number"
            name="amount"
            className="w-full border rounded px-3 py-2 text-right"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
          />
        </div>

        {/* As of Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            As of Date *
          </label>
          <input
            type="date"
            name="as_of_date"
            className="w-full border rounded px-3 py-2"
            value={form.as_of_date}
            onChange={handleChange}
          />
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Remarks
          </label>
          <textarea
            name="remarks"
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={form.remarks}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 text-right">
        <button
          onClick={submitOpeningBalance}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
        >
          Save Opening Balance
        </button>
      </div>
    </div>
  );
}
