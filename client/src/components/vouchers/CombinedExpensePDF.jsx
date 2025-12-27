import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import AxiosInstance from "../../components/AxiosInstance";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";
import { numberToWords } from "./utils.jsx";

/* ================= STYLES ================= */
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
    marginBottom: 8,
  },

  headerLogo: {
    width: 70,
    height: 70,
    objectFit: "contain",
  },

  headerCenter: {
    flex: 1,
    textAlign: "center",
  },

  headerSpacer: {
    width: 70,
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

  /* ================= SUMMARY ================= */
  summaryBox: {
    width: "100%",
    marginTop: 12,
  },

  summaryRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },

  summaryKey: {
    width: "25%",
    fontWeight: "bold",
  },

  summaryColon: {
    width: "3%",
    textAlign: "center",
  },

  summaryValue: {
    width: "72%",
  },
});

/* ================= COMPONENT ================= */
export default function CombinedExpensePDF({
  data = [],
  fromDate,
  toDate,
  categoryName,
}) {
  const [banner, setBanner] = useState(null);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  /* ===== FETCH BANNER ===== */
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
  }, [selectedCategory?.id]);

  const headerLogo =
    banner?.banner_logo
      ? banner.banner_logo.startsWith("http")
        ? banner.banner_logo
        : `${import.meta.env.VITE_API_BASE_URL}${banner.banner_logo}`
      : joyjatraLogo;

  const headerTitle =
    banner?.banner_title ||
    selectedCategory?.name ||
    "Business Name";

  // ✅ ADDRESS & PHONE (THIS WAS MISSING)
  const address1 = banner?.banner_address1 || "";
  const address2 = banner?.banner_address2 || "";
  const phone = banner?.banner_phone || "";

  /* ================= GROUP DATA ================= */
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
        <View style={styles.headerWrapper}>
          <Image src={headerLogo} style={styles.headerLogo} />

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>

            {address1 !== "" && <Text style={styles.headerSub}>{address1}</Text>}
            {address2 !== "" && <Text style={styles.headerSub}>{address2}</Text>}
            {phone !== "" && (
              <Text style={styles.headerSub}>Phone: {phone}</Text>
            )}

            <Text style={styles.headerSub}>Combined Expense Report</Text>
            <Text style={styles.headerSub}>
              From {fromDate || "Beginning"} to {toDate || "Till Date"}
            </Text>

            {categoryName && (
              <Text style={styles.headerSub}>
                Cost Category: {categoryName}
              </Text>
            )}
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { width: "12%" }]}>Date</Text>
            <Text style={[styles.cellHeader, { width: "18%" }]}>Voucher</Text>
            <Text style={[styles.cellHeader, { width: "20%" }]}>Account</Text>
            <Text style={[styles.cellHeader, { width: "18%" }]}>Category</Text>
            <Text style={[styles.cellHeader, { width: "22%" }]}>Description</Text>
            <Text style={[styles.cellHeader, { width: "10%" }, styles.right]}>
              Amount
            </Text>
          </View>

          {Object.entries(groupedData).map(([category, items]) => {
            const categoryTotal = getCategoryTotal(items);

            return (
              <View key={category}>
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

                {items.map((row, idx) => (
                  <View style={styles.row} key={idx}>
                    <Text style={[styles.cell, { width: "12%" }]}>{row.date}</Text>
                    <Text style={[styles.cell, { width: "18%" }]}>{row.voucher_no}</Text>
                    <Text style={[styles.cell, { width: "20%" }]}>{row.account_title}</Text>
                    <Text style={[styles.cell, { width: "18%" }]}>{row.cost_category}</Text>
                    <Text style={[styles.cell, { width: "22%" }]}>{row.description}</Text>
                    <Text style={[styles.cell, { width: "10%" }, styles.right]}>
                      {Number(row.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}

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

        {/* ================= SUMMARY ================= */}
        <View style={styles.summaryBox}>
          {[
            { key: "Total Records", value: data.length },
            { key: "Grand Total", value: grandTotal.toFixed(2) },
            {
              key: "In Words",
              value: `${numberToWords(Math.round(grandTotal))} Taka Only`,
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
