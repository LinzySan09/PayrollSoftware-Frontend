import axios from "axios";

// const isLocal = window.location.hostname === "localhost";

// const api = axios.create({
//   baseURL: isLocal
//     ? "/api"
//     : "https://payroll-management-1-nb0h.onrender.com",
// });

// axios.js
const api = axios.create({
  baseURL: "https://payroll-management-1-nb0h.onrender.com/api",
  withCredentials: true,
});

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("pp_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("pp_token");
      localStorage.removeItem("pp_user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
