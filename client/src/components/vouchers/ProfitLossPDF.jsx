import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { useState, useEffect } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  /* ================= HEADER ================= */
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#3a6791",
    padding: 8,
  },

  headerLogo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },

  headerText: {
    flex: 1,
    textAlign: "center",
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },

  headerSub: {
    fontSize: 9,
    marginTop: 2,
    color: "#ffffff",
  },

  companyYearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  currentYear: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  /* ================= TABLE ================= */
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#c8dafc",
    borderBottomWidth: 1,
    borderBottomColor: "#9cb4d8",
  },

  itemHeader: {
    flex: 1.6,
    paddingVertical: 6,
    paddingLeft: 8,
    fontWeight: "bold",
    color: "#4a6fa5",
  },

  amountHeaderGroup: {
    flex: 2,
    flexDirection: "row",
  },

  amountHeader: {
    flex: 1,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#9cb4d8",
    fontWeight: "bold",
    color: "#4a6fa5",
    textAlign: "center",
  },

  percentHeader: {
    flex: 1,
    paddingVertical: 6,
    fontWeight: "bold",
    color: "#4a6fa5",
    textAlign: "right",
    paddingRight: 8,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#a5bedb",
    borderBottomWidth: 1,
    borderBottomColor: "#6c88af",
    marginTop: 10,
    marginBottom: 4,
  },

  sectionHeaderText: {
    flex: 1,
    padding: 6,
    fontWeight: "bold",
    color: "#252525",
  },

  sectionHeaderSpacer: { flex: 3 },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },

  rowIncomeLight: { backgroundColor: "#f0f7ff" },
  rowExpensesLight: { backgroundColor: "#fffbe6" },

  cellItem: {
    flex: 1.6,
    paddingVertical: 6,
    paddingLeft: 8,
    color: "#252525",
  },

  cellAmount: {
    flex: 1,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
    textAlign: "right",
    color: "#252525",
  },

  cellPercent: {
    flex: 1,
    paddingVertical: 6,
    paddingRight: 8,
    textAlign: "right",
  },

  boldText: { fontWeight: "bold" },
  positivePercent: { color: "#333", fontWeight: "bold" },
  negativePercent: { color: "#cc0000", fontWeight: "bold" },
  greenText: { color: "#008000", fontWeight: "bold" },
});

const ProfitLossPDF = ({ report }) => {
  const year = report.year;

  const [selectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      if (!selectedCategory?.id) return;
      try {
        const res = await AxiosInstance.get(
          `/business-categories/${selectedCategory.id}/`
        );
        setBanner(res.data);
      } catch (e) {
        console.error("Failed to fetch banner:", e);
        setBanner(null);
      }
    };
    fetchBanner();
  }, [selectedCategory?.id]);

  const headerLogo = banner?.banner_logo || joyjatraLogo;
  const headerTitle =
    banner?.banner_title || selectedCategory?.name || "Business Name";

  const address1 = banner?.banner_address1 || "";
  const address2 = banner?.banner_address2 || "";
  const phone = banner?.banner_phone || "";

  const renderRow = (
    label,
    prev,
    curr,
    percent,
    bold = false,
    rowStyle = {},
    isPercentNegative = false,
    isAmountNegative = false
  ) => (
    <View style={[styles.row, rowStyle]} key={label}>
      <Text style={[styles.cellItem, bold && styles.boldText]}>{label}</Text>
      <Text
        style={[
          styles.cellAmount,
          bold && styles.boldText,
          isAmountNegative && styles.greenText,
        ]}
      >
        {prev.toLocaleString()}
      </Text>
      <Text
        style={[
          styles.cellAmount,
          bold && styles.boldText,
          isAmountNegative && styles.greenText,
        ]}
      >
        {curr.toLocaleString()}
      </Text>
      <Text
        style={[
          styles.cellPercent,
          bold && styles.boldText,
          isPercentNegative ? styles.negativePercent : styles.positivePercent,
        ]}
      >
        {percent}%
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}
        <View style={styles.headerWrapper}>
          <Image src={headerLogo} style={styles.headerLogo} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            {address1 !== "" && <Text style={styles.headerSub}>{address1}</Text>}
            {address2 !== "" && <Text style={styles.headerSub}>{address2}</Text>}
            {phone !== "" && (
              <Text style={styles.headerSub}>Mobile: {phone}</Text>
            )}
          </View>
        </View>

        {/* Company & Year */}
        <View style={styles.companyYearRow}>
          <Text style={styles.companyName}>{headerTitle}</Text>
          <Text style={styles.currentYear}>Year: {year}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={styles.itemHeader}>Item</Text>
          <View style={styles.amountHeaderGroup}>
            <Text style={styles.amountHeader}>{year - 1}</Text>
            <Text style={styles.amountHeader}>{year}</Text>
          </View>
          <Text style={styles.percentHeader}>% Compared to Previous Year</Text>
        </View>

        {/* Income */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>INCOME</Text>
          <Text style={styles.sectionHeaderSpacer}></Text>
        </View>

        {report.income.map((row, idx) =>
          renderRow(
            row.item,
            row.previous_year,
            row.current_year,
            row.percent_change,
            false,
            idx % 2 === 0 ? styles.rowIncomeLight : {}
          )
        )}

        {renderRow(
          "Gross Profit",
          report.gross_profit.previous_year,
          report.gross_profit.current_year,
          report.gross_profit.percent_change,
          true,
          styles.rowIncomeLight
        )}

        {/* Expenses */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>EXPENSES</Text>
          <Text style={styles.sectionHeaderSpacer}></Text>
        </View>

        {report.expenses.map((row, idx) =>
          renderRow(
            row.item,
            row.previous_year,
            row.current_year,
            row.percent_change,
            false,
            idx % 2 === 0 ? styles.rowExpensesLight : {}
          )
        )}

        {renderRow(
          "Total Expenses",
          report.total_expenses.previous_year,
          report.total_expenses.current_year,
          report.total_expenses.percent_change,
          true,
          styles.rowExpensesLight
        )}

        {renderRow(
          "Profit / Loss",
          report.net_profit.previous_year,
          report.net_profit.current_year,
          report.net_profit.percent_change,
          true,
          {},
          report.net_profit.percent_change < 0,
          report.net_profit.current_year < 0
        )}
      </Page>
    </Document>
  );
};

export default ProfitLossPDF;
