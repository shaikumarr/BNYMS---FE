// src/pages/manager/Approvals.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import { managerApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import UpdatesList from "../../components/UpdatesList";
import PageHeader from "../../components/PageHeader";
import { palette } from "../../theme";

export default function Approvals() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [decision, setDecision] = useState("APPROVED");
  const [comment, setComment] = useState("");

  const load = () =>
    managerApi.tasks({ status: "SUBMITTED" }).then(setTasks).catch((e) => toast(errorMessage(e), "error"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openReview = (t) => {
    setSelected(t);
    setDecision("APPROVED");
    setComment("");
    setUpdates([]);
    managerApi.taskUpdates(t.id).then(setUpdates).catch((e) => toast(errorMessage(e), "error"));
  };

  const handleSubmit = async () => {
    // "Rework" is sent to the backend as REJECTED, so the backend needs no change
    if (decision === "REJECTED" && !comment.trim()) {
      toast("Please add a comment explaining what needs rework", "warning");
      return;
    }
    try {
      await managerApi.review(selected.id, { decision, comment });
      toast(decision === "APPROVED" ? "Approved and added to the Excel report" : "Sent back for rework");
      setSelected(null);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  // Download the report rebuilt from the database
  const handleDownload = async () => {
    try {
      const blob = await managerApi.downloadReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "approved-updates.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast("Could not download the report", "error");
    }
  };

  return (
    <>
      <PageHeader
        title="Waiting for approval"
        subtitle={`${tasks.length} ${tasks.length === 1 ? "submission" : "submissions"} to review`}
        action={
          <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={handleDownload}>
            Download Excel report
          </Button>
        }
      />

      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Week</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Progress</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{t.projectName}</TableCell>
                <TableCell>{t.weekNumber}</TableCell>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.assignedToName}</TableCell>
                <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{t.deadline}</TableCell>
                <TableCell><ProgressBar value={t.completionPercent} /></TableCell>
                <TableCell align="right">
                  <Button variant="contained" size="small" onClick={() => openReview(t)}>Review</Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 7 }}>
                  <TaskAltRounded sx={{ fontSize: 44, color: palette.primary, mb: 1 }} />
                  <Typography color="text.secondary">Nothing waiting for review</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Review: {selected?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>Daily updates</Typography>
          <UpdatesList updates={updates} />

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 3, bgcolor: palette.tint }}>
            <RadioGroup row value={decision} onChange={(e) => setDecision(e.target.value)}>
              <FormControlLabel value="APPROVED" control={<Radio color="success" />} label="Approve" />
              <FormControlLabel value="REJECTED" control={<Radio color="warning" />} label="Rework" />
            </RadioGroup>
          </Box>

          <TextField
            label={decision === "REJECTED" ? "What needs rework? (required)" : "Comment (optional)"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" color={decision === "APPROVED" ? "success" : "warning"} onClick={handleSubmit}>
            {decision === "APPROVED" ? "Approve" : "Send for rework"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}