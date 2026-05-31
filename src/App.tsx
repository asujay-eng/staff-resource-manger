import { useState } from "react";
import StaffForm from "./StaffForm";
import ResourceManager from "./ResourceManager";
import "./App.css";
import "./StaffForm.css";

export default function App() {
  const [page, setPage] = useState<"staff" | "admin">("staff");

  return (
    <>
      <div className="top-nav">
        <button onClick={() => setPage("staff")}>Staff Form</button>
        <button onClick={() => setPage("admin")}>Resource Manager</button>
      </div>

      {page === "staff" ? <StaffForm /> : <ResourceManager />}
    </>
  );
}