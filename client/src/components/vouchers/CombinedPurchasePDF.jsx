import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { numberToWords } from "./utils";

Font.register({ family: "Helvetica" });

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  header: {
    marginBottom: 12,
    textAlign: "center",
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
  },

  subTitle: {
    marginTop: 4,
    fontSize: 9,
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
    borderColor: "#ccc",
    padding: 4,
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
  },

  cell: {
    borderWidth: 1,
    borderColor: "#ccc",
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

export default function CombinedPurchasePDF({
  data,
  fromDate,
  toDate,
  productName,
}) {
  const totalAmount = data.reduce(
    (sum, i) => sum + Number(i.purchase_amount || 0),
    0
  );

  const totalQty = data.reduce(
    (sum, i) => sum + Number(i.quantity || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Combined Purchase Report</Text>
          <Text style={styles.subTitle}>
            From {fromDate || "Beginning"} to {toDate || "Till Date"}
          </Text>
          {productName && (
            <Text style={styles.subTitle}>
              Product: {productName}
            </Text>
          )}
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { width: "12%" }]}>Date</Text>
            <Text style={[styles.cellHeader, { width: "18%" }]}>Invoice</Text>
            <Text style={[styles.cellHeader, { width: "25%" }]}>Product</Text>
            <Text style={[styles.cellHeader, { width: "20%" }]}>Vendor</Text>
            <Text style={[styles.cellHeader, { width: "10%" }, styles.right]}>
              Qty
            </Text>
            <Text style={[styles.cellHeader, { width: "15%" }, styles.right]}>
              Amount
            </Text>
          </View>

          {data.map((row, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={[styles.cell, { width: "12%" }]}>
                {row.date}
              </Text>
              <Text style={[styles.cell, { width: "18%" }]}>
                {row.invoice_no}
              </Text>
              <Text style={[styles.cell, { width: "25%" }]}>
                {row.product_name}
              </Text>
              <Text style={[styles.cell, { width: "20%" }]}>
                {row.vendor}
              </Text>
              <Text
                style={[styles.cell, { width: "10%" }, styles.right]}
              >
                {row.quantity}
              </Text>
              <Text
                style={[styles.cell, { width: "15%" }, styles.right]}
              >
                {Number(row.purchase_amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryBox}>
          <Text>Total Quantity: {totalQty}</Text>
          <Text>
            Total Amount: {totalAmount.toFixed(2)}
          </Text>
          <Text>
            In Words: {numberToWords(Math.round(totalAmount))} Taka Only
          </Text>
        </View>
      </Page>
    </Document>
  );
}
