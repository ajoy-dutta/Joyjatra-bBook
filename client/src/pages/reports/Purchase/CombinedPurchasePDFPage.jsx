import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import AxiosInstance from "../../../components/AxiosInstance";
import CombinedPurchasePDF from "../../../components/vouchers/CombinedPurchasePDF";

export default function CombinedPurchasePDFPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const productName = searchParams.get("product");

  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  useEffect(() => {
    const fetchPDFData = async () => {
      try {
        const res = await AxiosInstance.get("purchase-report/", {
          params: {
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            product_name: productName || undefined,
            business_category: selectedCategory?.id || undefined,
          },
        });
        setData(res.data.purchases || []);
      } catch (e) {
        console.error("Failed to fetch PDF data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPDFData();
  }, [fromDate, toDate, productName, selectedCategory]);

  if (loading) return <div className="p-6">Loading PDF...</div>;

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <div className="bg-gray-700 p-3 flex justify-between items-center">
        <button onClick={() => navigate("/reports/combined-purchase/")} className="text-white text-sm">
          ← Back
        </button>

        <PDFDownloadLink
          document={
            <CombinedPurchasePDF
              data={data}
              fromDate={fromDate}
              toDate={toDate}
              productName={productName}
            />
          }
          fileName="combined_purchase_report.pdf"
          className="bg-white px-3 py-1 rounded text-sm"
        >
          Download PDF
        </PDFDownloadLink>
      </div>

      {/* PDF VIEW */}
      <div style={{ flex: 1 }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <CombinedPurchasePDF
            data={data}
            fromDate={fromDate}
            toDate={toDate}
            productName={productName}
          />
        </PDFViewer>
      </div>
    </div>
  );
}
