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
import AxiosInstance from "../../components/AxiosInstance";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";
import { numberToWords } from "./utils.jsx";

Font.register({ family: "Helvetica" });

// ====== CONFIG ======
const tableMarginHorizontal = 10;
const cellPaddingHorizontal = 10;
// ====================

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  /* ================= HEADER ================= */
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },

  headerLogo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },

  headerText: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },

  headerSub: {
    fontSize: 9,
    marginTop: 2,
  },

  /* ================= TABLE ================= */
  tableWrapper: {
    marginHorizontal: tableMarginHorizontal,
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  row: {
    flexDirection: "row",
  },

  cellHeader: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: cellPaddingHorizontal,
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    textAlign: "center",
  },

  cell: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: cellPaddingHorizontal,
    textAlign: "center",
  },

  right: {
    textAlign: "center",
  },

  /* ================= SUMMARY (LIKE COMBINED PURCHASE) ================= */
  summaryBox: {
    width: "95%",
    marginHorizontal: "auto",
    marginTop: 12,
  },

  summaryRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },

  summaryKey: {
    width: "25%",
    fontWeight: "bold",
  },

  summaryColon: {
    width: "3%",
    textAlign: "center",
  },

  summaryValue: {
    width: "72%",
  },
});

export default function SalesReportPDF({
  sales = [],
  summary = {},
  fromDate,
  toDate,
}) {
  const [banner, setBanner] = useState(null);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  /* ===== FETCH BANNER ===== */
  useEffect(() => {
    const fetchBanner = async () => {
      if (!selectedCategory?.id) return;
      try {
        const res = await AxiosInstance.get(
          `/business-categories/${selectedCategory.id}/`
        );
        setBanner(res.data);
      } catch {
        setBanner(null);
      }
    };
    fetchBanner();
  }, [selectedCategory?.id]);

  const headerLogo =
    banner?.banner_logo
      ? banner.banner_logo.startsWith("http")
        ? banner.banner_logo
        : `${import.meta.env.VITE_API_BASE_URL}${banner.banner_logo}`
      : joyjatraLogo;

  const headerTitle =
    banner?.banner_title ||
    selectedCategory?.name ||
    "Business Name";

  const address1 = banner?.banner_address1 || "";
  const address2 = banner?.banner_address2 || "";
  const phone = banner?.banner_phone || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}
        <View style={styles.headerWrapper}>
          <Image src={headerLogo} style={styles.headerLogo} />

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>

            {address1 && <Text style={styles.headerSub}>{address1}</Text>}
            {address2 && <Text style={styles.headerSub}>{address2}</Text>}
            {phone && <Text style={styles.headerSub}>Phone: {phone}</Text>}

            <Text style={styles.headerSub}>
              From {fromDate || "Beginning"} to {toDate || "Till Date"}
            </Text>
          </View>
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.tableWrapper}>
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={[styles.cellHeader, { width: "15%" }]}>Date</Text>
              <Text style={[styles.cellHeader, { width: "20%" }]}>Invoice</Text>
              <Text style={[styles.cellHeader, { width: "25%" }]}>Customer</Text>
              <Text style={[styles.cellHeader, { width: "13%" }, styles.right]}>
                Total
              </Text>
              <Text style={[styles.cellHeader, { width: "13%" }, styles.right]}>
                Paid
              </Text>
              <Text style={[styles.cellHeader, { width: "14%" }, styles.right]}>
                Due
              </Text>
            </View>

            {sales.map((sale) => {
              const paid = sale.payments.reduce(
                (s, p) => s + Number(p.paid_amount),
                0
              );

              return (
                <View style={styles.row} key={sale.id}>
                  <Text style={[styles.cell, { width: "15%" }]}>
                    {sale.sale_date}
                  </Text>
                  <Text style={[styles.cell, { width: "20%" }]}>
                    {sale.invoice_no}
                  </Text>
                  <Text style={[styles.cell, { width: "25%" }]}>
                    {sale.customer?.customer_name}
                  </Text>
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

        {/* ================= SUMMARY ================= */}
        <View style={styles.summaryBox}>
          {[
            {
              key: "Total Sales",
              value: summary.total_sales_amount?.toFixed(2) || "0.00",
            },
            {
              key: "Total Paid",
              value: summary.total_paid_amount?.toFixed(2) || "0.00",
            },
            {
              key: "Total Due",
              value: summary.total_due_amount?.toFixed(2) || "0.00",
            },
            {
              key: "In Words",
              value: `${numberToWords(
                Math.round(summary.total_sales_amount || 0)
              )} Taka Only`,
            },
          ].map((item, idx) => (
            <View style={styles.summaryRow} key={idx}>
              <Text style={styles.summaryKey}>{item.key}</Text>
              <Text style={styles.summaryColon}>:</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
