import { Document, PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";
import AssetsReportPDF from "../../../components/vouchers/AssetsReportPDF";

const AssetsReportPdfPage = () => {
  const [assets, setAssets] = useState([]);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category"));

  useEffect(() => {
    if (!selectedCategory?.id) return;

    AxiosInstance.get("/reports/assets-report/", {
      params: {
        business_category: selectedCategory.id,
      },
    }).then((res) => setAssets(res.data.assets || []));
  }, [selectedCategory?.id]);

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <AssetsReportPDF data={assets} />
      </Document>
    </PDFViewer>
  );
};

export default AssetsReportPdfPage;
