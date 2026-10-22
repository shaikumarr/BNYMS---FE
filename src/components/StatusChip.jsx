// src/components/StatusChip.jsx
import { Chip } from "@mui/material";

const COLORS = {
  ASSIGNED: "default",
  IN_PROGRESS: "info",
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "secondary",   // internal value; shown as REWORK
};

// The words users see. The internal value REJECTED stays in the database.
const LABELS = {
  REJECTED: "REWORK",
};

export default function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={LABELS[status] || status.replace("_", " ")}
      color={COLORS[status] || "default"}
    />
  );
}