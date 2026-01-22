import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";
import { numberToWords } from "../../components/vouchers/utils"

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },

  /* Header */
  headerWrapper: { flexDirection: "row", alignItems: "center", marginBottom: 10, position: "relative" },
  headerLogo: { left: 10, width: 60, height: 60, objectFit: "contain" },
  headerCenter: { position: "absolute", left: 0, right: 0, textAlign: "center" },
  headerTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 2 },
  headerSub: { fontSize: 9, marginTop: 1 },
  headerSpacer: { width: 60 },

  /* Table */
  table: { width: "95%", marginHorizontal: "auto", borderWidth: 1, borderColor: "#ccc", marginTop: 6 },
  row: { flexDirection: "row" },
  th: { borderWidth: 1, borderColor: "#ccc", padding: 4, fontWeight: "bold", backgroundColor: "#f3f3f3", textAlign: "center" },
  td: { borderWidth: 1, borderColor: "#ccc", padding: 4 },
  right: { textAlign: "right" },

  /* Summary */
  summaryBox: { width: "95%", marginHorizontal: "auto", marginTop: 12 },
  summaryRow: { flexDirection: "row", paddingVertical: 4 },
  summaryKey: { width: "15%", fontWeight: "bold" },
  summaryColon: { width: "5%", textAlign: "center" },
  summaryValue: { width: "70%" },
});

export default function IncomeVoucherPDF({ income, business }) {
  if (!income) return null;

  const logo =
    business?.banner_logo
      ? business.banner_logo.startsWith("http")
        ? business.banner_logo
        : `${import.meta.env.VITE_API_BASE_URL}${business.banner_logo}`
      : joyjatraLogo;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <Image src={logo} style={styles.headerLogo} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{business?.banner_title || "Business Name"}</Text>
            {business?.banner_address1 && <Text style={styles.headerSub}>{business.banner_address1}</Text>}
            {business?.banner_address2 && <Text style={styles.headerSub}>{business.banner_address2}</Text>}
            {business?.banner_phone && <Text style={styles.headerSub}>Phone: {business.banner_phone}</Text>}
            <Text style={styles.headerSub}>Income Voucher</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.row}>
            <Text style={[styles.th, { width: "30%" }]}>Source</Text>
            <Text style={[styles.th, { width: "20%" }]}>Date</Text>
            <Text style={[styles.th, { width: "20%" }]}>Received By</Text>
            <Text style={[styles.th, { width: "15%" }, styles.right]}>Amount</Text>
            <Text style={[styles.th, { width: "15%" }]}>Note</Text>
          </View>

          {/* Table Data */}
          <View style={styles.row}>
            <Text style={[styles.td, { width: "30%" }]}>{income.account_name}</Text>
            <Text style={[styles.td, { width: "20%" }]}>{income.date}</Text>
            <Text style={[styles.td, { width: "20%" }]}>{income.received_by}</Text>
            <Text style={[styles.td, { width: "15%" }, styles.right]}>{income.amount}</Text>
            <Text style={[styles.td, { width: "15%" }]}>{income.note || "-"}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Amount in Words</Text>
            <Text style={styles.summaryColon}>:</Text>
            <Text style={styles.summaryValue}>{numberToWords(Number(income.amount))} Taka Only</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={[styles.row, { marginTop: 20, justifyContent: "space-between" }]}>
          <View style={{ textAlign: "center" }}>
            <View style={{ borderTopWidth: 1, width: 100, marginHorizontal: "auto" }} />
            <Text>Received By</Text>
          </View>
          <View style={{ textAlign: "center" }}>
            <View style={{ borderTopWidth: 1, width: 100, marginHorizontal: "auto" }} />
            <Text>Authorized By</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
