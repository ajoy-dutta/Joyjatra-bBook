import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

import { useState, useEffect } from "react";

/* -------- Helpers -------- */
const money = (value) => {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const convertBelowHundred = (n) => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
  };

  const convertBelowThousand = (n) => {
    if (n < 100) return convertBelowHundred(n);
    return `${ones[Math.floor(n / 100)]} Hundred ${convertBelowHundred(
      n % 100
    )}`.trim();
  };

  let words = "";

  if (num >= 10000000) {
    words += `${convertBelowThousand(
      Math.floor(num / 10000000)
    )} Crore `;
    num %= 10000000;
  }

  if (num >= 100000) {
    words += `${convertBelowThousand(
      Math.floor(num / 100000)
    )} Lakh `;
    num %= 100000;
  }

  if (num >= 1000) {
    words += `${convertBelowThousand(
      Math.floor(num / 1000)
    )} Thousand `;
    num %= 1000;
  }

  if (num > 0) {
    words += convertBelowThousand(num);
  }

  return words.trim();
};

const amountInWords = (amount) => {
  const taka = Math.round(Number(amount));
  return `${numberToWords(taka)} Taka Only`;
};


const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};



/* -------- Styles -------- */
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
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


  center: {
    textAlign: "center",
  },

  bold: {
    fontWeight: "bold",
  },

 
  voucherTitle: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },

  cell: {
    padding: 4,
    borderRightWidth: 1,
  },

  footerText: {
    marginTop: 8,
  },

  signatureRow: {
    marginTop: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
  signatureItem: {
    alignItems: "center",
    width: "13%",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 9,
  },
});

export default function JournalVoucherPDF({ journal }) {

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

  console.log("SelectedCategory", selectedCategory);


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

        
        <Text style={styles.voucherTitle}>
          Adjustment Journal Voucher
        </Text>

        {/* ================= META ================= */}
        <View style={styles.rowBetween}>
          <Text>
            <Text style={styles.bold}>Voucher Date :</Text>{" "}
            {formatDate(journal.date)}
            </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text>
            <Text style={styles.bold}>Voucher No :</Text>{" "}
            {journal.reference}
          </Text>
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { width: "6%" }]}>SL</Text>
            <Text style={[styles.cell, { width: "14%" }]}>
              Account No
            </Text>
            <Text style={[styles.cell, { width: "40%" }]}>
              Account Name
            </Text>
            <Text style={[styles.cell, { width: "20%", textAlign: "right" }]}>
              Debit
            </Text>
            <Text
              style={[
                styles.cell,
                { width: "20%", textAlign: "right", borderRightWidth: 0 },
              ]}
            >
              Credit
            </Text>
          </View>

          {/* Data Rows */}
          {journal.lines.map((line, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.cell, { width: "6%" }]}>
                {index + 1}
              </Text>
              <Text style={[styles.cell, { width: "14%" }]}>
                {line.account_code || ""}
              </Text>
              <Text style={[styles.cell, { width: "40%" }]}>
                {line.account_name}
              </Text>
              <Text style={[styles.cell, { width: "20%", textAlign: "right" }]}>
                {Number(line.debit) > 0 ? money(line.debit) : "0.00"}
              </Text>
              <Text
                style={[
                  styles.cell,
                  { width: "20%", textAlign: "right", borderRightWidth: 0 },
                ]}
              >
                {Number(line.credit) > 0 ? money(line.credit) : "0.00"}
              </Text>
            </View>
          ))}

          {/* Total Row */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.bold,
                { width: "60%", textAlign: "right" },
              ]}
            >
              Total
            </Text>
            <Text
              style={[
                styles.cell,
                styles.bold,
                { width: "20%", textAlign: "right" },
              ]}
            >
              {money(journal.total_debit)}
            </Text>
            <Text
              style={[
                styles.cell,
                styles.bold,
                {
                  width: "20%",
                  textAlign: "right",
                  borderRightWidth: 0,
                },
              ]}
            >
              {money(journal.total_credit)}
            </Text>
          </View>
        </View>

        {/* ================= FOOTER ================= */}
        <Text style={styles.footerText}>
          <Text style={styles.bold}>Sum Of Taka :</Text>{" "}
          {amountInWords(journal.total_debit)}
        </Text>

        <Text style={styles.footerText}>
          <Text style={styles.bold}>Narration :</Text>{" "}
          {journal.narration || "-"}
        </Text>

        {/* ================= SIGNATURES ================= */}
       <View style={styles.signatureRow}>
        {[
            "Prepared By",
            "Received By",
            "HOD",
            "AM",
            "HOD AF",
            "Approved By",
            "Authorized By",
        ].map((label) => {
            const lineWidth = Math.max(label.length * 4.5, 40); // dynamic

            return (
            <View key={label} style={styles.signatureItem}>
                <View style={[styles.signatureLine, { width: lineWidth }]} />
                <Text style={styles.signatureText}>{label}</Text>
            </View>
            );
        })}
        </View>


      </Page>
    </Document>
  );
}