// src/pages/manager/ProjectTasks.jsx
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Link, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import { managerApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import StatusChip from "../../components/StatusChip";
import UpdatesList from "../../components/UpdatesList";
import ProjectTeamDialog from "../../components/ProjectTeamDialog";
import { palette } from "../../theme";

const EMPTY = { title: "", description: "", assignedTo: "", startDate: "", deadline: "" };

// ---------- date helpers (dates are "YYYY-MM-DD" strings) ----------
const toUtc = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

const addDays = (s, n) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

// Week number = which 7-day block of the project the start date falls in
const weekFromDate = (projectStart, date) =>
  Math.floor((toUtc(date) - toUtc(projectStart)) / 86400000 / 7) + 1;

const formatDate = (s) =>
  s
    ? new Date(toUtc(s)).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

export default function ProjectTasks() {
  const { id } = useParams();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);   // only the project's team can get weekly parts

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const [teamOpen, setTeamOpen] = useState(false);

  const [viewTask, setViewTask] = useState(null);
  const [updates, setUpdates] = useState([]);

  const load = () =>
    Promise.all([managerApi.project(id), managerApi.tasks({ projectId: id }), managerApi.projectMembers(id)])
      .then(([p, t, m]) => {
        setProject(p);
        setTasks(t);
        setMembers(m);
      })
      .catch((e) => toast(errorMessage(e), "error"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // When the From date changes, keep the deadline valid (default: 7 days, capped at project end)
  const setStart = (e) => {
    const start = e.target.value;
    let deadline = form.deadline;
    if (start && (!deadline || deadline < start)) {
      deadline = addDays(start, 6);
      if (deadline > project.endDate) deadline = project.endDate;
    }
    setForm({ ...form, startDate: start, deadline });
  };

  // Start date of a task (older tasks saved before this change have no startDate)
  const periodStart = (t) => t.startDate || addDays(project.startDate, (t.weekNumber - 1) * 7);

  const openCreate = () => {
    // next free period: day after the latest existing deadline, otherwise the project start
    const lastEnd = tasks.map((t) => t.deadline).sort().pop();
    let start = lastEnd ? addDays(lastEnd, 1) : project.startDate;
    if (start > project.endDate) start = project.startDate;
    let end = addDays(start, 6);
    if (end > project.endDate) end = project.endDate;

    setEditing(null);
    setForm({ ...EMPTY, startDate: start, deadline: end });
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || "",
      assignedTo: t.assignedToId,
      startDate: periodStart(t),
      deadline: t.deadline,
    });
    setDialogOpen(true);
  };

  // Options for the "Assign to" dropdown: the team, plus the current assignee when editing
  const assignable =
    editing && !members.some((m) => m.id === editing.assignedToId)
      ? [...members, { id: editing.assignedToId, name: editing.assignedToName, email: "" }]
      : members;

  const handleSave = async () => {
    if (!form.startDate || !form.deadline) {
      toast("Please choose both the From date and the Deadline", "warning");
      return;
    }
    if (form.deadline < form.startDate) {
      toast("Deadline cannot be before the From date", "warning");
      return;
    }
    const weekNumber = weekFromDate(project.startDate, form.startDate);
    if (weekNumber < 1) {
      toast("From date cannot be before the project start date", "warning");
      return;
    }

    const payload = {
      projectId: Number(id),
      title: form.title,
      description: form.description,
      assignedTo: Number(form.assignedTo),
      weekNumber,                    // calculated automatically from the From date
      startDate: form.startDate,     // saved once the backend step is done
      deadline: form.deadline,
    };
    try {
      if (editing) {
        await managerApi.updateTask(editing.id, payload);
        toast("Task updated");
      } else {
        await managerApi.createTask(payload);
        toast("Task assigned");
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete "${t.title}" (${formatDate(periodStart(t))} to ${formatDate(t.deadline)})?`)) return;
    try {
      await managerApi.deleteTask(t.id);
      toast("Task deleted");
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const openUpdates = (t) => {
    setViewTask(t);
    setUpdates([]);
    managerApi.taskUpdates(t.id).then(setUpdates).catch((e) => toast(errorMessage(e), "error"));
  };

  if (!project) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  

  return (
    <>
      <Link
        component={RouterLink}
        to="/manager/projects"
        underline="hover"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}
      >
        <ArrowBackRounded fontSize="small" /> Back to projects
      </Link>

      <Paper sx={{ p: 3, my: 2.5, borderTop: `5px solid ${palette.primary}` }}>
        <Typography variant="h5" fontWeight={800}>{project.name}</Typography>
        <Typography color="text.secondary" sx={{ mb: 1.5 }}>
          {project.description} ({formatDate(project.startDate)} to {formatDate(project.endDate)})
        </Typography>
        <ProgressBar value={project.progressPercent} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
          <Chip size="small" label={`Remaining: ${project.remainingPercent}%`} sx={{ bgcolor: "#FFE4E6", color: "#9F1239" }} />
          <Chip
            size="small"
            label={`${project.approvedParts} of ${project.totalParts} parts approved`}
            sx={{ bgcolor: "#D1FAE5", color: "#065F46" }}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          <b>Team:</b> {members.length === 0 ? "nobody yet" : members.map((m) => m.name).join(", ")}
        </Typography>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h6" fontWeight={700}>Weekly parts</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<GroupsOutlined />} onClick={() => setTeamOpen(true)}>
            Project team
          </Button>
          <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate} disabled={members.length === 0}>
            Assign weekly part
          </Button>
        </Box>
      </Box>
      {members.length === 0 && (
        <Typography color="error" sx={{ mb: 1 }}>
          Add employees to this project first (Project team), then assign weekly parts.
        </Typography>
      )}

      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Assigned to</TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Progress</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Chip size="small" label={`W${t.weekNumber}`} color="primary" variant="outlined" sx={{ mr: 1 }} />
                  <Typography component="span" variant="body2" color="text.secondary">
                    {formatDate(periodStart(t))} &rarr; {formatDate(t.deadline)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t.title}</TableCell>
                <TableCell>{t.assignedToName}</TableCell>
                <TableCell><StatusChip status={t.status} /></TableCell>
                <TableCell><ProgressBar value={t.completionPercent} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Button size="small" onClick={() => openUpdates(t)}>Updates</Button>
                  <Button size="small" onClick={() => openEdit(t)} disabled={t.status === "APPROVED"}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(t)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No weekly parts assigned yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Assign / edit weekly part */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit weekly part" : "Assign weekly part"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField label="Title" value={form.title} onChange={set("title")} required />
          <TextField label="Description" value={form.description} onChange={set("description")} multiline minRows={2} />
          <TextField select label="Assign to" value={form.assignedTo} onChange={set("assignedTo")} required>
            {assignable.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.name}{m.email ? ` (${m.email})` : ""}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
		  <TextField
		    label="From date"
		    type="date"
		    value={form.startDate}
		    onChange={setStart}
		    fullWidth
		    required
		    slotProps={{
		      inputLabel: { shrink: true },
		      htmlInput: { min: project.startDate, max: project.endDate },
		    }}
		  />
            <TextField
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={set("deadline")}
              fullWidth
              required
              helperText={`Project ends ${formatDate(project.endDate)}`}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: form.startDate || project.startDate, max: project.endDate },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Daily updates */}
      <Dialog open={Boolean(viewTask)} onClose={() => setViewTask(null)} fullWidth maxWidth="sm">
        <DialogTitle>Daily updates: {viewTask?.title}</DialogTitle>
        <DialogContent>
          <UpdatesList updates={updates} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setViewTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Project team */}
      <ProjectTeamDialog
        open={teamOpen}
        project={project}
        onClose={() => setTeamOpen(false)}
        onSaved={load}
      />
    </>
  );
}