import React, { useEffect, useState } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { useSearchParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../../components/AxiosInstance";
import CombinedExpensePDF from "../../../components/vouchers/CombinedExpensePDF";

export default function CombinedExpensePdfPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";
  const categoryName = searchParams.get("costCategory") || "";

  // Fetch business category from localStorage
  const selectedCategory = JSON.parse(localStorage.getItem("business_category")) || null;
  const businessCategoryId = selectedCategory?.id || null;


  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, categoryName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate }),
        ...(categoryName && { cost_category: categoryName }),
        ...(businessCategoryId && { business_category: businessCategoryId }),
      };

      const res = await AxiosInstance.get("expense-report/", { params });
      setData(res.data || []);
    } catch (err) {
      console.error("Error fetching expense data:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <div className="bg-gray-700 p-3 flex justify-between items-center">
        <button
          onClick={() => navigate("/reports/expense-report/")}
          className="text-white text-sm"
        >
          ← Back
        </button>

        <PDFDownloadLink
          document={
            <CombinedExpensePDF
              data={data}
              fromDate={fromDate}
              toDate={toDate}
              categoryName={categoryName}
            />
          }
          fileName="combined_expense_report.pdf"
          className="bg-white px-3 py-1 rounded text-sm hover:bg-gray-200"
        >
          {({ loading: pdfLoading }) =>
            pdfLoading ? "Preparing PDF..." : "Download PDF"
          }
        </PDFDownloadLink>
      </div>

      {/* PDF VIEW */}
      <div className="flex-1">
        {loading ? (
          <p className="text-center mt-4">Loading PDF...</p>
        ) : (
          <PDFViewer style={{ width: "100%", height: "100%" }}>
            <CombinedExpensePDF
              data={data}
              fromDate={fromDate}
              toDate={toDate}
              categoryName={categoryName}
            />
          </PDFViewer>
        )}
      </div>
    </div>
  );
}
