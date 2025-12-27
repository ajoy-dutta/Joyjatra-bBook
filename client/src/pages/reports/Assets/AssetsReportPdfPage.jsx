import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AxiosInstance from "../../../components/AxiosInstance";
import AssetsReportPDF from "../../../components/vouchers/AssetsReportPDF";

export default function AssetsReportPdfPage() {
  const [assets, setAssets] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      if (!selectedCategory?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /* ✅ FIX 1: USE EXISTING ASSETS API */
        const assetsRes = await AxiosInstance.get("/assets/", {
          params: { business_category: selectedCategory.id },
        });

        const normalize = (raw) =>
          Array.isArray(raw) ? raw : raw?.results || [];

        setAssets(normalize(assetsRes.data));

        /* ✅ FETCH BANNER */
        const bannerRes = await AxiosInstance.get(
          `/business-categories/${selectedCategory.id}/`
        );
        setBanner(bannerRes.data);
      } catch (e) {
        console.error("Failed to load assets report:", e);
        setError("Failed to load assets report.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory?.id]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Loading Assets Report PDF…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!assets.length) {
    return (
      <div className="p-4 text-sm text-slate-500">
        No assets found.
      </div>
    );
  }

  /* ================= PDF VIEW ================= */
  return (
    <div style={{ height: "100vh" }}>
      <PDFViewer width="100%" height="100%">
        <AssetsReportPDF
          assets={assets}
          banner={banner}
          fromDate="Beginning"
          toDate="Till Date"
        />
      </PDFViewer>
    </div>
  );
}
