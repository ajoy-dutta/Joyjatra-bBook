import { useEffect, useRef, useState, useMemo } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import AxiosInstance from "../../components/AxiosInstance";

export default function PaymentModal({
  sale,
  onClose,
  fetchSales,
  safeNumber,
  customSelectStyles,
}) {
  const payModalRef = useRef(null);

  const [paymentData, setPaymentData] = useState({
    paymentMode: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    paidAmount: "",
  });

  const [paymentModes, setPaymentModes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);

  const [isBank, setIsBank] = useState(false);
  const [isCheque, setIsCheque] = useState(false);

  // ================= CALCULATIONS =================
  const totalPaid = useMemo(() => {
    return (
      sale?.payments?.reduce((acc, p) => acc + safeNumber(p.paid_amount), 0) ||
      0
    );
  }, [sale]);

  const due = useMemo(() => {
    return safeNumber(sale?.total_payable_amount) - totalPaid;
  }, [sale, totalPaid]);

  // ================= OPEN MODAL =================
  useEffect(() => {
    if (sale && payModalRef.current) {
      setPaymentData({
        paymentMode: "",
        bankName: "",
        accountNo: "",
        chequeNo: "",
        paidAmount: due > 0 ? due.toFixed(2) : "",
      });
      setIsBank(false);
      setIsCheque(false);
      setEditingPayment(null);

      payModalRef.current.showModal();
    }
  }, [sale, due]);

  // ================= FETCH PAYMENT MODES & BANKS =================
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [pmRes, bankRes] = await Promise.all([
          AxiosInstance.get("payment-mode/"),
          AxiosInstance.get("banks/"),
        ]);
        setPaymentModes(
          pmRes.data.map((pm) => ({ value: pm.id, label: pm.name }))
        );
        setBanks(bankRes.data.map((b) => ({ value: b.id, label: b.name })));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payment data");
      }
    };
    fetchPaymentData();
  }, []);

  // ================= HELPERS =================
  const getBankName = (bankId) => {
    if (!bankId) return "N/A";
    const opt = banks.find((b) => b.value === Number(bankId));
    return opt?.label || "N/A";
  };

  const getPaymentModeName = (modeId) => {
    if (!modeId) return "N/A";
    const opt = paymentModes.find((m) => m.value === Number(modeId));
    return opt?.label || "N/A";
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));

    if (field === "paymentMode") {
      const selected = paymentModes.find((m) => m.value === value);
      const label = selected?.label?.toLowerCase() || "";
      setIsBank(label === "bank");
      setIsCheque(label === "cheque");

      if (label !== "bank") setPaymentData((p) => ({ ...p, bankName: "", accountNo: "" }));
      if (label !== "cheque") setPaymentData((p) => ({ ...p, chequeNo: "" }));
    }
  };

  const resetForm = () => {
    setPaymentData({
      paymentMode: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      paidAmount: "",
    });
    setIsBank(false);
    setIsCheque(false);
    setEditingPayment(null);
  };

  // ================= PAYLOAD =================
  const buildPayload = () => {
    if (!sale) return null;
    const paid = safeNumber(paymentData.paidAmount);
    if (!paid || paid <= 0) {
      toast.error("Enter a valid paid amount.");
      return null;
    }
    if (paid > due) {
      toast.error("Paid amount cannot be greater than due.");
      return null;
    }

    return {
      sale_id: sale.id,
      payment_mode: paymentData.paymentMode || null,
      bank: paymentData.bankName || null,
      account_no: paymentData.accountNo || "",
      cheque_no: paymentData.chequeNo || "",
      paid_amount: paid.toFixed(2),
      remarks: "",
    };
  };

  const handleSavePayment = async () => {
    const payload = buildPayload();
    if (!payload) return;

    console.log("payload", payload);

    try {
      await AxiosInstance.post("/sale-payments/", payload);
      toast.success("Payment saved successfully.");
      await fetchSales();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment.");
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    const payload = buildPayload();
    if (!payload) return;
    try {
      await AxiosInstance.put(`/sale-payments/${editingPayment}/`, payload);
      toast.success("Payment updated successfully.");
      await fetchSales();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment.");
    }
  };

  const handleEditClick = (payment) => {
    setPaymentData({
      paymentMode: payment.payment_mode || "",
      bankName: payment.bank || "",
      accountNo: payment.account_no || "",
      chequeNo: payment.cheque_no || "",
      paidAmount: String(payment.paid_amount || ""),
    });

    const mode = paymentModes.find((m) => m.value === payment.payment_mode);
    const label = mode?.label?.toLowerCase() || "";
    setIsBank(label === "bank");
    setIsCheque(label === "cheque");

    setEditingPayment(payment.id);
  };

  const closeModal = () => {
    payModalRef.current?.close();
    resetForm();
    onClose();
  };

  if (!sale) return null;

  // ================= RETURN JSX =================
  return (
    <dialog
      ref={payModalRef}
      className="fixed inset-0 z-50 ml-80 flex items-center justify-center bg-black/40"
    >
      <div className="relative w-full max-w-6xl rounded-xl bg-white shadow-2xl">
        {/* CLOSE */}
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
        >
          Close
        </button>

        {/* HEADER */}
        <div className="border-b px-6 py-2">
          <h3 className="text-lg font-semibold text-slate-800">
            Payment for Invoice #{sale.invoice_no}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Customer: {sale.customer?.customer_name || "N/A"}
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 bg-slate-50 px-6 py-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-slate-500">Total Payable</p>
            <p className="font-semibold text-slate-800">
              {safeNumber(sale.total_payable_amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Total Paid</p>
            <p className="font-semibold text-green-600">
              {safeNumber(totalPaid).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Due Amount</p>
            <p className="font-semibold text-red-600">{safeNumber(due).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-500">Invoice Date</p>
            <p className="font-semibold text-slate-800">{sale.sale_date || "N/A"}</p>
          </div>
        </div>

        {/* FORM */}
        <div className="border-b bg-white px-6 py-3">
          <h4 className="mb-4 text-sm font-semibold text-slate-700">
            Add / Update Payment
          </h4>

          <div className="grid gap-3 md:grid-cols-5">
            {/* Payment Mode */}
            <Select
              options={paymentModes}
              value={paymentModes.find((pm) => pm.value === Number(paymentData.paymentMode)) || null}
              onChange={(selected) =>
                handlePaymentChange("paymentMode", selected ? selected.value : "")
              }
              placeholder="Payment Mode"
              styles={customSelectStyles}
            />

            {/* Bank */}
            <Select
              options={banks}
              value={banks.find((b) => b.value === Number(paymentData.bankName)) || null}
              onChange={(selected) =>
                handlePaymentChange("bankName", selected ? selected.value : "")
              }
              placeholder="Bank"
              styles={customSelectStyles}
              isDisabled={!isBank}
            />

            <input
              value={paymentData.accountNo}
              onChange={(e) => handlePaymentChange("accountNo", e.target.value)}
              disabled={!isBank}
              placeholder="Account No"
              className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />

            <input
              value={paymentData.chequeNo}
              onChange={(e) => handlePaymentChange("chequeNo", e.target.value)}
              disabled={!isCheque}
              placeholder="Cheque No"
              className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />

            <input
              type="number"
              value={paymentData.paidAmount}
              onChange={(e) => handlePaymentChange("paidAmount", e.target.value)}
              placeholder="Paid Amount"
              className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-5 flex justify-center gap-4">
            {editingPayment ? (
              <button
                onClick={handleUpdatePayment}
                className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Update Payment
              </button>
            ) : (
              <button
                onClick={handleSavePayment}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Payment
              </button>
            )}
          </div>
        </div>

        {/* PAYMENTS TABLE */}
        <div className="max-h-[300px] overflow-auto px-6 py-3">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-800 text-white">
              <tr>
                {["SL","Due Date","Mode","Bank","Account","Cheque","Amount","Date","Due Invoice","Edit"].map(h=>(
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sale.payments?.length ? sale.payments.map((p,i)=>(
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{i+1}</td>
                  <td className="px-3 py-2">{p.due_date || "N/A"}</td>
                  <td className="px-3 py-2">{getPaymentModeName(p.payment_mode)}</td>
                  <td className="px-3 py-2">{getBankName(p.bank)}</td>
                  <td className="px-3 py-2">{p.account_no || "—"}</td>
                  <td className="px-3 py-2">{p.cheque_no || "—"}</td>
                  <td className="px-3 py-2 font-medium">{safeNumber(p.paid_amount).toFixed(2)}</td>
                  <td className="px-3 py-2">{p.payment_date?.slice(0,10) || "N/A"}</td>
                  <td className="px-3 py-2">{p.due_invoice || "—"}</td>
                  <td className="px-3 py-2">
                    <button onClick={()=>handleEditClick(p)} className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              )):(
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-500">No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </dialog>
  );
}
