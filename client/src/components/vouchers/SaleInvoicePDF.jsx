import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";
import { useState, useEffect } from "react";

/* ===== helpers ===== */
const safeNumber = (v) => {
  const n = parseFloat(v ?? 0);
  return Number.isNaN(n) ? 0 : n;
};

/* ===== styles ===== */
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 10,
    fontFamily: "Helvetica",
  },


  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  logo: {
    width: 70,
    height: 70,
    objectFit: "contain",
  },

  headerCenter: {
    flex: 1,
    textAlign: "center",
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },

  headerSub: {
    fontSize: 9,
    marginTop: 3,
  },

  topTag: {
    border: "1px solid black",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 11,
    alignSelf: "center",
    marginBottom: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 9,
    marginTop: 2,
  },

  sectionTitle: {
    marginTop: 10,
    fontWeight: "bold",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
  },

  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#000",
  },

  th: {
    borderRight: 1,
    borderBottom: 1,
    padding: 4,
    fontWeight: "bold",
    textAlign: "center",
  },

  td: {
    borderRight: 1,
    padding: 4,
    textAlign: "center",
  },

  calcTable: {
    marginTop: 10,
    marginLeft: "auto",
    width: "40%",
    borderWidth: 1,
  },

  calcRow: {
    flexDirection: "row",
    borderBottom: 1,
  },

  calcLabel: {
    flex: 1,
    padding: 4,
  },

  calcValue: {
    width: 80,
    padding: 4,
    textAlign: "right",
  },

  footer: {
    marginTop: 14,
    borderTop: 1,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
});

/* ===== MAIN PDF ===== */
export default function SaleInvoicePDF({
  sale
}) {
  /* ===== calculations (UNCHANGED LOGIC) ===== */
  const totalQty = (sale.products || []).reduce(
    (sum, i) => sum + safeNumber(i.sale_quantity),
    0
  );

  const totalAmount = safeNumber(sale.total_amount);
  const discount = safeNumber(sale.discount_amount);
  const grossTotal = totalAmount - discount;

  const previousBalance = safeNumber(sale.customer?.previous_due_amount);
  const netAmount = grossTotal;
  const [banner, setBanner] = useState(null);
  
  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;
  
  useEffect(() => {
      if (selectedCategory) {
        setBanner(selectedCategory);
      } else {
        setBanner(null);
      }
    }, []);


  const headerLogo =
      banner?.banner_logo
        ? banner.banner_logo.startsWith("http")
          ? banner.banner_logo
          : `${import.meta.env.VITE_API_BASE_URL}${banner.banner_logo}`
        : joyjatraLogo;
  
  const headerTitle =
    banner?.banner_title ||
    banner?.name ||
    "Business Name";

  const paidAmount =
    sale.payments?.reduce(
      (sum, p) => sum + safeNumber(p.paid_amount),
      0
    ) || 0;

  const dueAmount = netAmount - paidAmount;
  const totalDueBalance = previousBalance + dueAmount;

  const printDate = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  

  return (
    <Document>
      <Page size="A4" style={styles.page}>
         {/* ================= HEADER ================= */}
          <View style={styles.headerWrapper}>
            <Image src={headerLogo} style={styles.logo} />
  
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
  
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
                  Mobile: {banner.banner_phone}
                </Text>
              )}
            </View>
  
            {/* Spacer for symmetry */}
            <View style={{ width: 70 }} />
          </View>


        <Text style={{ textAlign: "center", marginVertical: 6 }}>
          Sale Invoice
        </Text>

        {/* ===== CUSTOMER ===== */}
        <View style={styles.rowBetween}>
          <View>
            <Text>Invoice No: {sale.invoice_no}</Text>
            <Text>Customer: {sale.customer?.customer_name}</Text>
            <Text>Address: {sale.customer?.address}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text>Sale Date: {sale.sale_date}</Text>
            <Text>Shop: {sale.customer?.shop_name}</Text>
            <Text>Phone: {sale.customer?.phone1}</Text>
          </View>
        </View>

        {/* ===== PRODUCTS ===== */}
        <Text style={styles.sectionTitle}>Product Details</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            {["Sl", "Product", "Qty", "Price", "Total"].map((h, i) => (
              <Text
                key={i}
                style={[styles.th, { flex: i === 1 ? 2 : 1 }]}
              >
                {h}
              </Text>
            ))}
          </View>

          {sale.products.map((p, idx) => (
            <View key={p.id} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 1 }]}>{idx + 1}</Text>
              <Text style={[styles.td, { flex: 2 }]}>
                {p.product?.product_name}
              </Text>
              <Text style={[styles.td, { flex: 1 }]}>
                {safeNumber(p.sale_quantity).toFixed(2)}
              </Text>
              <Text style={[styles.td, { flex: 1 }]}>
                {safeNumber(p.sale_price).toFixed(2)}
              </Text>
              <Text style={[styles.td, { flex: 1 }]}>
                {safeNumber(p.total_price).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={[styles.td, { flex: 3 }]}>Total</Text>
            <Text style={[styles.td, { flex: 1 }]}>
              {safeNumber(totalQty).toFixed(2)}
            </Text>
            <Text style={[styles.td, { flex: 2 }]}></Text>
          </View>
          
        </View>

        {/* ===== CALC ===== */}
        <View style={styles.calcTable}>
          {[
            ["Total Sale Amount", totalAmount],
            ["(-) Discount", discount],
            ["Gross Total", grossTotal],
            ["(+) Previous Balance", previousBalance],
            ["Net Amount", netAmount],
            ["Paid Taka", paidAmount],
            ["Due Balance", dueAmount],
            ["Total Due Balance", totalDueBalance],
          ].map(([l, v], i) => (
            <View key={i} style={styles.calcRow}>
              <Text style={styles.calcLabel}>{l}</Text>
              <Text style={styles.calcValue}>{v.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <View>
            <Text>* Sold goods are not returnable.</Text>
            <Text>* Save Trees, Save Generations.</Text>
          </View>
          <Text>Print: Admin, {printDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
