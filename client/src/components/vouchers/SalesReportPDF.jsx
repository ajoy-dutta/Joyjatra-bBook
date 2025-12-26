import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import AxiosInstance from "../../components/AxiosInstance"; // adjust path
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg"; // fallback logo
import { numberToWords } from "./utils.jsx";

Font.register({ family: "Helvetica" });

// ====== CONFIGURABLE SPACING ======
const tableMarginHorizontal = 10; // table left/right margin
const cellPaddingHorizontal = 10;   // cell left/right padding
// ================================

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9, fontFamily: "Helvetica" },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  headerLogo: { width: 60, height: 60, objectFit: "contain" },
  headerText: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  headerTitle: { fontSize: 14, fontWeight: "bold" },
  subTitle: { fontSize: 9, marginTop: 4 },
  tableWrapper: {
    marginHorizontal: tableMarginHorizontal, // left/right table margin
  },
  table: { width: "100%", borderWidth: 1, borderColor: "#ccc" },
  row: { flexDirection: "row" },
  cellHeader: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: cellPaddingHorizontal,
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    textAlign: "center", // center header text
  },
  cell: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: cellPaddingHorizontal,
    textAlign: "center",
  },
  right: { textAlign: "center" }, // numeric columns
  summaryBox: { marginTop: 12, marginLeft: 10, marginRight: 10, padding: 8, borderWidth: 1, borderColor: "#FFFFFF" },
});

export default function SalesReportPDF({ sales, summary, fromDate, toDate }) {
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const fetchBanner = async (categoryId) => {
      if (!categoryId) return setBanner(null);
      try {
        const res = await AxiosInstance.get(`/business-categories/${categoryId}/`);
        setBanner(res.data);
      } catch (e) {
        console.error("Failed to fetch banner:", e);
        setBanner(null);
      }
    };
    fetchBanner(selectedCategory?.id || null);
  }, [selectedCategory?.id]);

  const headerLogo = banner?.banner_logo || joyjatraLogo;
  const headerTitle = banner?.banner_title || selectedCategory?.name || "Business Name";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER with Logo and Centered Title */}
        <View style={styles.headerWrapper}>
          <Image src={headerLogo} style={styles.headerLogo} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.subTitle}>
              From {fromDate || "Beginning"} to {toDate || "Till Date"}
            </Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.tableWrapper}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.row}>
              <Text style={[styles.cellHeader, { width: "15%" }]}>Date</Text>
              <Text style={[styles.cellHeader, { width: "20%" }]}>Invoice</Text>
              <Text style={[styles.cellHeader, { width: "25%" }]}>Customer</Text>
              <Text style={[styles.cellHeader, { width: "13%" }, styles.right]}>Total</Text>
              <Text style={[styles.cellHeader, { width: "13%" }, styles.right]}>Paid</Text>
              <Text style={[styles.cellHeader, { width: "14%" }, styles.right]}>Due</Text>
            </View>

            {/* Table Body */}
            {sales.map((sale) => {
              const paid = sale.payments.reduce((s, p) => s + Number(p.paid_amount), 0);
              return (
                <View style={styles.row} key={sale.id}>
                  <Text style={[styles.cell, { width: "15%" }]}>{sale.sale_date}</Text>
                  <Text style={[styles.cell, { width: "20%" }]}>{sale.invoice_no}</Text>
                  <Text style={[styles.cell, { width: "25%" }]}>{sale.customer?.customer_name}</Text>
                  <Text style={[styles.cell, { width: "13%" }, styles.right]}>
                    {Number(sale.total_amount).toFixed(2)}
                  </Text>
                  <Text style={[styles.cell, { width: "13%" }, styles.right]}>
                    {paid.toFixed(2)}
                  </Text>
                  <Text style={[styles.cell, { width: "14%" }, styles.right]}>
                    {(sale.total_amount - paid).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryBox}>
          <Text>Total Sales: {summary.total_sales_amount?.toFixed(2)}</Text>
          <Text>Total Paid: {summary.total_paid_amount?.toFixed(2)}</Text>
          <Text>Total Due: {summary.total_due_amount?.toFixed(2)}</Text>
          <Text>
            In Words: {numberToWords(Math.round(summary.total_sales_amount || 0))} Taka Only
          </Text>
        </View>
      </Page>
    </Document>
  );
}
