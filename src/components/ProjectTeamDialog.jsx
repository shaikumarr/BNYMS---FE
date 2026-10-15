import { useEffect, useState } from "react";
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, FormGroup, Typography,
} from "@mui/material";
import { managerApi } from "../api/services";
import { errorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function ProjectTeamDialog({ open, project, onClose, onSaved }) {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);

  const projectId = project?.id;

  // Every time the dialog opens: load all my employees and this project's current team
  useEffect(() => {
    if (!open || !projectId) return;
    Promise.all([managerApi.employees(), managerApi.projectMembers(projectId)])
      .then(([allEmployees, members]) => {
        setEmployees(allEmployees);
        setSelected(members.map((m) => m.id));
      })
      .catch((e) => toast(errorMessage(e), "error"));
  }, [open, projectId, toast]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = async () => {
    try {
      await managerApi.setProjectMembers(projectId, selected);
      toast("Project team updated");
      onSaved();
      onClose();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Project team: {project?.name}</DialogTitle>
      <DialogContent>
        {employees.length === 0 ? (
          <Typography color="text.secondary">
            No employees yet. Add them under Team first.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Tick the employees working on this project. Only they can be given weekly parts.
            </Typography>
            <FormGroup>
              {employees.map((e) => (
                <FormControlLabel
                  key={e.id}
                  control={<Checkbox checked={selected.includes(e.id)} onChange={() => toggle(e.id)} />}
                  label={`${e.name} (${e.email})`}
                />
              ))}
            </FormGroup>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={employees.length === 0}>
          Save team
        </Button>
      </DialogActions>
    </Dialog>
  );
}