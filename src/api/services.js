import api from "./axios";

const data = (promise) => promise.then((res) => res.data);

export const authApi = {
  login: (body) => data(api.post("/auth/login", body)),
};

export const managerApi = {
  employees: () => data(api.get("/manager/employees")),
  createEmployee: (body) => data(api.post("/manager/employees", body)),
  updateEmployee: (id, body) => data(api.put(`/manager/employees/${id}`, body)),
  deleteEmployee: (id) => data(api.delete(`/manager/employees/${id}`)),

  projects: () => data(api.get("/manager/projects")),
  project: (id) => data(api.get(`/manager/projects/${id}`)),
  createProject: (body) => data(api.post("/manager/projects", body)),
  updateProject: (id, body) => data(api.put(`/manager/projects/${id}`, body)),
  deleteProject: (id) => data(api.delete(`/manager/projects/${id}`)),

  projectMembers: (id) => data(api.get(`/manager/projects/${id}/members`)),
  setProjectMembers: (id, employeeIds) =>
    data(api.put(`/manager/projects/${id}/members`, { employeeIds })),

  tasks: (params) => data(api.get("/manager/tasks", { params })),
  createTask: (body) => data(api.post("/manager/tasks", body)),
  updateTask: (id, body) => data(api.put(`/manager/tasks/${id}`, body)),
  deleteTask: (id) => data(api.delete(`/manager/tasks/${id}`)),
  taskUpdates: (id) => data(api.get(`/manager/tasks/${id}/updates`)),
  review: (id, body) => data(api.post(`/manager/tasks/${id}/review`, body)),

  downloadReport: () =>
    data(api.get("/manager/reports/excel", { responseType: "blob" })),
};

export const userApi = {
  tasks: () => data(api.get("/user/tasks")),
  task: (id) => data(api.get(`/user/tasks/${id}`)),
  updates: (id) => data(api.get(`/user/tasks/${id}/updates`)),
  addUpdate: (id, body) => data(api.post(`/user/tasks/${id}/updates`, body)),
  submit: (id) => data(api.post(`/user/tasks/${id}/submit`)),
  projects: () => data(api.get("/user/projects")),
  polish: (text) => data(api.post("/user/updates/polish", { text })),
};