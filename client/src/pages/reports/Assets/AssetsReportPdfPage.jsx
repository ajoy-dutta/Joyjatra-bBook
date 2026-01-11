import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AssetsReportPDF from "../../../components/vouchers/AssetsReportPDF";
import { useNavigate, useLocation } from "react-router-dom";

export default function AssetsReportPdfPage() {

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Receive everything from AssetsReport
  const {
    assets = [],
    banner = null,
    fromDate = "Beginning",
    toDate = "Till Date",
    productName = "",
  } = location.state || {};

  /* ================= SAFETY CHECK ================= */
  if (!assets.length) {
    return (
      <div className="p-4 text-sm text-slate-500">
        No asset data found. Please go back and generate the report again.
        <div>
          <button
            onClick={() => navigate("/reports/assets/")}
            className="mt-2 text-blue-600 underline"
          >
            ← Back to Assets Report
          </button>
        </div>
      </div>
    );
  }

  /* ================= PDF VIEW ================= */
  return (
    <div className="h-screen flex flex-col">

      {/* HEADER */}
      <div className="bg-gray-600 shadow p-3 flex justify-between items-center">
        <h4 className="text-white">Assets Report PDF</h4>
        <button
          onClick={() => navigate("/reports/assets/")}
          className="text-sm text-white hover:underline"
        >
          ← Back
        </button>
      </div>

      <div style={{ height: "100vh" }}>
        <PDFViewer width="100%" height="100%">
          <AssetsReportPDF
            assets={assets}
            banner={banner}
            fromDate={fromDate || "Beginning"}
            toDate={toDate || "Till Date"}
            productName={productName}
          />
        </PDFViewer>
      </div>
    </div>
  );
}
