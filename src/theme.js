// src/theme.js
import { createTheme } from "@mui/material/styles";

export const palette = {
  bg: "#F0FDF4",
  surface: "#FFFFFF",
  primary: "#10B981",
  primaryDark: "#059669",
  accent: "#FB7185",
  sun: "#FBBF24",
  text: "#0F172A",
  muted: "#64748B",
  border: "#D1FAE5",
  tint: "#ECFDF5",
  gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  heroGradient: "linear-gradient(160deg, #059669 0%, #10B981 50%, #34D399 100%)",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.primary, dark: palette.primaryDark, contrastText: "#FFFFFF" },
    secondary: { main: palette.accent },
    background: { default: palette.bg, paper: palette.surface },
    text: { primary: palette.text, secondary: palette.muted },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: palette.bg } },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 12 },
        containedPrimary: {
          background: palette.gradient,
          boxShadow: "0 6px 16px rgba(16,185,129,0.30)",
          "&:hover": { background: palette.primaryDark },
        },
        outlinedPrimary: { borderWidth: 2, "&:hover": { borderWidth: 2, backgroundColor: palette.tint } },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 18 },
        elevation1: {
          border: `1px solid ${palette.border}`,
          boxShadow: "0 6px 24px rgba(16,185,129,0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${palette.border}`,
          boxShadow: "0 6px 24px rgba(16,185,129,0.08)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${palette.border}` },
        head: {
          backgroundColor: palette.tint,
          color: "#065F46",
          fontWeight: 700,
          whiteSpace: "nowrap",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.MuiTableRow-hover:hover": { backgroundColor: palette.bg },
          "&:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 22 } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#F8FFFB",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: palette.border, borderWidth: 2 },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: palette.primary },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;