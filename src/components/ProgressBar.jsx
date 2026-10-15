// src/components/ProgressBar.jsx
import { Box, LinearProgress, Typography } from "@mui/material";
import { palette } from "../theme";

export default function ProgressBar({ value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, value)}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: "#D1FAE5",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              background: "linear-gradient(90deg, #10B981, #34D399)",
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ minWidth: 44, textAlign: "right", color: palette.primaryDark }}
      >
        {value}%
      </Typography>
    </Box>
  );
}