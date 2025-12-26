import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { numberToWords } from "./utils.jsx";

Font.register({ family: "Helvetica" });

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 9,
    marginTop: 4,
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
    padding: 4,
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
  },
  cell: {
    borderWidth: 1,
    padding: 4,
  },
  right: {
    textAlign: "right",
  },
  summaryBox: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default function SalesReportPDF({
  sales,
  summary,
  fromDate,
  toDate,
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Sales Report</Text>
          <Text style={styles.subTitle}>
            From {fromDate || "Beginning"} to {toDate || "Till Date"}
          </Text>
        </View>

        {/* TABLE */}
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

        {/* SUMMARY */}
        <View style={styles.summaryBox}>
          <Text>Total Sales: {summary.total_sales_amount?.toFixed(2)}</Text>
          <Text>Total Paid: {summary.total_paid_amount?.toFixed(2)}</Text>
          <Text>Total Due: {summary.total_due_amount?.toFixed(2)}</Text>
          <Text>
            In Words:{" "}
            {numberToWords(Math.round(summary.total_sales_amount || 0))} Taka
            Only
          </Text>
        </View>
      </Page>
    </Document>
  );
}
