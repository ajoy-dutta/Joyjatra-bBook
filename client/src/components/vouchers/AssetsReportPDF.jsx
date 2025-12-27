import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import joyjatraLogo from "../../assets/joyjatra_logo.jpeg";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9 },
  header: { flexDirection: "row", marginBottom: 8 },
  logo: { width: 60, height: 60, marginRight: 10 },
  title: { fontSize: 14, fontWeight: "bold", textAlign: "center" },
  subTitle: { fontSize: 9, textAlign: "center" },
  table: { marginTop: 8, borderWidth: 1 },
  row: { flexDirection: "row" },
  th: { borderWidth: 1, padding: 4, fontWeight: "bold" },
  td: { borderWidth: 1, padding: 4 },
  right: { textAlign: "right" },
});

export default function AssetsReportPDF({ assets = [], banner }) {
  const total = assets.reduce((s, a) => s + Number(a.value || 0), 0);

  const logo =
    banner?.banner_logo?.startsWith("http")
      ? banner.banner_logo
      : banner?.banner_logo
      ? `${import.meta.env.VITE_API_BASE_URL}${banner.banner_logo}`
      : joyjatraLogo;

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={logo} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{banner?.banner_title || "Business"}</Text>
          <Text style={styles.subTitle}>Assets Report</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.th, { width: "30%" }]}>Asset</Text>
          <Text style={[styles.th, { width: "25%" }]}>Category</Text>
          <Text style={[styles.th, { width: "15%" }, styles.right]}>Qty</Text>
          <Text style={[styles.th, { width: "30%" }, styles.right]}>Value</Text>
        </View>

        {assets.map((a, i) => (
          <View key={i} style={styles.row}>
            <Text style={[styles.td, { width: "30%" }]}>{a.asset_name}</Text>
            <Text style={[styles.td, { width: "25%" }]}>{a.category}</Text>
            <Text style={[styles.td, { width: "15%" }, styles.right]}>{a.quantity}</Text>
            <Text style={[styles.td, { width: "30%" }, styles.right]}>
              {Number(a.value).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>
        Total Asset Value: {total.toFixed(2)}
      </Text>
    </Page>
  );
}
