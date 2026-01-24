// client/src/pages/expenses/SalaryExpense.jsx
import React, { useEffect, useState, useMemo } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// ✅ logo fallback (same idea like PurchaseInvoices)
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

const EMPTY_FORM = {
  staff: "",
  salary_month: "",
  base_amount: "",
  allowance: "",
  bonus: "",
  payment_mode: null,
  bank: null,
  note: "",
};


const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};


const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  return `${year}-${month}`;
};

export default function SalaryExpense() {
  // ---------- Custom Select Styles ----------
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "0.875rem",
      border: "1px solid #000000",
      borderRadius: "0.275rem",
      borderColor: state.isFocused ? "#000000" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #000000" : "none",
      paddingTop: "0px",
      paddingBottom: "0px",
      display: "flex",
      alignItems: "center",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "30px",
      padding: "0 6px",
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#9ca3af",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#000000",
      margin: "0",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    input: (base) => ({
      ...base,
      fontSize: "0.875rem",
      margin: "0",
      padding: "0",
      color: "#000000",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "30px",
      display: "flex",
      alignItems: "center",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#d1d5db",
      height: "16px",
      marginTop: "auto",
      marginBottom: "auto",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": { color: "#000000" },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": { color: "#000000" },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#000000"
        : state.isFocused
          ? "#f3f4f6"
          : "white",
      color: state.isSelected ? "white" : "#000000",
      "&:hover": {
        backgroundColor: state.isSelected ? "#000000" : "#f3f4f6",
      },
    }),
    menu: (base) => ({ ...base, fontSize: "0.875rem" }),
    menuList: (base) => ({ ...base, fontSize: "0.875rem" }),
  };

  const [staffs, setStaffs] = useState([]);
  const [items, setItems] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Filters for payroll sheet
  const [filterStaff, setFilterStaff] = useState(""); // staff id
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth()); // "YYYY-MM"

  // ✅ business category (reactive)
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );


  // live total on the form
  const formTotalSalary = useMemo(
    () =>
      toNumber(form.base_amount) +
      toNumber(form.allowance) +
      toNumber(form.bonus),
    [form.base_amount, form.allowance, form.bonus]
  );

  // ✅ Listen to business switch (same tab + other tabs)
  useEffect(() => {
    const readBusiness = () => {
      setSelectedCategory(
        JSON.parse(localStorage.getItem("business_category")) || null
      );
    };

    const onStorage = (e) => {
      if (e.key === "business_category") readBusiness();
    };

    const onBusinessChanged = () => readBusiness();

    window.addEventListener("storage", onStorage);
    window.addEventListener("business_category_changed", onBusinessChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("business_category_changed", onBusinessChanged);
    };
  }, []);


  // ---------- Fetch payment modes & banks ----------
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [pmRes, bankRes] = await Promise.all([
          AxiosInstance.get("payment-mode/"),
          AxiosInstance.get("banks/"),
        ]);
        setPaymentModes(
          pmRes.data.map((pm) => ({
            value: pm.id,
            label: pm.name,
          }))
        );
        setBanks(
          bankRes.data.map((bank) => ({
            value: bank.id,
            label: bank.name,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payment data");
      }
    };
    fetchPaymentData();
  }, []);


  const selectedPaymentModeObj = paymentModes.find(
    (pm) => pm.value === form.payment_mode
  );
  const selectedPaymentModeLabel = selectedPaymentModeObj?.label;

  const isCheque = selectedPaymentModeLabel === "Cheque";
  const isBank = selectedPaymentModeLabel === "Bank";


  // ------------ API ------------
  const loadStaffs = async () => {
    try {
      const res = await AxiosInstance.get("staffs/"); // existing endpoint
      setStaffs(res.data || []);
    } catch (e) {
      console.error("Failed to load staffs", e);
    }
  };

  const loadSalaryExpenses = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (searchValue.trim()) params.search = searchValue.trim();

      const res = await AxiosInstance.get("salary-expenses/", { params });
      setItems(res.data || []);

      console.log("Salary Expenses", res.data);
    } catch (e) {
      console.error("Failed to load salary expenses", e);
      setError("Failed to load salary expenses");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch banner category-wise (same idea as Expense.jsx)
  const fetchBanner = async (categoryId) => {
    if (!categoryId) {
      setBanner(null);
      return;
    }
    try {
      setBannerLoading(true);
      const res = await AxiosInstance.get(`/business-categories/${categoryId}/`);
      setBanner(res.data);
    } catch (e) {
      console.error("Failed to fetch banner:", e);
      setBanner(null);
    } finally {
      setBannerLoading(false);
    }
  };

  useEffect(() => {
    loadStaffs();
    loadSalaryExpenses();
  }, []);

  // ✅ refetch banner when business changes
  useEffect(() => {
    const id = selectedCategory?.id || null;
    fetchBanner(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id]);

  // ------------ Handlers ------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleSelectChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    loadSalaryExpenses(value);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };


   // ---------- Enter key navigation ----------
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const selectMenuOpen = document.querySelector(".react-select__menu");
    if (selectMenuOpen) return;

    e.preventDefault();

    const allFocusable = Array.from(
      document.querySelectorAll(
        `input:not([type="hidden"]),
         select,
         textarea,
         button,
         [tabindex]:not([tabindex="-1"])`
      )
    ).filter(
      (el) =>
        el.offsetParent !== null &&
        !el.disabled &&
        !(el.readOnly === true || el.getAttribute("readonly") !== null)
    );

    const currentIndex = allFocusable.indexOf(e.target);
    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextEl = allFocusable[i];
        nextEl.focus();
        break;
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.staff || !form.salary_month || !form.base_amount) {
      alert("Employee, month and basic amount are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      business_category: selectedCategory?.id || null,
      staff: form.staff,
      salary_month: form.salary_month, // "YYYY-MM"
      base_amount: form.base_amount, // basic
      allowance: form.allowance || 0,
      bonus: form.bonus || 0,
      payment_mode: form.payment_mode,
      bank: form.bank,
      note: form.note,
    };

    try {
      if (editingId) {
        await AxiosInstance.patch(`salary-expenses/${editingId}/`, payload);
      } else {
        await AxiosInstance.post("salary-expenses/", payload);
      }
      resetForm();
      loadSalaryExpenses(search);
    } catch (e) {
      console.error("Save failed", e);
      setError("Failed to save salary expense");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      staff: item.staff || "",
      salary_month: item.salary_month || "",
      base_amount: item.base_amount || "",
      allowance: item.allowance || "",
      bonus: item.bonus || "",
      payment_mode: item.payment_mode || null,
      bank: item.bank || null,
      note: item.note || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this salary record?")) return;
    try {
      await AxiosInstance.delete(`salary-expenses/${id}/`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
      setError("Failed to delete salary expense");
    }
  };

  // ------------ Payroll sheet filtering ------------
  const filteredItems = useMemo(
    () =>
      items.filter((r) => {
        if (filterStaff && String(r.staff) !== String(filterStaff)) {
          return false;
        }
        if (filterMonth && r.salary_month !== filterMonth) {
          return false;
        }
        return true;
      }),
    [items, filterStaff, filterMonth]
  );

  // ------------ Payroll summary (based on filtered items) ------------

  const totalBasic = useMemo(
    () => filteredItems.reduce((sum, r) => sum + toNumber(r.base_amount), 0),
    [filteredItems]
  );
  const totalAllowance = useMemo(
    () => filteredItems.reduce((sum, r) => sum + toNumber(r.allowance), 0),
    [filteredItems]
  );
  const totalBonus = useMemo(
    () => filteredItems.reduce((sum, r) => sum + toNumber(r.bonus), 0),
    [filteredItems]
  );
  const totalSalary = useMemo(
    () =>
      filteredItems.reduce(
        (sum, r) =>
          sum +
          (r.total_salary != null
            ? toNumber(r.total_salary)
            : toNumber(r.base_amount) +
              toNumber(r.allowance) +
              toNumber(r.bonus)),
        0
      ),
    [filteredItems]
  );

  const formatMoney = (v) =>
    `৳ ${toNumber(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ------------ Export / Print ------------

  const escapeCsv = (value) => {
    if (value == null) return "";
    const stringValue = String(value);
    if (
      stringValue.includes('"') ||
      stringValue.includes(",") ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCsv = () => {
    const headers = ["Employee", "Month", "Basic", "Allowance", "Bonus", "Total Salary", "Note"];

    const rows = filteredItems.map((r) => {
      const rowTotal =
        r.total_salary != null
          ? toNumber(r.total_salary)
          : toNumber(r.base_amount) +
            toNumber(r.allowance) +
            toNumber(r.bonus);

      return [
        r.staff_name || `Staff #${r.staff}`,
        r.salary_month,
        toNumber(r.base_amount).toFixed(2),
        toNumber(r.allowance).toFixed(2),
        toNumber(r.bonus).toFixed(2),
        rowTotal.toFixed(2),
        r.note || "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const monthPart = filterMonth || "all-months";
    link.href = url;
    link.setAttribute("download", `payroll_${monthPart}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };



  const handlePrint = () => {
    navigate(`/expenses/salary/pdf?month=${filterMonth}&staff=${filterStaff}`);
  }

 

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-lg font-semibold border-b text-slate-800 pb-1">Salary Expenses / Payroll</h2>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-xl p-4 items-end shadow-sm"
      >
        {/* Staff */}
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Employee *
          </label>
          <select
            name="staff"
            value={form.staff}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-black bg-white"
          >
            <option value="">Select employee</option>
            {staffs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.staff_name || `Staff #${s.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Salary Month *
          </label>
          <input
            type="month"
            name="salary_month"
            value={form.salary_month}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-black bg-white"
          />
        </div>

        {/* Basic Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Basic Amount (৳) *
          </label>
          <input
            type="number"
            name="base_amount"
            step="0.01"
            value={form.base_amount}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-black bg-white"
          />
        </div>

        {/* Allowance */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Allowance (৳)
          </label>
          <input
            type="number"
            name="allowance"
            step="0.01"
            value={form.allowance}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-black bg-white"
          />
        </div>

        {/* Bonus */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Bonus (৳)
          </label>
          <input
            type="number"
            name="bonus"
            step="0.01"
            value={form.bonus}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 focus:ring-black bg-white"
          />
        </div>

        {/* Total (read-only) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Total Salary (৳)
          </label>
          <div className="w-full px-3 py-2 rounded-lg border border-slate-100 text-sm bg-slate-50 flex items-center justify-between">
            <span className="text-slate-500 text-xs">Preview</span>
            <span className="font-semibold">{formatMoney(formTotalSalary)}</span>
          </div>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-sm mb-1 font-medium">
            Payment Mode
          </label>
          <Select
            options={paymentModes}
            value={
              paymentModes.find(
                (pm) => pm.value === Number(form.payment_mode)
              ) || null
            }
            onChange={(selected) =>
              handleSelectChange(
                "payment_mode",
                selected ? selected.value : null
              )
            }
            placeholder="Select"
            styles={customSelectStyles}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm mb-1 font-medium">
            Bank Name
          </label>
          <Select
            options={banks}
            value={
              banks.find((opt) => opt.value === form.bank) || null
            }
            onChange={(selected) =>
              handleSelectChange(
                "bank",
                selected ? selected.value : null
              )
            }
            placeholder="Select"
            isClearable
            isDisabled={!isBank}
            styles={customSelectStyles}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Note */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Note
          </label>
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Bonus reason, overtime, deductions, etc."
            className="w-full px-3 py-3 rounded-lg border text-sm focus:ring-1 focus:ring-black bg-white"
          />
        </div>

        {/* Buttons */}
        <div className="lg:col-span-2 flex justify-start gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-full bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update Payroll" : "Save Payroll"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-2 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
          
        </div>
      </form>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <SummaryCard label="Total Basic" value={formatMoney(totalBasic)} />
        <SummaryCard label="Total Allowance" value={formatMoney(totalAllowance)} />
        <SummaryCard label="Total Bonus" value={formatMoney(totalBonus)} />
        <SummaryCard label="Total Salary" value={formatMoney(totalSalary)} highlight />
      </div>

      {/* Payroll Sheet */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Payroll Sheet</h3>
            <span className="text-[11px] text-slate-500">
              {filteredItems.length} record{filteredItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Staff filter */}
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="px-2 py-1 text-sm rounded-full border border-slate-200 bg-white"
            >
              <option value="">All employees</option>
              {staffs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.staff_name || `Staff #${s.id}`}
                </option>
              ))}
            </select>

            {/* Month filter */}
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-2 py-1 text-sm rounded-full border border-slate-200 bg-white"
            />

            {/* Clear filters */}
            <button
              type="button"
              onClick={() => {
                setFilterStaff("");
                setFilterMonth("");
              }}
              className="px-2 py-1 text-sm rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Clear filter
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1 text-sm rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              Export Excel (CSV)
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 text-sm rounded-full border border-indigo-600 text-indigo-700 hover:bg-indigo-50"
            >
              Print / PDF
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-xs text-slate-500">No salary expenses recorded yet.</p>
        ) : (
          <div id="payroll-sheet-print-area" className="overflow-x-auto">
            <table className="min-w-full text-xs border border-slate-100">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b">
                  <th className="py-2 px-2 text-left">Employee</th>
                  <th className="py-2 px-2 text-left">Month</th>
                  <th className="py-2 px-2 text-right">Basic</th>
                  <th className="py-2 px-2 text-right">Allowance</th>
                  <th className="py-2 px-2 text-right">Bonus</th>
                  <th className="py-2 px-2 text-right">Total Salary</th>
                  <th className="py-2 px-2 text-left">Payment</th>
                  <th className="py-2 px-2 text-left">Bank</th>
                  <th className="py-2 px-2 text-left">Note</th>
                  <th className="py-2 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((r, idx) => {
                  const rowTotal =
                    r.total_salary != null
                      ? toNumber(r.total_salary)
                      : toNumber(r.base_amount) +
                        toNumber(r.allowance) +
                        toNumber(r.bonus);

                  return (
                    <tr
                      key={r.id}
                      className={
                        "border-t " +
                        (idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")
                      }
                    >
                      <td className="py-2 px-2 text-left">
                        {r.staff_name || `Staff #${r.staff}`}
                      </td>
                      <td className="py-2 px-2">{r.salary_month}</td>
                      <td className="py-2 px-2 text-right">
                        {formatMoney(r.base_amount)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {formatMoney(r.allowance)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {formatMoney(r.bonus)}
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">
                        {formatMoney(rowTotal)}
                      </td>
                      <td className="py-2 px-2 text-left font-semibold">
                        {r.payment_mode_name || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2 px-2 text-left font-semibold">
                        {r.bank_name || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2 px-2 text-left max-w-xs truncate">
                        {r.note || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2 px-2 text-center space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(r)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50"
                        >
                          <FaEdit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <FaTrash className="w-3 h-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="border-t bg-slate-900 text-white">
                  <td className="py-2 px-2 font-semibold" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalBasic)}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalAllowance)}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalBonus)}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold">
                    {formatMoney(totalSalary)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight = false }) {
  return (
    <div
      className={
        "rounded-xl px-4 py-3 border text-xs flex flex-col gap-1 " +
        (highlight
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-800 border-slate-200")
      }
    >
      <span
        className={
          "uppercase tracking-wide " +
          (highlight ? "text-slate-300" : "text-slate-500")
        }
      >
        {label}
      </span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  );
}
