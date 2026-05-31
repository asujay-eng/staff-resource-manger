import { useState } from "react";
import StaffForm from "./StaffForm";
import ResourceManager from "./ResourceManager";
import DashboardMap from "./DashboardMap";
import "./App.css";
import "./StaffForm.css";

export default function App() {
  const [page, setPage] = useState<"staff" | "admin" | "dashboard">("staff");

  return (
    <>
      <div className="top-nav">
        <button onClick={() => setPage("staff")}>Staff Form</button>
        <button onClick={() => setPage("admin")}>Resource Manager</button>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
      </div>

      {page === "staff" && <StaffForm />}
      {page === "admin" && <ResourceManager />}
      {page === "dashboard" && <DashboardMap />}
    </>
  );
}
