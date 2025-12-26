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
import AxiosInstance from "../AxiosInstance";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";
import { numberToWords } from "./utils";

Font.register({ family: "Helvetica" });

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  /* ================= HEADER ================= */
  headerWrapper: {
    position: "relative",
    height: 60,
    justifyContent: "center",
    marginBottom: 12,
  },

  headerLogo: {
    position: "absolute",
    left: 10,
    width: 60,
    height: 60,
    objectFit: "contain",
  },

  headerText: {
    width: "100%",
    textAlign: "center",
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },

  subTitle: {
    marginTop: 4,
    fontSize: 9,
  },

  /* ================= TABLE ================= */
  table: {
    width: "95%",
    marginHorizontal: "auto",
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "solid",
  },

  row: {
    flexDirection: "row",
  },

  cellHeader: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "solid",
    padding: 4,
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    textAlign: "center",
  },

  cell: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "solid",
    padding: 4,
    textAlign: "center",
  },

  right: {
    textAlign: "right",
  },

  /* ================= SUMMARY ================= */
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
    width: "20%",
    fontWeight: "bold",
  },

  summaryColon: {
    width: "3%",
    textAlign: "center",
  },

  summaryValue: {
    width: "77%",
    textAlign: "left",
  },
});

export default function CombinedPurchasePDF({
  data,
  fromDate,
  toDate,
  productName,
}) {
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
      } catch {
        setBanner(null);
      }
    };
    fetchBanner();
  }, [selectedCategory]);

  const headerLogo = banner?.banner_logo || joyjatraLogo;
  const headerTitle =
    banner?.banner_title || selectedCategory?.name || "Business Name";

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

        {/* ============== HEADER ============== */}
        <View style={styles.headerWrapper}>
          <Image src={headerLogo} style={styles.headerLogo} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.subTitle}>
              From {fromDate || "Beginning"} to {toDate || "Till Date"}
            </Text>
            {productName && (
              <Text style={styles.subTitle}>Product: {productName}</Text>
            )}
          </View>
        </View>

        {/* ============== TABLE ============== */}
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
              <Text style={[styles.cell, { width: "12%" }]}>{row.date}</Text>
              <Text style={[styles.cell, { width: "18%" }]}>{row.invoice_no}</Text>
              <Text style={[styles.cell, { width: "25%" }]}>{row.product_name}</Text>
              <Text style={[styles.cell, { width: "20%" }]}>{row.vendor}</Text>
              <Text style={[styles.cell, { width: "10%" }, styles.right]}>
                {row.quantity}
              </Text>
              <Text style={[styles.cell, { width: "15%" }, styles.right]}>
                {Number(row.purchase_amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* ============== SUMMARY ============== */}
        <View style={styles.summaryBox}>
          {[
            { key: "Total Quantity", value: totalQty },
            { key: "Total Amount", value: totalAmount.toFixed(2) },
            {
              key: "In Words",
              value: `${numberToWords(Math.round(totalAmount))} Taka Only`,
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
