import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Link, Paper, TextField, Typography } from "@mui/material";
import { userApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import StatusChip from "../../components/StatusChip";
import UpdatesList from "../../components/UpdatesList";

const EMPTY = { rawNotes: "", notes: "", hoursSpent: "", percentAdded: "" };

export default function TaskDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [task, setTask] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [polishing, setPolishing] = useState(false);

  const load = () =>
    Promise.all([userApi.task(id), userApi.updates(id)])
      .then(([t, u]) => {
        setTask(t);
        setUpdates(u);
      })
      .catch((e) => toast(errorMessage(e), "error"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePolish = async () => {
    if (!form.rawNotes.trim()) {
      toast("Write what you did first", "warning");
      return;
    }
    setPolishing(true);
    try {
      const res = await userApi.polish(form.rawNotes);
      setForm((f) => ({ ...f, notes: res.polished }));
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setPolishing(false);
    }
  };

  const handleAdd = async () => {
    const finalNotes = form.notes.trim() || form.rawNotes.trim();

    if (!finalNotes || form.hoursSpent === "" || form.percentAdded === "") {
      toast("Fill in your update, hours and percentage", "warning");
      return;
    }
    try {
      await userApi.addUpdate(id, {
        rawNotes: form.rawNotes.trim(),
        notes: finalNotes,
        hoursSpent: Number(form.hoursSpent),
        percentAdded: Number(form.percentAdded),
      });
      toast("Update added");
      setForm(EMPTY);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm("Submit this task for manager approval? You cannot add updates after this.")) return;
    try {
      await userApi.submit(id);
      toast("Submitted for approval");
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  if (!task) return <CircularProgress />;

  const locked = task.status === "SUBMITTED" || task.status === "APPROVED";
  const remaining = 100 - task.completionPercent;

  return (
    <>
      <Link component={RouterLink} to="/user" underline="hover">&larr; Back to my tasks</Link>

      <Paper sx={{ p: 3, my: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {task.projectName} &middot; Week {task.weekNumber}
          </Typography>
          <StatusChip status={task.status} />
        </Box>
        <Typography variant="h5" fontWeight={700}>{task.title}</Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>{task.description}</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>Deadline: <b>{task.deadline}</b></Typography>
        <ProgressBar value={task.completionPercent} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Remaining for this part: {remaining}%
        </Typography>
      </Paper>

      {task.status === "REJECTED" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Manager sent this back: {task.reviewComment}. Add an update and submit again.
        </Alert>
      )}
      {task.status === "SUBMITTED" && (
        <Alert severity="info" sx={{ mb: 2 }}>Waiting for your manager to review.</Alert>
      )}
      {task.status === "APPROVED" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Approved{task.reviewComment ? `: ${task.reviewComment}` : "."}
        </Alert>
      )}

      {!locked && (
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Today's update</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <TextField
              label="What did you do today? (write in your own words)"
              value={form.rawNotes}
              onChange={set("rawNotes")}
              multiline
              minRows={3}
              helperText="Do not paste confidential client data."
            />

            <Box>
              <Button variant="outlined" onClick={handlePolish} disabled={polishing}>
                {polishing ? "Improving..." : "Improve with AI"}
              </Button>
            </Box>

            <TextField
              label="Professional version (you can edit before saving)"
              value={form.notes}
              onChange={set("notes")}
              multiline
              minRows={3}
              helperText="This is what your manager will see and what goes into the report. Leave empty to save your own text."
            />

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Hours spent"
                type="number"
                value={form.hoursSpent}
                onChange={set("hoursSpent")}
                slotProps={{ htmlInput: { min: 0, max: 24, step: 0.5 } }}
              />
              <TextField
                label="% progress today"
                type="number"
                value={form.percentAdded}
                onChange={set("percentAdded")}
                slotProps={{ htmlInput: { min: 0, max: remaining } }}
                helperText={`Up to ${remaining}%`}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" onClick={handleAdd}>Save update</Button>
              <Button variant="outlined" color="success" onClick={handleSubmit} disabled={task.completionPercent <= 0}>
                Submit for approval
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">History</Typography>
        <UpdatesList updates={updates} />
      </Paper>
    </>
  );
}