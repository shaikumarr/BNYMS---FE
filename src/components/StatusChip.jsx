// src/components/StatusChip.jsx
import { Chip } from "@mui/material";

// soft background + strong text colour for each status
const STYLES = {
  ASSIGNED: { bg: "#E2E8F0", fg: "#334155" },
  IN_PROGRESS: { bg: "#E0F2FE", fg: "#075985" },
  SUBMITTED: { bg: "#FEF3C7", fg: "#92400E" },
  APPROVED: { bg: "#D1FAE5", fg: "#065F46" },
  REJECTED: { bg: "#FFE4E6", fg: "#9F1239" },
};

export default function StatusChip({ status }) {
  const s = STYLES[status] || STYLES.ASSIGNED;
  return (
    <Chip
      size="small"
      label={status.replace("_", " ")}
      sx={{
        bgcolor: s.bg,
        color: s.fg,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 0.3,
      }}
    />
  );
}