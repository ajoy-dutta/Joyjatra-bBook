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
    padding: 28,
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

    left: 10,
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
    width: "95%",
    marginHorizontal: "auto",
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
    width: "16%",
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
    (sum, a) => sum + Number(a.total_price || a.amount || 0),
    0
  );

  const logo =
    banner?.banner_logo
      ? banner.banner_logo.startsWith("http")
        ? banner.banner_logo
        : `${import.meta.env.VITE_API_BASE_URL}${banner.banner_logo}`
      : joyjatraLogo;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ================= HEADER ================= */}
        <View style={styles.headerWrapper}>
          <Image src={logo} style={styles.headerLogo} />

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {banner?.banner_title || "Business Name"}
            </Text>

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
                Phone: {banner.banner_phone}
              </Text>
            )}

            <Text style={styles.headerSub}>Assets Report</Text>
            <Text style={styles.headerSub}>
              From {fromDate || "Beginning"} to {toDate || "Till Date"}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>

          {/* HEADER ROW */}
          <View style={styles.row}>
            <Text style={[styles.th, { width: "18%" }]}>Asset</Text>
            <Text style={[styles.th, { width: "8%" }]}>Qty</Text>
            <Text style={[styles.th, { width: "10%" }]}>Damage</Text>
            <Text style={[styles.th, { width: "10%" }]}>Usable</Text>
            <Text style={[styles.th, { width: "14%" }, styles.right]}>
              Unit Price
            </Text>
            <Text style={[styles.th, { width: "15%" }, styles.right]}>
              Total Value
            </Text>
            <Text style={[styles.th, { width: "25%" }]}>Remarks</Text>
          </View>

          {/* DATA ROWS */}
          {assets.map((a, i) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.td, { width: "18%" }]}>
                {a.asset_name || a.name || "-"}
              </Text>

              <Text style={[styles.td, { width: "8%" }, styles.right]}>
                {a.total_qty ?? "-"}
              </Text>

              <Text style={[styles.td, { width: "10%" }, styles.right]}>
                {a.damaged_qty ?? 0}
              </Text>

              <Text style={[styles.td, { width: "10%" }, styles.right]}>
                {a.usable_qty ?? "-"}
              </Text>

              <Text style={[styles.td, { width: "14%" }, styles.right]}>
                {a.unit_price ? Number(a.unit_price).toFixed(2) : "-"}
              </Text>

              <Text style={[styles.td, { width: "15%" }, styles.right]}>
                {Number(a.total_price || 0).toFixed(2)}
              </Text>

              <Text style={[styles.td, { width: "25%" }]}>
                {a.remarks || "-"}
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
              value: `${numberToWords(
                Math.round(totalValue)
              )} Taka Only`,
            },
          ].map((item, idx) => (
            <View key={idx} style={styles.summaryRow}>
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
