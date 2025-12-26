import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import AxiosInstance from "../../../components/AxiosInstance";
import SalesReportPDF from "../../../components/vouchers/SalesReportPDF";



export default function SalesReportPDFPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosInstance.get("/sale-report/", {
          params: {
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
          },
        });

        setSales(res.data.sales);
        setSummary(res.data.summary);
      } catch (err) {
        console.error("Failed to load sales PDF data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate]);

  if (loading) {
    return <div className="p-6">Loading PDF...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <div className="bg-gray-700 p-3 flex justify-between items-center">
        <button
          onClick={() => navigate("/reports/sales-report/")}
          className="text-white text-sm"
        >
          ← Back
        </button>

        <PDFDownloadLink
          document={
            <SalesReportPDF
              sales={sales}
              summary={summary}
              fromDate={fromDate}
              toDate={toDate}
            />
          }
          fileName="sales_report.pdf"
          className="bg-white px-3 py-1 rounded text-sm"
        >
          {({ loading }) =>
            loading ? "Preparing PDF..." : "Download PDF"
          }
        </PDFDownloadLink>
      </div>

      {/* PDF VIEW */}
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <SalesReportPDF
          sales={sales}
          summary={summary}
          fromDate={fromDate}
          toDate={toDate}
        />
      </PDFViewer>
    </div>
  );
}
