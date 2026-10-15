// src/pages/user/MyTasks.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardActionArea, CardContent, Chip, CircularProgress, Typography } from "@mui/material";
import { userApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import StatusChip from "../../components/StatusChip";

export default function MyTasks() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    userApi.tasks().then(setTasks).catch((e) => toast(errorMessage(e), "error"));
  }, [toast]);

  if (!tasks) return <CircularProgress />;

  const today = new Date().toLocaleDateString("en-CA");   // yyyy-mm-dd in local time

  return (
    <>
      <Typography variant="h5" fontWeight={700} gutterBottom>My Tasks</Typography>

      {tasks.length === 0 && (
        <Typography color="text.secondary">No tasks assigned to you yet.</Typography>
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}>
        {tasks.map((t) => {
          const overdue = t.deadline < today && t.status !== "APPROVED";
          return (
            <Card key={t.id}>
              <CardActionArea onClick={() => navigate(`/user/tasks/${t.id}`)}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t.projectName} &middot; Week {t.weekNumber}
                    </Typography>
                    <StatusChip status={t.status} />
                  </Box>
                  <Typography variant="h6" gutterBottom>{t.title}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Typography variant="body2">Deadline: {t.deadline}</Typography>
                    {overdue && <Chip size="small" color="error" label="Overdue" />}
                  </Box>
                  <ProgressBar value={t.completionPercent} />
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </>
  );
}