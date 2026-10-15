import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { managerApi } from "../../api/services";
import { errorMessage } from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const EMPTY = { name: "", email: "", password: "" };

export default function Employees() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () =>
    managerApi.employees().then(setEmployees).catch((e) => toast(errorMessage(e), "error"));

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

  const openEdit = (emp) => {
    setEditingId(emp.id);
    setForm({ name: emp.name, email: emp.email, password: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // password is optional when editing: leave it out to keep the current one
        const payload = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        await managerApi.updateEmployee(editingId, payload);
        toast("Employee updated");
      } else {
        await managerApi.createEmployee(form);
        toast("Employee created");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}? This cannot be undone.`)) return;
    try {
      await managerApi.deleteEmployee(emp.id);
      toast("Employee deleted");
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>My Team</Typography>
        <Button variant="contained" onClick={openCreate}>Add employee</Button>
      </Box>

      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(e)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(e)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">No employees yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Edit employee" : "Add employee"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField label="Name" value={form.name} onChange={set("name")} required />
          <TextField label="Email" type="email" value={form.email} onChange={set("email")} required />
          <TextField
            label={editingId ? "New password (leave empty to keep current)" : "Password (min 6 characters)"}
            type="password"
            value={form.password}
            onChange={set("password")}
            required={!editingId}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}