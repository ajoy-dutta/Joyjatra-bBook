import { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";

export default function BalanceSheetReport() {
  const [report, setReport] = useState(null);
  const [asOn, setAsOn] = useState(
    new Date().toISOString().split("T")[0]
  );

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  useEffect(() => {
    if (!selectedCategory?.id) return;
    fetchReport();
  }, [asOn, selectedCategory?.id]);

  const fetchReport = async () => {
    const res = await AxiosInstance.get("balance-sheet/", {
      params: {
        business_category: selectedCategory.id,
        as_on: asOn,
      },
    });
    setReport(res.data);
  };

  if (!report)
    return <p className="p-4 text-sm">Loading balance sheet...</p>;

  const {
    assets,
    liabilities,
    equity,
    summary,
  } = report;

  const balanced =
    Number(summary.total_assets.toFixed(2)) ===
    Number(summary.liabilities_plus_equity.toFixed(2));

  return (
    <div className="p-6 space-y-4">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow border p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Balance Sheet</h2>
          <p className="text-xs text-slate-500">
            As on {asOn}
          </p>
        </div>

        <input
          type="date"
          value={asOn}
          onChange={(e) => setAsOn(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left w-1/2">Particulars</th>
              <th className="px-4 py-3 text-right w-1/2">Amount</th>
            </tr>
          </thead>

          <tbody>

            {/* ASSETS */}
            <Section title="ASSETS" />
            {assets.map((acc) => (
              <Row
                key={acc.code}
                label={`${acc.code} - ${acc.name}`}
                value={acc.balance}
              />
            ))}
            <TotalRow
              label="Total Assets"
              value={summary.total_assets}
            />

            {/* LIABILITIES */}
            <Section title="LIABILITIES" />
            {liabilities.map((acc) => (
              <Row
                key={acc.code}
                label={`${acc.code} - ${acc.name}`}
                value={Math.abs(acc.balance)}
              />
            ))}
            <TotalRow
              label="Total Liabilities"
              value={Math.abs(summary.total_liabilities)}
            />

            {/* EQUITY */}
            <Section title="EQUITY" />
            {equity.map((acc) => (
              <Row
                key={acc.code}
                label={`${acc.code} - ${acc.name}`}
                value={Math.abs(acc.balance)}
              />
            ))}
            <TotalRow
              label="Total Equity"
              value={Math.abs(summary.total_equity)}
            />

            {/* BALANCE CHECK */}
            <tr className={`font-bold ${
              balanced ? "bg-green-50" : "bg-red-50"
            }`}>
              <td className="px-4 py-3">
                Assets = Liabilities + Equity
              </td>
              <td className="px-4 py-3 text-right">
                {balanced ? "✔ Balanced" : "❌ Not Balanced"}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Section({ title }) {
  return (
    <tr className="bg-gray-600 text-white font-semibold">
      <td colSpan="2" className="px-4 py-2">
        {title}
      </td>
    </tr>
  );
}

function Row({ label, value }) {
  return (
    <tr className="border-t">
      <td className="px-4 py-2">{label}</td>
      <td className="px-4 py-2 text-right">
        {Number(value).toFixed(2)}
      </td>
    </tr>
  );
}

function TotalRow({ label, value }) {
  return (
    <tr className="bg-slate-50 font-semibold border-t">
      <td className="px-4 py-2">{label}</td>
      <td className="px-4 py-2 text-right">
        {Number(value).toFixed(2)}
      </td>
    </tr>
  );
}
