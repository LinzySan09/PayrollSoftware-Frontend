import React, { useState } from "react";
import { AuthProvider, useAuth }   from "./context/AuthContext";
import { ToastProvider }           from "./context/ToastContext";
import Login                       from "./pages/Login";
import AppShell                    from "./components/AppShell";
import Dashboard                   from "./pages/Dashboard";
import Employees                   from "./pages/Employees";
import SalaryDetails               from "./pages/SalaryDetails";
import LeaveManagement             from "./pages/LeaveManagement";
import Gratuity                    from "./pages/Gratuity";
import DocumentExpiry              from "./pages/DocumentExpiry";

function Router() {
  const { isAuthenticated } = useAuth();
  const [page, setPage]     = useState("dashboard");

  if (!isAuthenticated) return <Login />;

  const pages = {
    dashboard: <Dashboard />,
    employees: <Employees />,
    salary:    <SalaryDetails />,
    leave:     <LeaveManagement />,
    gratuity:  <Gratuity />,
    documents: <DocumentExpiry />,
  };

  return (
    <AppShell page={page} setPage={setPage}>
      <div key={page} className="pg">
        {pages[page] || pages.dashboard}
      </div>
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </AuthProvider>
  );
}
