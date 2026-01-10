import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import AxiosInstance from "../../components/AxiosInstance";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

// Font
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: "Roboto", fontSize: 10 },

  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  logo: {
    width: 70,
    height: 70,
    objectFit: "contain",
  },

  headerCenter: {
    flex: 1,
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

  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  tableRow: { flexDirection: "row" },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
  },

  tableCell: { fontSize: 10 },
  totalRow: { backgroundColor: "#f3f3f3", fontWeight: "bold" },
  adjustmentRow: { backgroundColor: "#fffacd", fontWeight: "bold" },
  textRight: { textAlign: "right" },

  colWidths: {
    incomeDate: 60,
    incomeSource: 60,
    incomeDesc: 100,
    incomeAmount: 50,
    expenseDate: 60,
    expenseVoucher: 50,
    expenseDesc: 100,
    expenseAmount: 50,
  },
});

// ================= DOCUMENT =================
export const AccountsPDFDocument = ({
  incomeData,
  expenseData,
  from_date,
  to_date,
}) => {
  const [banner, setBanner] = useState(null);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  useEffect(() => {
    const fetchBanner = async () => {
      if (!selectedCategory?.id) return;
      try {
        const res = await AxiosInstance.get(
          `/business-categories/${selectedCategory.id}/`
        );
        setBanner(res.data);
      } catch (err) {
        console.error("Banner fetch failed:", err);
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

  const maxRows = Math.max(incomeData.length, expenseData.length);

  const incomeTotal = incomeData.reduce(
    (acc, item) => acc + parseFloat(item.total_payable_amount || 0),
    0
  );

  const expenseTotal = expenseData.reduce(
    (acc, item) => acc + parseFloat(item.amount || 0),
    0
  );

  const adjustment = Math.abs(incomeTotal - expenseTotal);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ================= HEADER ================= */}
        <View style={styles.headerWrapper}>
          <Image src={headerLogo} style={styles.logo} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            {banner?.banner_address1 && (
              <Text style={styles.headerSub}>
                {banner.banner_address1}
              </Text>
            )}
            {banner?.banner_address2 && (
              <Text style={styles.headerSub}>
                {banner.banner_address2}
              </Text>
            )}
            {banner?.banner_phone && (
              <Text style={styles.headerSub}>
                Mobile: {banner.banner_phone}
              </Text>
            )}
            <Text style={styles.headerSub}>
              Accounts Report ({from_date || "Beginning"} –{" "}
              {to_date || "Till Date"})
            </Text>
          </View>
          <View style={{ width: 70 }} />
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          {/* HEADER */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text>Income Date</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeSource }]}><Text>Source</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeDesc }]}><Text>Description</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={styles.textRight}>Amount</Text></View>

            <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text>Expense Date</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher }]}><Text>Source</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseDesc }]}><Text>Description</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={styles.textRight}>Amount</Text></View>
          </View>

          {/* ROWS */}
          {[...Array(maxRows)].map((_, index) => {
            const income = incomeData[index];
            const expense = expenseData[index];

            return (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text>{income?.date || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.incomeSource }]}><Text>{income?.income_source || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.incomeDesc }]}><Text>{income?.description || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={styles.textRight}>{income ? Number(income.amount).toFixed(2) : ""}</Text></View>

                <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text>{expense?.date || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher }]}><Text>{expense?.cost_category || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.expenseDesc }]}><Text>{expense?.description || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={styles.textRight}>{expense ? Number(expense.amount).toFixed(2) : ""}</Text></View>
              </View>
            );
          })}

          {/* TOTALS */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text>Total</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeSource + styles.colWidths.incomeDesc }]} />
            <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={styles.textRight}>{incomeTotal.toFixed(2)}</Text></View>

            <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text>Total</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher + styles.colWidths.expenseDesc }]} />
            <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={styles.textRight}>{expenseTotal.toFixed(2)}</Text></View>
          </View>

          {/* ADJUSTMENT */}
          {incomeTotal !== expenseTotal && (
            <View style={[styles.tableRow, styles.adjustmentRow]}>
              <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text>Adjustment</Text></View>
              <View style={[styles.tableCol, { width: styles.colWidths.incomeSource + styles.colWidths.incomeDesc }]} />
              <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={styles.textRight}>{incomeTotal > expenseTotal ? adjustment.toFixed(2) : ""}</Text></View>

              <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text>Adjustment</Text></View>
              <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher + styles.colWidths.expenseDesc }]} />
              <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={styles.textRight}>{expenseTotal > incomeTotal ? adjustment.toFixed(2) : ""}</Text></View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

// ================= DOWNLOAD =================
export const AccountsPDFDownload = ({
  incomeData,
  expenseData,
  filename = "accounts_report.pdf",
}) => (
  <PDFDownloadLink
    document={
      <AccountsPDFDocument
        incomeData={incomeData}
        expenseData={expenseData}
      />
    }
    fileName={filename}
    style={{
      textDecoration: "none",
      padding: "6px 12px",
      color: "#fff",
      backgroundColor: "#1d4ed8",
      borderRadius: 4,
      fontSize: 12,
    }}
  >
    {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
  </PDFDownloadLink>
);
