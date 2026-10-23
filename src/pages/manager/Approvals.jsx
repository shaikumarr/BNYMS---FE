// src/pages/manager/Approvals.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControlLabel, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography,
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
  const [reportAsk, setReportAsk] = useState(false);       // status report window
  const [downloading, setDownloading] = useState(false);

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
      toast(isRework ? "Sent for rework and added to the sheet" : "Approved and added to the sheet");
      setSelected(null);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  // "Open file": opens the live sheet in a new tab. Nothing is downloaded.
  // (window.open must run straight inside the click, before any await.)
  const handleOpenFile = () => {
    window.open(sheet.url, "_blank", "noopener,noreferrer");
    setReportAsk(false);
  };

  // "Download": saves the Excel status report only. The sheet is NOT opened.
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await managerApi.downloadReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "status-report.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setReportAsk(false);
    } catch {
      toast("Could not download the status report", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h5" fontWeight={700}>Waiting for approval</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => setReportAsk(true)}>Status report</Button>
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

      {/* Review: approve or rework */}
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
            helperText="Your comment is shown to the employee and added to the live sheet automatically."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" color={isRework ? "warning" : "success"} onClick={handleSubmit}>
            {isRework ? "Send for rework" : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status report: Open file = open the sheet only, Download = download only */}
      <Dialog open={reportAsk} onClose={() => setReportAsk(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Status report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {sheet.enabled
              ? "Open file shows the live sheet in a new tab. Download saves the Excel file only."
              : "The live sheet is not connected on the server, so you can only download the Excel file."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportAsk(false)} disabled={downloading}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={handleOpenFile}
            disabled={!sheet.enabled || downloading}
          >
            Open file
          </Button>
          <Button variant="contained" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Downloading..." : "Download"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}