import { StyleSheet } from "react-native";
import { type Palette } from "./palettes";
import { getTypography } from "./typography";
import { spacing, radii } from "./tokens";
export const createStyles = (c: Palette, language = "en", width = 390) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    page: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 480,
      alignSelf: "center",
      padding: 26,
      paddingBottom: spacing["3xl"],
    },
    brand: { flexDirection: "row", alignItems: "center", gap: 9 },
    mark: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    markText: {
      color: c.onPrimary,
      fontSize: 31,
      fontWeight: "800",
      lineHeight: 35,
      marginTop: -4,
    },
    brandName: {
      color: c.ink,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -1.2,
    },
    eyebrow: {
      ...getTypography("overline", { language, width }),
      color: c.primary,
      marginBottom: spacing.md,
    },
    title: { ...getTypography("h1", { language, width }), color: c.ink },
    subtitle: {
      ...getTypography("bodySmall", { language, width }),
      color: c.muted,
      marginTop: 10,
    },
    label: { ...getTypography("label", { language, width }), color: c.ink },
    link: { ...getTypography("label", { language, width }), color: c.primary },
    card: {
      backgroundColor: c.surface,
      borderRadius: radii.xl,
      padding: 22,
      borderWidth: 1,
      borderColor: c.border,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      ...getTypography("title", { language, width }),
      color: c.ink,
    },
    divider: { height: 1, backgroundColor: c.border, flex: 1 },
  });
