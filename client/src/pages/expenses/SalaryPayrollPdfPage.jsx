import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import AxiosInstance from "../../components/AxiosInstance";
import SalaryPayrollPDF from "../../components/vouchers/SalaryPayrollPDF";

// Helper function to convert to number
const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};

export default function SalaryPayrollPdfPage() {
  const [params] = useSearchParams();
  const month = params.get("month") || "";
  const staff = params.get("staff") || "";
  const [items, setItems] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  const business = JSON.parse(localStorage.getItem("business_category")) || null;

  // Apply the same filtering logic as in SalaryExpense.jsx
  const filteredItems = useMemo(
    () =>
      items.filter((r) => {
        if (staff && String(r.staff) !== String(staff)) {
          return false;
        }
        if (month && r.salary_month !== month) {
          return false;
        }
        return true;
      }),
    [items, staff, month]
  );

  // Calculate totals for filtered items
  const totals = useMemo(() => {
    const totalBasic = filteredItems.reduce((sum, r) => sum + toNumber(r.base_amount), 0);
    const totalAllowance = filteredItems.reduce((sum, r) => sum + toNumber(r.allowance), 0);
    const totalBonus = filteredItems.reduce((sum, r) => sum + toNumber(r.bonus), 0);
    const totalSalary = filteredItems.reduce((sum, r) => {
      if (r.total_salary != null) {
        return sum + toNumber(r.total_salary);
      }
      return sum + toNumber(r.base_amount) + toNumber(r.allowance) + toNumber(r.bonus);
    }, 0);

    return {
      totalBasic,
      totalAllowance,
      totalBonus,
      totalSalary
    };
  }, [filteredItems]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load salary expenses
        const paramsObj = {};
        if (business?.id) {
          paramsObj.business_category = business.id;
        }
        
        const res = await AxiosInstance.get("salary-expenses/", { params: paramsObj });
        setItems(res.data || []);
        
        // Load banner
        if (business?.id) {
          const bannerRes = await AxiosInstance.get(`/business-categories/${business.id}/`);
          setBanner(bannerRes.data);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [business?.id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading payroll data...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg">
            Salary Payroll Sheet
          </h2>
          <p className="text-sm text-gray-600">
            {month ? `Month: ${month}` : "All months"} | 
            {staff ? ` Staff: ${staff}` : " All staff"} | 
            Records: {filteredItems.length}
          </p>
        </div>
        <a 
          href="/expenses/salary" 
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Salary Expenses
        </a>
      </div>
      
      <div className="flex-1">
        <PDFViewer width="100%" height="100%">
          <SalaryPayrollPDF 
            banner={banner} 
            items={filteredItems} 
            month={month}
            staff={staff}
            totals={totals}
          />
        </PDFViewer>
      </div>
    </div>
  );
}