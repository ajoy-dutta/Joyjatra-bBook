import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import AxiosInstance from "../../components/AxiosInstance";
import SaleInvoicePDF from "../../components/vouchers/SaleInvoicePDF";


export default function SaleInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchAll = async () => {
      try {
        /* ===== Fetch Sale ===== */
        const saleRes = await AxiosInstance.get(`/sales/${id}/`);
        const saleData = saleRes.data;
        setSale(saleData);

      } catch (err) {
        console.error("Failed to load sale invoice", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) return <p className="p-6">Loading invoice...</p>;
  if (!sale) return <p className="p-6">Invoice not found</p>;

  return (
    <div className="h-screen flex flex-col">
      {/* ===== Header ===== */}
      <div className="bg-white shadow p-3 flex justify-between items-center">
        <h2 className="font-semibold">
          Sale Invoice #{sale.invoice_no}
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* ===== PDF Viewer ===== */}
      <div style={{ height: "calc(100vh - 56px)" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <SaleInvoicePDF
            sale={sale}
          />
        </PDFViewer>
      </div>
    </div>
  );
}
