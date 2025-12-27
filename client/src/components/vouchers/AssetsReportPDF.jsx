import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";
import { numberToWords } from "./utils.jsx";

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
    marginBottom: 10,
    position: "relative",
  },

  headerLogo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },

  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },

  headerSub: {
    fontSize: 9,
    marginTop: 1,
  },

  headerSpacer: {
    width: 60,
  },

  /* ================= TABLE ================= */
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
  },

  th: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    textAlign: "center",
  },

  td: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
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
    width: "30%",
    fontWeight: "bold",
  },

  summaryColon: {
    width: "3%",
    textAlign: "center",
  },

  summaryValue: {
    width: "67%",
  },
});

export default function AssetsReportPDF({
  assets = [],
  banner,
  fromDate,
  toDate,
}) {
  const totalValue = assets.reduce(
    (sum, a) => sum + Number(a.value || 0),
    0
  );

  const logo =
    banner?.banner_logo
      ? banner.banner_logo.startsWith("http")
        ? banner.banner_logo
        : `${import.meta.env.VITE_API_BASE_URL}${banner.banner_logo}`
      : joyjatraLogo;

  const title = banner?.banner_title || "Business Name";
  const address1 = banner?.banner_address1 || "";
  const address2 = banner?.banner_address2 || "";
  const phone = banner?.banner_phone || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ================= HEADER ================= */}
        <View style={styles.headerWrapper}>
          <Image src={logo} style={styles.headerLogo} />

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{title}</Text>

            {address1 && <Text style={styles.headerSub}>{address1}</Text>}
            {address2 && <Text style={styles.headerSub}>{address2}</Text>}
            {phone && <Text style={styles.headerSub}>Phone: {phone}</Text>}

            <Text style={styles.headerSub}>Assets Report</Text>
            <Text style={styles.headerSub}>
              From {fromDate || "Beginning"} to {toDate || "Till Date"}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.th, { width: "30%" }]}>Asset</Text>
            <Text style={[styles.th, { width: "25%" }]}>Category</Text>
            <Text style={[styles.th, { width: "15%" }, styles.right]}>Qty</Text>
            <Text style={[styles.th, { width: "30%" }, styles.right]}>Value</Text>
          </View>

          {assets.map((a, i) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.td, { width: "30%" }]}>
                {a.asset_name}
              </Text>
              <Text style={[styles.td, { width: "25%" }]}>
                {a.category}
              </Text>
              <Text style={[styles.td, { width: "15%" }, styles.right]}>
                {a.quantity}
              </Text>
              <Text style={[styles.td, { width: "30%" }, styles.right]}>
                {Number(a.value).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* ================= SUMMARY ================= */}
        <View style={styles.summaryBox}>
          {[
            { key: "Total Assets", value: assets.length },
            { key: "Total Asset Value", value: totalValue.toFixed(2) },
            {
              key: "In Words",
              value: `${numberToWords(Math.round(totalValue))} Taka Only`,
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
