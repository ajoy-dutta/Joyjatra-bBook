import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AxiosInstance from "../../../components/AxiosInstance";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProfitLossPDF from "../../../components/vouchers/ProfitLossPDF";

const ProfitLossPdfPage = () => {
  const [searchParams] = useSearchParams();
  const year = searchParams.get("year") || new Date().getFullYear();
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  // =============================
  // BUSINESS CATEGORY FROM LOCALSTORAGE
  // =============================
  const selectedBusiness = JSON.parse(localStorage.getItem("business_category")) || null;
  const businessCategoryId = selectedBusiness?.id || null;

  useEffect(() => {
    fetchReport();
  }, [year]);

  const fetchReport = async () => {
    try {
      const params = {
        year,
        ...(businessCategoryId && { business_category: businessCategoryId }),
      };

      const res = await AxiosInstance.get("profit-loss/", { params });
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching Profit & Loss report:", err);
      setReport(null);
    }
  };

  if (!report) return <p>Loading Profit & Loss PDF...</p>;

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="bg-gray-600 shadow p-3 flex justify-between items-center">
        <h4 className="text-white">Profit & Loss PDF</h4>
        <button
          onClick={() => navigate("/reports/profit-loss")}
          className="text-sm text-white hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* PDF */}
      <div style={{ height: "calc(100vh - 56px)" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <ProfitLossPDF report={report} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default ProfitLossPdfPage;
