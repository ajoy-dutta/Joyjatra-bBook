import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import AxiosInstance from "../../../components/AxiosInstance";
import JournalVoucherPDF from "../../../components/vouchers/JournalVoucherPDF";



export default function JournalVoucherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await AxiosInstance.get(`manual-journals/${id}/`);
        console.log("Journals", res.data)
        setJournal(res.data);
      } catch (err) {
        console.error("Failed to load journal", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  if (loading) return <p className="p-6">Loading voucher...</p>;
  if (!journal) return <p className="p-6">Voucher not found</p>;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow p-3 flex justify-between items-center">
        <h2 className="font-semibold">
          Journal Voucher #{journal.id}
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
      </div>

        {/* PDF */}
        <div style={{ height: "calc(100vh - 56px)" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
            <JournalVoucherPDF journal={journal} />
        </PDFViewer>
        </div>

    </div>
  );
}