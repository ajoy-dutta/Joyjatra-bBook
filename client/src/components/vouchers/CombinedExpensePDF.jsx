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

Font.register({
  family: "Helvetica",
});

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
    marginTop: 8,
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

  categoryHeader: {
    backgroundColor: "#e5e7eb",
    fontWeight: "bold",
  },

  subtotalRow: {
    backgroundColor: "#fff7ed",
    fontWeight: "bold",
  },

  summaryBox: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default function CombinedExpensePDF({
  data,
  fromDate,
  toDate,
  categoryName,
}) {
  // ===========================
  // GROUP DATA BY CATEGORY
  // ===========================
  const groupedData = {};
  data.forEach((item) => {
    const cat = item.cost_category || "Uncategorized";
    if (!groupedData[cat]) groupedData[cat] = [];
    groupedData[cat].push(item);
  });

  const getCategoryTotal = (items) =>
    items.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const grandTotal = data.reduce(
    (sum, i) => sum + Number(i.amount || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Text style={styles.title}>Combined Expense Report</Text>
          <Text style={styles.subTitle}>
            From {fromDate || "Beginning"} to {toDate || "Till Date"}
          </Text>
          {categoryName && (
            <Text style={styles.subTitle}>
              Cost Category: {categoryName}
            </Text>
          )}
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>

          {/* TABLE HEADER */}
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { width: "12%" }]}>Date</Text>
            <Text style={[styles.cellHeader, { width: "18%" }]}>Voucher</Text>
            <Text style={[styles.cellHeader, { width: "20%" }]}>Account</Text>
            <Text style={[styles.cellHeader, { width: "18%" }]}>Category</Text>
            <Text style={[styles.cellHeader, { width: "22%" }]}>Description</Text>
            <Text
              style={[
                styles.cellHeader,
                { width: "10%" },
                styles.right,
              ]}
            >
              Amount
            </Text>
          </View>

          {/* CATEGORY WISE ROWS */}
          {Object.entries(groupedData).map(([category, items]) => {
            const categoryTotal = getCategoryTotal(items);

            return (
              <View key={category}>

                {/* CATEGORY HEADING */}
                <View style={styles.row}>
                  <Text
                    style={[
                      styles.cell,
                      styles.categoryHeader,
                      { width: "100%" },
                    ]}
                  >
                    {category}
                  </Text>
                </View>

                {/* ENTRIES */}
                {items.map((row, idx) => (
                  <View style={styles.row} key={idx}>
                    <Text style={[styles.cell, { width: "12%" }]}>
                      {row.date}
                    </Text>
                    <Text style={[styles.cell, { width: "18%" }]}>
                      {row.voucher_no}
                    </Text>
                    <Text style={[styles.cell, { width: "20%" }]}>
                      {row.account_title}
                    </Text>
                    <Text style={[styles.cell, { width: "18%" }]}>
                      {row.cost_category}
                    </Text>
                    <Text style={[styles.cell, { width: "22%" }]}>
                      {row.description}
                    </Text>
                    <Text
                      style={[
                        styles.cell,
                        { width: "10%" },
                        styles.right,
                      ]}
                    >
                      {Number(row.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}

                {/* CATEGORY SUBTOTAL */}
                <View style={styles.row}>
                  <Text
                    style={[
                      styles.cell,
                      styles.subtotalRow,
                      { width: "90%", textAlign: "right" },
                    ]}
                  >
                    Subtotal ({category})
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.subtotalRow,
                      { width: "10%" },
                      styles.right,
                    ]}
                  >
                    {categoryTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ================= GRAND TOTAL ================= */}
        <View style={styles.summaryBox}>
          <Text style={{ fontWeight: "bold" }}>
            Grand Total: {grandTotal.toFixed(2)}
          </Text>
          <Text>
            In Words: {numberToWords(Math.round(grandTotal))} Taka Only
          </Text>
        </View>

      </Page>
    </Document>
  );
}
