import React, { useEffect, useState } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { useSearchParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../../components/AxiosInstance";
import CombinedExpensePDF from "../../../components/vouchers/CombinedExpensePDF";



export default function CombinedExpensePdfPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const category = searchParams.get("category");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await AxiosInstance.get("expense-report/", {
      params: {
        from_date: fromDate,
        to_date: toDate,
        cost_category: category
      }
    });
    setData(res.data);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <div className="bg-gray-700 p-3 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
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
              categoryName={category}
            />
          }
          fileName="combined_expense_report.pdf"
          className="bg-white px-3 py-1 rounded text-sm"
        >
          Download PDF
        </PDFDownloadLink>
      </div>

      {/* PDF VIEW */}
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <CombinedExpensePDF
          data={data}
          fromDate={fromDate}
          toDate={toDate}
          categoryName={category}
        />
      </PDFViewer>
    </div>
  );
}
