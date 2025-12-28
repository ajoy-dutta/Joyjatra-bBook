import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

const money = (v) =>
  Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const styles = StyleSheet.create({
  page: { padding: 35, fontSize: 9 },
  bold: { fontWeight: "bold" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: { width: 80, height: 80, objectFit: "contain" },
  headerText: { flex: 1, textAlign: "center" },
  title: { fontSize: 14, fontWeight: "bold" },

  // Table styles
  table: { marginTop: 10, borderWidth: 1, borderColor: "#000" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  cell: { 
    padding: 4, 
    borderRightWidth: 1, 
    borderColor: "#000",
    textAlign: "center",
  },
  cellLeft: { textAlign: "left" },
  cellRight: { textAlign: "right" },
  cellBold: { fontWeight: "bold" },
  headerRow: { backgroundColor: "#f0f0f0" },
  totalRow: { backgroundColor: "#e5e7eb" },
});

export default function SalaryPayrollPDF({
  banner,
  items = [],
  month,
}) {
  const totalBasic = items.reduce((s, r) => s + Number(r.base_amount || 0), 0);
  const totalAllowance = items.reduce((s, r) => s + Number(r.allowance || 0), 0);
  const totalBonus = items.reduce((s, r) => s + Number(r.bonus || 0), 0);
  const totalSalary = totalBasic + totalAllowance + totalBonus;

  // Define column widths (must sum to 100%)
  const columnWidths = {
    sl: "5%",
    employee: "30%",
    month: "10%",
    basic: "15%",
    allowance: "15%",
    bonus: "15%",
    total: "10%",
  };

  // Verify they sum to 100%
  const totalWidth = Object.values(columnWidths).reduce((sum, width) => {
    const num = parseFloat(width);
    return sum + num;
  }, 0);



  const formatMonthFull = (monthString) => {
    if (!monthString) return "";
    
    try {
        const [year, month] = monthString.split("-");
        const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        
        return `${monthNames[parseInt(month) - 1]}, ${year}`;
    } catch (error) {
        return monthString;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={banner?.banner_logo || joyjatraLogo} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {banner?.banner_title || "Business Name"}
            </Text>
            {banner?.banner_address1 && <Text>{banner.banner_address1}</Text>}
            {banner?.banner_address2 && <Text>{banner.banner_address2}</Text>}
            {banner?.banner_phone && <Text>Mobile: {banner.banner_phone}</Text>}
          </View>
          <View style={{ width: 80 }} />
        </View>

        <Text style={{ textAlign: "center", marginBottom: 6, fontSize: 11, fontWeight: "bold" }}>
        Payroll Sheet {formatMonthFull(month)}
        </Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.cellBold, { width: columnWidths.sl }]}>
              SL
            </Text>
            <Text style={[styles.cell, styles.cellBold, styles.cellLeft, { width: columnWidths.employee }]}>
              Employee
            </Text>
            <Text style={[styles.cell, styles.cellBold, { width: columnWidths.month }]}>
              Month
            </Text>
            <Text style={[styles.cell, styles.cellBold, { width: columnWidths.basic }]}>
              Basic
            </Text>
            <Text style={[styles.cell, styles.cellBold, { width: columnWidths.allowance }]}>
              Allowance
            </Text>
            <Text style={[styles.cell, styles.cellBold, { width: columnWidths.bonus }]}>
              Bonus
            </Text>
            <Text style={[styles.cell, styles.cellBold, styles.cellRight, { width: columnWidths.total, borderRightWidth: 0 }]}>
              Total
            </Text>
          </View>

          {/* Table Rows */}
          {items.map((r, i) => {
            const rowTotal =
              Number(r.base_amount || 0) +
              Number(r.allowance || 0) +
              Number(r.bonus || 0);

            return (
              <View style={styles.row} key={r.id}>
                <Text style={[styles.cell, { width: columnWidths.sl }]}>
                  {i + 1}
                </Text>
                <Text style={[styles.cell, styles.cellLeft, { width: columnWidths.employee }]}>
                  {r.staff_name || `Staff #${r.staff}`}
                </Text>
                <Text style={[styles.cell, { width: columnWidths.month }]}>
                  {r.salary_month}
                </Text>
                <Text style={[styles.cell, styles.cellRight, { width: columnWidths.basic }]}>
                  {money(r.base_amount)}
                </Text>
                <Text style={[styles.cell, styles.cellRight, { width: columnWidths.allowance }]}>
                  {money(r.allowance)}
                </Text>
                <Text style={[styles.cell, styles.cellRight, { width: columnWidths.bonus }]}>
                  {money(r.bonus)}
                </Text>
                <Text style={[styles.cell, styles.cellRight, { width: columnWidths.total, borderRightWidth: 0 }]}>
                  {money(rowTotal)}
                </Text>
              </View>
            );
          })}

          {/* Total Row */}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={[
              styles.cell, 
              styles.cellBold, 
              styles.cellLeft, 
              { 
                width: `${parseFloat(columnWidths.sl) + parseFloat(columnWidths.employee) + parseFloat(columnWidths.month)}%` 
              }
            ]}>
              Total
            </Text>
            <Text style={[styles.cell, styles.cellBold, styles.cellRight, { width: columnWidths.basic }]}>
              {money(totalBasic)}
            </Text>
            <Text style={[styles.cell, styles.cellBold, styles.cellRight, { width: columnWidths.allowance }]}>
              {money(totalAllowance)}
            </Text>
            <Text style={[styles.cell, styles.cellBold, styles.cellRight, { width: columnWidths.bonus }]}>
              {money(totalBonus)}
            </Text>
            <Text style={[
              styles.cell, 
              styles.cellBold, 
              styles.cellRight, 
              { width: columnWidths.total, borderRightWidth: 0 }
            ]}>
              {money(totalSalary)}
            </Text>
          </View>
        </View>

        {/* Footer info */}
        <View style={{ marginTop: 15, fontSize: 8, color: "#666" }}>
          <Text style={{ marginTop: 10 }}>
            Printed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}