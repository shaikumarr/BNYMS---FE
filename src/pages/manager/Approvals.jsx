// src/pages/manager/Approvals.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import { managerApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import UpdatesList from "../../components/UpdatesList";

export default function Approvals() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updates, setUpdates] = useState([]);
  // "APPROVED" or "REJECTED" (REJECTED is the internal value for Rework)
  const [decision, setDecision] = useState("APPROVED");
  const [comment, setComment] = useState("");
  const [sheet, setSheet] = useState({ enabled: false, url: "" });
  const [syncing, setSyncing] = useState(false);

  const isRework = decision === "REJECTED";

  const load = () =>
    managerApi.tasks({ status: "SUBMITTED" }).then(setTasks).catch((e) => toast(errorMessage(e), "error"));

  useEffect(() => {
    load();
    managerApi.sheetInfo().then(setSheet).catch(() => {});   // sheet is optional
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
    if (isRework && !comment.trim()) {
      toast("Please write what needs to be reworked", "warning");
      return;
    }
    try {
      await managerApi.review(selected.id, { decision, comment });
      toast(isRework ? "Sent for rework and recorded" : "Approved and recorded");
      setSelected(null);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  // Download the Excel report rebuilt from the database
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

  // Rewrite the live Google Sheet from the database
  const handleSync = async () => {
    if (!window.confirm("Rewrite both tabs of the live sheet from the database? Manual edits in those tabs will be replaced.")) return;
    setSyncing(true);
    try {
      const res = await managerApi.syncSheet();
      toast(`Live sheet synced (${res.rowsWritten} rows)`);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h5" fontWeight={700}>Waiting for approval</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {sheet.enabled && (
            <>
              <Button variant="outlined" component="a" href={sheet.url} target="_blank" rel="noopener noreferrer">
                Open live sheet
              </Button>
              <Button variant="outlined" onClick={handleSync} disabled={syncing}>
                {syncing ? "Syncing..." : "Sync all to sheet"}
              </Button>
            </>
          )}
          <Button variant="outlined" onClick={handleDownload}>Download Excel report</Button>
        </Box>
      </Box>

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
                <TableCell>{t.projectName}</TableCell>
                <TableCell>{t.weekNumber}</TableCell>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.assignedToName}</TableCell>
                <TableCell>{t.deadline}</TableCell>
                <TableCell><ProgressBar value={t.completionPercent} /></TableCell>
                <TableCell align="right">
                  <Button variant="contained" size="small" onClick={() => openReview(t)}>Review</Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">Nothing waiting for review</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Review: {selected?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>Daily updates</Typography>
          <UpdatesList updates={updates} />

          <RadioGroup row value={decision} onChange={(e) => setDecision(e.target.value)} sx={{ mt: 2 }}>
            <FormControlLabel value="APPROVED" control={<Radio />} label="Approve" />
            <FormControlLabel value="REJECTED" control={<Radio />} label="Rework" />
          </RadioGroup>

          <TextField
            label={isRework ? "What needs to be reworked? (required)" : "Comment (optional)"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 1 }}
            helperText="Your comment is shown to the employee and recorded in the Manager Reviews sheet."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" color={isRework ? "warning" : "success"} onClick={handleSubmit}>
            {isRework ? "Send for rework" : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}