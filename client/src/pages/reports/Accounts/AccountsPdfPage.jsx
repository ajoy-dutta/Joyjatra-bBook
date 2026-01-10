import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AxiosInstance from "../../../components/AxiosInstance";
import { useSearchParams } from "react-router-dom";
import { AccountsPDFDocument } from "../../../components/vouchers/AccountsPDF"; // import PDF document
import { useNavigate } from "react-router-dom";

const AccountsPdfPage = () => {
  const [searchParams] = useSearchParams();
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fromDate = searchParams.get("from_date") || "";
  const toDate = searchParams.get("to_date") || "";
  const categoryId = searchParams.get("category") || null;

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        ...(categoryId && { business_category: categoryId }),
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate }),
      };

      const [incomeRes, expenseRes] = await Promise.all([
        AxiosInstance.get("/income-report/", { params }),
        AxiosInstance.get("/expense-report/", { params }),
      ]);

      setIncomeData(Array.isArray(incomeRes.data) ? incomeRes.data : []);
      setExpenseData(Array.isArray(expenseRes.data) ? expenseRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading Accounts PDF...</p>;

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="bg-gray-600 shadow p-3 flex justify-between items-center">
        <h4 className="text-white">Accounts Report PDF</h4>
        <button
          onClick={() => navigate("/reports/accounts")}
          className="text-sm text-white hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* PDF Viewer */}
      <div style={{ height: "calc(100vh - 56px)" }}>
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <AccountsPDFDocument incomeData={incomeData} expenseData={expenseData} from_date={fromDate} to_date={toDate} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default AccountsPdfPage;
