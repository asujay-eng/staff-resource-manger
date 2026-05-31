import { useEffect, useState } from "react";
import "./StaffForm.css";

const API_URL = "https://staff-resource-api-production.up.railway.app";

export default function ResourceManager() {
  const [mainDisciplines, setMainDisciplines] = useState<any[]>([]);
  const [subDisciplines, setSubDisciplines] = useState<any[]>([]);
  const [selectedMainId, setSelectedMainId] = useState("");

  const [mainName, setMainName] = useState("");
  const [mainSortOrder, setMainSortOrder] = useState("0");

  const [subName, setSubName] = useState("");
  const [subSortOrder, setSubSortOrder] = useState("0");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMainDisciplines();
  }, []);

  async function loadMainDisciplines() {
    const res = await fetch(`${API_URL}/api/main-disciplines`);
    const data = await res.json();
    setMainDisciplines(data);
  }

  async function loadSubDisciplines(id: string) {
    setSelectedMainId(id);
    if (!id) {
      setSubDisciplines([]);
      return;
    }

    const res = await fetch(`${API_URL}/api/sub-disciplines/${id}`);
    const data = await res.json();
    setSubDisciplines(data);
  }

  async function addMainDiscipline(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/main-disciplines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: mainName,
        sortOrder: Number(mainSortOrder)
      })
    });

    if (res.ok) {
      setMessage("✅ Main discipline added");
      setMainName("");
      setMainSortOrder("0");
      loadMainDisciplines();
    } else {
      const data = await res.json();
      setMessage(`❌ ${data.details || data.error}`);
    }
  }

  async function updateMainDiscipline(item: any) {
    const newName = prompt("Edit main discipline name:", item.name);
    if (!newName) return;

    const res = await fetch(`${API_URL}/api/main-disciplines/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: newName,
        active: true,
        sortOrder: item.sort_order
      })
    });

    if (res.ok) {
      setMessage("✅ Main discipline updated");
      loadMainDisciplines();
    }
  }

  async function deleteMainDiscipline(id: number) {
    if (!confirm("Deactivate this main discipline?")) return;

    const res = await fetch(`${API_URL}/api/main-disciplines/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      setMessage("✅ Main discipline deactivated");
      loadMainDisciplines();
      setSubDisciplines([]);
    }
  }

  async function addSubDiscipline(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedMainId) {
      setMessage("❌ Please select a main discipline first");
      return;
    }

    const res = await fetch(`${API_URL}/api/sub-disciplines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mainDisciplineId: Number(selectedMainId),
        name: subName,
        sortOrder: Number(subSortOrder)
      })
    });

    if (res.ok) {
      setMessage("✅ Sub discipline added");
      setSubName("");
      setSubSortOrder("0");
      loadSubDisciplines(selectedMainId);
    } else {
      const data = await res.json();
      setMessage(`❌ ${data.details || data.error}`);
    }
  }

  async function updateSubDiscipline(item: any) {
    const newName = prompt("Edit sub discipline name:", item.name);
    if (!newName) return;

    const res = await fetch(`${API_URL}/api/sub-disciplines/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mainDisciplineId: item.main_discipline_id,
        name: newName,
        active: true,
        sortOrder: item.sort_order
      })
    });

    if (res.ok) {
      setMessage("✅ Sub discipline updated");
      loadSubDisciplines(selectedMainId);
    }
  }

  async function deleteSubDiscipline(id: number) {
    if (!confirm("Deactivate this sub discipline?")) return;

    const res = await fetch(`${API_URL}/api/sub-disciplines/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      setMessage("✅ Sub discipline deactivated");
      loadSubDisciplines(selectedMainId);
    }
  }

  return (
    <div className="container">
      <h1>Resource Manager Admin</h1>
      <p className="subtitle">
        Manage dropdown lists used by staff forms
      </p>

      {message && <div className="message">{message}</div>}

      <div className="card">
        <h2>Main Disciplines</h2>

        <form onSubmit={addMainDiscipline} className="admin-row">
          <input
            placeholder="New main discipline"
            value={mainName}
            onChange={(e) => setMainName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Sort order"
            value={mainSortOrder}
            onChange={(e) => setMainSortOrder(e.target.value)}
          />

          <button className="save-btn small-btn" type="submit">
            Add
          </button>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Main Discipline</th>
              <th>Sort Order</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {mainDisciplines.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.sort_order}</td>
                <td>
                  <button onClick={() => updateMainDiscipline(item)}>
                    Edit
                  </button>
                  <button onClick={() => deleteMainDiscipline(item.id)}>
                    Deactivate
                  </button>
                  <button onClick={() => loadSubDisciplines(String(item.id))}>
                    Manage Sub
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Sub Disciplines</h2>

        <label>Select Main Discipline</label>
        <select
          value={selectedMainId}
          onChange={(e) => loadSubDisciplines(e.target.value)}
        >
          <option value="">Select Main Discipline</option>

          {mainDisciplines.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <form onSubmit={addSubDiscipline} className="admin-row">
          <input
            placeholder="New sub discipline"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Sort order"
            value={subSortOrder}
            onChange={(e) => setSubSortOrder(e.target.value)}
          />

          <button className="save-btn small-btn" type="submit">
            Add
          </button>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sub Discipline</th>
              <th>Sort Order</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {subDisciplines.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.sort_order}</td>
                <td>
                  <button onClick={() => updateSubDiscipline(item)}>
                    Edit
                  </button>
                  <button onClick={() => deleteSubDiscipline(item.id)}>
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}