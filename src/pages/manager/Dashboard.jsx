// src/pages/manager/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Card, CardContent, CircularProgress, Link, Paper, Typography } from "@mui/material";
import FolderOpenRounded from "@mui/icons-material/FolderOpenRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import { managerApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import PageHeader from "../../components/PageHeader";
import { palette } from "../../theme";

function Stat({ label, value, icon, color, tint }) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: tint,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">{label}</Typography>
          <Typography variant="h4" fontWeight={800}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([managerApi.projects(), managerApi.employees(), managerApi.tasks()])
      .then(([projects, employees, tasks]) => setData({ projects, employees, tasks }))
      .catch((e) => toast(errorMessage(e), "error"));
  }, [toast]);

  if (!data) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { projects, employees, tasks } = data;
  const pending = tasks.filter((t) => t.status === "SUBMITTED").length;
  const overall = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.progressPercent, 0) / projects.length)
    : 0;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at how your team is doing" />

      <Box sx={{ display: "grid", gap: 2.5, mb: 4, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}>
        <Stat label="Projects" value={projects.length} icon={<FolderOpenRounded />} color={palette.primaryDark} tint="#D1FAE5" />
        <Stat label="Team members" value={employees.length} icon={<GroupsRounded />} color="#0EA5E9" tint="#E0F2FE" />
        <Stat label="Waiting for approval" value={pending} icon={<HourglassTopRounded />} color="#D97706" tint="#FEF3C7" />
        <Stat label="Average progress" value={`${overall}%`} icon={<TrendingUpRounded />} color="#E11D48" tint="#FFE4E6" />
      </Box>

      <Typography variant="h6" fontWeight={700} gutterBottom>Project progress</Typography>
      {projects.length === 0 && (
        <Typography color="text.secondary">
          No projects yet. Create one under Projects.
        </Typography>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {projects.map((p) => (
          <Paper
            key={p.id}
            sx={{
              p: 2.5,
              transition: "all .2s",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 28px rgba(16,185,129,0.18)" },
            }}
          >
            <Link component={RouterLink} to={`/manager/projects/${p.id}`} underline="hover" variant="subtitle1" fontWeight={700}>
              {p.name}
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {p.approvedParts} of {p.totalParts} parts approved
            </Typography>
            <ProgressBar value={p.progressPercent} />
          </Paper>
        ))}
      </Box>
    </>
  );
}