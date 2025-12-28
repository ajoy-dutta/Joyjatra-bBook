import React, { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

/* ---------- Helpers ---------- */
const money = (v) => {
  const n = Number(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 35, fontSize: 9, fontFamily: "Helvetica" },
  bold: { fontWeight: "bold" },
  center: { textAlign: "center" },

  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: { width: 80, height: 80, objectFit: "contain" },
  headerText: { flex: 1, textAlign: "center" },
  headerTitle: { fontSize: 14, fontWeight: "bold" },
  subHeader: { fontSize: 9, marginTop: 2 },

  title: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
  },

  table: { marginTop: 12, borderWidth: 1 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1 },
  cell: { padding: 4, borderRightWidth: 1 },

  signatureRow: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureItem: { alignItems: "center", width: "13%" },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    marginBottom: 4,
  },
});

/* ========================================================= */

export default function JournalVoucherPDF({ openingBalances = [] }) {
  const [banner, setBanner] = useState(null);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  /* ---------- Fetch Banner ---------- */
  useEffect(() => {
    const fetchBanner = async () => {
      if (!selectedCategory?.id) return;
      try {
        const res = await AxiosInstance.get(
          `/business-categories/${selectedCategory.id}/`
        );
        setBanner(res.data);
      } catch (e) {
        console.error("Banner fetch failed", e);
      }
    };
    fetchBanner();
  }, [selectedCategory?.id]);

  const headerLogo = banner?.banner_logo || joyjatraLogo;
  const headerTitle =
    banner?.banner_title || selectedCategory?.name || "Business Name";

  const totalAmount = openingBalances.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}
        <View style={styles.headerWrapper}>
          <Image src={headerLogo} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            {banner?.banner_address1 && (
              <Text style={styles.subHeader}>{banner.banner_address1}</Text>
            )}
            {banner?.banner_address2 && (
              <Text style={styles.subHeader}>{banner.banner_address2}</Text>
            )}
            {banner?.banner_phone && (
              <Text style={styles.subHeader}>
                Mobile: {banner.banner_phone}
              </Text>
            )}
          </View>
          <View style={{ width: 80 }} />
        </View>

        <Text style={styles.title}>Opening Balance Statement</Text>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { width: "6%" }]}>SL</Text>
            <Text style={[styles.cell, { width: "18%" }]}>As of Date</Text>
            <Text style={[styles.cell, { width: "18%" }]}>Account</Text>
            <Text style={[styles.cell, { width: "18%" }]}>Entry Type</Text>
            <Text
              style={[
                styles.cell,
                { width: "20%", textAlign: "right" },
              ]}
            >
              Amount
            </Text>
            <Text
              style={[
                styles.cell,
                { width: "20%", borderRightWidth: 0 },
              ]}
            >
              Remarks
            </Text>
          </View>

          {openingBalances.map((row, index) => (
            <View style={styles.tableRow} key={row.id}>
              <Text style={[styles.cell, { width: "6%" }]}>
                {index + 1}
              </Text>
              <Text style={[styles.cell, { width: "18%" }]}>
                {formatDate(row.as_of_date)}
              </Text>
              <Text style={[styles.cell, { width: "18%" }]}>
                {row.account}
              </Text>
              <Text style={[styles.cell, { width: "18%" }]}>
                {row.entry_type || "-"}
              </Text>
              <Text
                style={[
                  styles.cell,
                  { width: "20%", textAlign: "right" },
                ]}
              >
                {money(row.amount)}
              </Text>
              <Text
                style={[
                  styles.cell,
                  { width: "20%", borderRightWidth: 0 },
                ]}
              >
                {row.remarks || "-"}
              </Text>
            </View>
          ))}

          {/* TOTAL */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.bold,
                { width: "60%", textAlign: "right" },
              ]}
            >
              Total Opening Balance
            </Text>
            <Text
              style={[
                styles.cell,
                styles.bold,
                { width: "20%", textAlign: "right" },
              ]}
            >
              {money(totalAmount)}
            </Text>
            <Text
              style={[
                styles.cell,
                { width: "20%", borderRightWidth: 0 },
              ]}
            />
          </View>
        </View>

        {/* ================= SIGNATURE ================= */}
        <View style={styles.signatureRow}>
          {[
            "Prepared By",
            "Checked By",
            "Accountant",
            "HOD",
            "Approved By",
            "Authorized By",
          ].map((label) => (
            <View key={label} style={styles.signatureItem}>
              <View style={styles.signatureLine} />
              <Text>{label}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
