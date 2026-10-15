// src/pages/manager/Projects.jsx
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Link, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import GroupAddOutlined from "@mui/icons-material/GroupAddOutlined";
import { managerApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ProgressBar from "../../components/ProgressBar";
import ProjectTeamDialog from "../../components/ProjectTeamDialog";
import PageHeader from "../../components/PageHeader";

const EMPTY = { name: "", description: "", startDate: "", endDate: "" };

export default function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [teamProject, setTeamProject] = useState(null);   // project whose team is being edited

  const load = () =>
    managerApi.projects().then(setProjects).catch((e) => toast(errorMessage(e), "error"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      startDate: p.startDate,
      endDate: p.endDate,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await managerApi.updateProject(editingId, form);
        toast("Project updated");
      } else {
        await managerApi.createProject(form);
        toast("Project created");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}" and all its weekly parts?`)) return;
    try {
      await managerApi.deleteProject(p.id);
      toast("Project deleted");
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Create projects, build the team and split the work into weekly parts"
        action={
          <Button variant="contained" startIcon={<AddRounded />} onClick={openCreate}>
            New project
          </Button>
        }
      />

      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Progress</TableCell>
              <TableCell>Parts approved</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/manager/projects/${p.id}`} underline="hover" fontWeight={700}>
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                  {p.startDate} to {p.endDate}
                </TableCell>
                <TableCell><ProgressBar value={p.progressPercent} /></TableCell>
                <TableCell>
                  <Chip size="small" color="primary" variant="outlined" label={`${p.approvedParts} / ${p.totalParts}`} />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={`${p.memberCount} ${p.memberCount === 1 ? "member" : "members"}`}
                    sx={{ bgcolor: "#D1FAE5", color: "#065F46" }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Button size="small" variant="outlined" startIcon={<GroupAddOutlined />} onClick={() => setTeamProject(p)}>
                    Assign team
                  </Button>
                  <Button size="small" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(p)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No projects yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* New / edit project */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit project" : "New project"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField label="Project name" value={form.name} onChange={set("name")} required />
          <TextField label="Description" value={form.description} onChange={set("description")} multiline minRows={2} />
          <TextField
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={set("startDate")}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField
            label="End date"
            type="date"
            value={form.endDate}
            onChange={set("endDate")}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Assign employees to a project */}
      <ProjectTeamDialog
        open={Boolean(teamProject)}
        project={teamProject}
        onClose={() => setTeamProject(null)}
        onSaved={load}
      />
    </>
  );
}