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
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg"; // fallback
import { numberToWords } from "./utils.jsx";

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  header: {
    flexDirection: "row", // logo left, text right
    alignItems: "center", // vertically center the text
    marginBottom: 6,
  },

  logo: {
    width: 70,
    height: 70,
    objectFit: "contain",
    marginRight: 10, // space between logo and text
  },

  headerText: {
    flex: 1,
    justifyContent: "center", // vertical center inside flex space (works with multi-line text)
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center", // horizontally center in flex space
    marginTop: 0,
    marginBottom: 2,
  },

  subTitle: {
    fontSize: 9,
    textAlign: "center", // horizontally center
    marginTop: 0,
    marginBottom: 0,
  },

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

  summaryBox: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

/* ================= COMPONENT ================= */
export default function CombinedExpensePDF({
  data,
  fromDate,
  toDate,
  categoryName,
}) {
  const [banner, setBanner] = useState(null);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  /* ===== FETCH BANNER (LOGO + INFO) ===== */
  useEffect(() => {
    const fetchBanner = async () => {
      if (!selectedCategory?.id) return;

      try {
        const res = await AxiosInstance.get(
          `/business-categories/${selectedCategory.id}/`
        );
        setBanner(res.data);
      } catch (err) {
        console.error("Banner fetch failed:", err);
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
        <View style={styles.header}>
          <Image src={headerLogo} style={styles.logo} />

          <View style={styles.headerText}>
            <Text style={styles.title}>{headerTitle}</Text>
            <Text style={styles.subTitle}>Combined Expense Report</Text>
            <Text style={styles.subTitle}>
              From {fromDate || "Beginning"} to {toDate || "Till Date"}
            </Text>
            {categoryName && (
              <Text style={styles.subTitle}>
                Cost Category: {categoryName}
              </Text>
            )}
          </View>
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

          {/* CATEGORY WISE DATA */}
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
                    <Text
                      style={[styles.cell, { width: "10%" }, styles.right]}
                    >
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
