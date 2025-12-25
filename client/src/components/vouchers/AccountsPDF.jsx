import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  PDFDownloadLink
} from "@react-pdf/renderer";

// Font
Font.register({
  family: "Roboto",
  fonts: [{ src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" }]
});

// Styles
const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: "Roboto", fontSize: 10 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#ccc" },
  tableRow: { flexDirection: "row" },
  tableCol: { borderStyle: "solid", borderWidth: 1, borderColor: "#ccc", padding: 4 },
  tableCell: { fontSize: 10 },
  headerText: { fontSize: 14, marginBottom: 10, fontWeight: "bold" },
  totalRow: { backgroundColor: "#f3f3f3", fontWeight: "bold" },
  adjustmentRow: { backgroundColor: "#fffacd", fontWeight: "bold" },
  textRight: { textAlign: "right" },
  // Define widths for each column
  colWidths: {
    incomeDate: 60,
    incomeSource: 60,
    incomeDesc: 100,
    incomeAmount: 50,
    expenseDate: 60,
    expenseVoucher: 50,
    expenseDesc: 100,
    expenseAmount: 50
  }
});

// Document Component
export const AccountsPDFDocument = ({ incomeData, expenseData, from_date, to_date }) => {
  const maxRows = Math.max(incomeData.length, expenseData.length);

  const incomeTotal = incomeData.reduce((acc, item) => acc + parseFloat(item.total_payable_amount || 0), 0);
  const expenseTotal = expenseData.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
  const adjustment = Math.abs(incomeTotal - expenseTotal);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerText}>Accounts Report</Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text style={styles.tableCell}>Income Date</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeSource }]}><Text style={styles.tableCell}>Source</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeDesc }]}><Text style={styles.tableCell}>Description</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={[styles.tableCell, styles.textRight]}>Amount</Text></View>

            <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text style={styles.tableCell}>Expense Date</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher }]}><Text style={styles.tableCell}>Voucher</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseDesc }]}><Text style={styles.tableCell}>Source / Description</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={[styles.tableCell, styles.textRight]}>Amount</Text></View>
          </View>

          {/* Rows */}
          {[...Array(maxRows)].map((_, index) => {
            const income = incomeData[index];
            const expense = expenseData[index];

            return (
              <View key={index} style={styles.tableRow}>
                {/* Income */}
                <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text style={styles.tableCell}>{income?.sale_date || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.incomeSource }]}><Text style={styles.tableCell}>Product Sale</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.incomeDesc }]}><Text style={styles.tableCell}>{income?.customer?.customer_name || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={[styles.tableCell, styles.textRight]}>{income ? parseFloat(income.total_payable_amount).toFixed(2) : ""}</Text></View>

                {/* Expense */}
                <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text style={styles.tableCell}>{expense?.date || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher }]}><Text style={styles.tableCell}>{expense?.voucher_no || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.expenseDesc }]}><Text style={styles.tableCell}>{expense?.cost_category || expense?.description || ""}</Text></View>
                <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={[styles.tableCell, styles.textRight]}>{expense ? parseFloat(expense.amount).toFixed(2) : ""}</Text></View>
              </View>
            );
          })}

          {/* Totals */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text>Total</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeSource + styles.colWidths.incomeDesc }]}></View>
            <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={styles.textRight}>{incomeTotal.toFixed(2)}</Text></View>

            <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text>Total</Text></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher + styles.colWidths.expenseDesc }]}></View>
            <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={styles.textRight}>{expenseTotal.toFixed(2)}</Text></View>
          </View>

          {/* Adjustment */}
          {incomeTotal !== expenseTotal && (
            <View style={[styles.tableRow, styles.adjustmentRow]}>
              <View style={[styles.tableCol, { width: styles.colWidths.incomeDate }]}><Text>Adjustment</Text></View>
              <View style={[styles.tableCol, { width: styles.colWidths.incomeSource + styles.colWidths.incomeDesc }]}></View>
              <View style={[styles.tableCol, { width: styles.colWidths.incomeAmount }]}><Text style={styles.textRight}>{incomeTotal > expenseTotal ? adjustment.toFixed(2) : ""}</Text></View>

              <View style={[styles.tableCol, { width: styles.colWidths.expenseDate }]}><Text>Adjustment</Text></View>
              <View style={[styles.tableCol, { width: styles.colWidths.expenseVoucher + styles.colWidths.expenseDesc }]}></View>
              <View style={[styles.tableCol, { width: styles.colWidths.expenseAmount }]}><Text style={styles.textRight}>{expenseTotal > incomeTotal ? adjustment.toFixed(2) : ""}</Text></View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

// PDF Download Component
export const AccountsPDFDownload = ({ incomeData, expenseData, filename = "accounts_report.pdf" }) => (
  <PDFDownloadLink
    document={<AccountsPDFDocument incomeData={incomeData} expenseData={expenseData} />}
    fileName={filename}
    style={{
      textDecoration: "none",
      padding: "6px 12px",
      color: "#fff",
      backgroundColor: "#1d4ed8",
      borderRadius: 4,
      fontSize: 12
    }}
  >
    {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
  </PDFDownloadLink>
);
