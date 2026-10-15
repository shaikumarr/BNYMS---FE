// src/pages/user/MyProgress.jsx
import { useEffect, useState } from "react";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { userApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";

export default function MyProgress() {
  const toast = useToast();
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    userApi.projects().then(setProjects).catch((e) => toast(errorMessage(e), "error"));
  }, [toast]);

  if (!projects) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" fontWeight={700} gutterBottom>Project Progress</Typography>

      {projects.length === 0 && (
        <Typography color="text.secondary">You are not part of any project yet.</Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {projects.map((p) => (
          <Paper key={p.id} sx={{ p: 3 }}>
            <Typography variant="h6">{p.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {p.startDate} to {p.endDate} &middot; {p.approvedParts} of {p.totalParts} parts approved
            </Typography>
            <ProgressBar value={p.progressPercent} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Remaining: <b>{p.remainingPercent}%</b>
            </Typography>
          </Paper>
        ))}
      </Box>
    </>
  );
}