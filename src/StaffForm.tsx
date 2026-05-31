import { useState } from "react";
import "./StaffForm.css";

const API_URL = "https://staff-resource-api-production.up.railway.app";

export default function StaffForm() {
  const [form, setForm] = useState({
    employeeNumber: "",
    calledName: "",
    firstName: "",
    surname: "",
    email: "",
    mobile: "",
    country: "",
    town: "",
    mainDiscipline: "",
    subDiscipline: "",
    grade: "",
    availability: "Available",
    skills: "",
    industries: "",
    phases: "",
    roles: "",
    projects: ""
  });

  const [message, setMessage] = useState("");

  const updateField = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value
    });
  };

  const splitValues = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      skills: splitValues(form.skills),
      industries: splitValues(form.industries),
      phases: splitValues(form.phases),
      roles: splitValues(form.roles),
      projects: splitValues(form.projects)
    };

    try {
      const response = await fetch(`${API_URL}/api/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Staff details saved successfully");

        setForm({
          employeeNumber: "",
          calledName: "",
          firstName: "",
          surname: "",
          email: "",
          mobile: "",
          country: "",
          town: "",
          mainDiscipline: "",
          subDiscipline: "",
          grade: "",
          availability: "Available",
          skills: "",
          industries: "",
          phases: "",
          roles: "",
          projects: ""
        });
      } else {
        setMessage(`❌ ${data.error || "Failed to save record"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Unable to connect to server");
    }
  };

  return (
    <div className="container">
      <h1>Staff Resource Entry Form</h1>

      <p className="subtitle">
        Enter staff member details below
      </p>

      <form onSubmit={submitForm}>
        <div className="card">
          <h2>Personal Information</h2>

          <div className="grid4">
            <div>
              <label>Employee Number</label>
              <input
                value={form.employeeNumber}
                onChange={(e) =>
                  updateField("employeeNumber", e.target.value)
                }
              />
            </div>

            <div>
              <label>Called Name *</label>
              <input
                required
                value={form.calledName}
                onChange={(e) =>
                  updateField("calledName", e.target.value)
                }
              />
            </div>

            <div>
              <label>First Name *</label>
              <input
                required
                value={form.firstName}
                onChange={(e) =>
                  updateField("firstName", e.target.value)
                }
              />
            </div>

            <div>
              <label>Surname *</label>
              <input
                required
                value={form.surname}
                onChange={(e) =>
                  updateField("surname", e.target.value)
                }
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
              />
            </div>

            <div>
              <label>Mobile</label>
              <input
                value={form.mobile}
                onChange={(e) =>
                  updateField("mobile", e.target.value)
                }
              />
            </div>

            <div>
              <label>Country</label>
              <input
                value={form.country}
                onChange={(e) =>
                  updateField("country", e.target.value)
                }
              />
            </div>

            <div>
              <label>Town</label>
              <input
                value={form.town}
                onChange={(e) =>
                  updateField("town", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Professional Information</h2>

          <div className="grid4">
          <div>
  <label>Main Discipline</label>
  <select
    value={form.mainDiscipline}
    onChange={(e) =>
      updateField("mainDiscipline", e.target.value)
    }
  >
    <option value="">Select Discipline</option>

    <option value="Structural Engineering">
      Structural Engineering
    </option>

    <option value="Permanent Way (P-Way) / Track Engineering">
      Permanent Way (P-Way) / Track Engineering
    </option>

    <option value="Earthworks & Earthworks Structures">
      Earthworks & Earthworks Structures
    </option>

    <option value="Tunnelling and Geotechnical Engineering">
      Tunnelling and Geotechnical Engineering
    </option>

    <option value="Signalling and Train Control (Command & Control)">
      Signalling and Train Control (Command & Control)
    </option>

    <option value="Traction Power Supply & Electrification">
      Traction Power Supply & Electrification
    </option>

    <option value="Telecommunications & SCADA">
      Telecommunications & SCADA
    </option>

    <option value="Rolling Stock Design">
      Rolling Stock Design
    </option>

    <option value="Mechanical, Electrical, and Plumbing (MEP)">
      Mechanical, Electrical, and Plumbing (MEP)
    </option>

    <option value="Systems Engineering and Integration">
      Systems Engineering and Integration
    </option>
  </select>
</div>

            <div>
              <label>Sub Discipline</label>
              <input
                value={form.subDiscipline}
                onChange={(e) =>
                  updateField("subDiscipline", e.target.value)
                }
              />
            </div>

            <div>
              <label>Grade / Level</label>
              <input
                value={form.grade}
                onChange={(e) =>
                  updateField("grade", e.target.value)
                }
              />
            </div>

            <div>
              <label>Availability</label>
              <select
                value={form.availability}
                onChange={(e) =>
                  updateField("availability", e.target.value)
                }
              >
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Skills & Experience</h2>

          <div className="grid2">
            <div>
              <label>Skills</label>
              <textarea
                placeholder="AutoCAD, BIM, Project Management"
                value={form.skills}
                onChange={(e) =>
                  updateField("skills", e.target.value)
                }
              />
            </div>

            <div>
              <label>Industries</label>
              <textarea
                placeholder="Rail, Metro, Highway"
                value={form.industries}
                onChange={(e) =>
                  updateField("industries", e.target.value)
                }
              />
            </div>

            <div>
              <label>Project Phases</label>
              <textarea
                placeholder="Feasibility, Design, Construction"
                value={form.phases}
                onChange={(e) =>
                  updateField("phases", e.target.value)
                }
              />
            </div>

            <div>
              <label>Project Roles</label>
              <textarea
                placeholder="Engineer, Lead Designer, Project Manager"
                value={form.roles}
                onChange={(e) =>
                  updateField("roles", e.target.value)
                }
              />
            </div>

            <div className="full-width">
              <label>Projects</label>
              <textarea
                placeholder="Crossrail, Dubai Metro, Etihad Rail"
                value={form.projects}
                onChange={(e) =>
                  updateField("projects", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <button type="submit" className="save-btn">
          Save Staff Details
        </button>

        {message && (
          <div className="message">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}