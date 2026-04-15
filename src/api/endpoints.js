import api from "./axios";

// Auth
export const authLogin   = (data)      => api.post("/auth/login", data);
export const authMe      = ()          => api.get("/auth/me");

// Dashboard
export const getDashboard = ()         => api.get("/dashboard");

// Employees
export const getEmployees  = ()        => api.get("/employees");
export const getEmployee   = (id)      => api.get(`/employees/${id}`);
export const createEmployee = (data)   => api.post("/employees", data);
export const updateEmployee = (id, d)  => api.put(`/employees/${id}`, d);
export const deleteEmployee = (id)     => api.delete(`/employees/${id}`);

// Salary
export const getSalary      = (id)     => api.get(`/salary/${id}`);
export const updateSalary   = (id, d)  => api.put(`/salary/${id}`, d);
export const getSalarySummary = ()     => api.get("/salary/summary");

// Leave
export const updateLeave    = (id, d)  => api.put(`/leave/${id}`, d);

// Gratuity
export const getGratuity    = ()       => api.get("/gratuity");

// Documents
export const getDocuments   = ()       => api.get("/documents");
