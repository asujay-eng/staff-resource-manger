import { useEffect, useState } from "react";
import "./StaffForm.css";

const API_URL = "https://staff-resource-api-production.up.railway.app";

export default function StaffForm() {
  const [mainDisciplines, setMainDisciplines] = useState<any[]>([]);
  const [subDisciplines, setSubDisciplines] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

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

  useEffect(() => {
    loadMainDisciplines();
    loadCountries();
  }, []);

  async function loadMainDisciplines() {
    try {
      const response = await fetch(`${API_URL}/api/main-disciplines`);
      const data = await response.json();
      setMainDisciplines(data);
    } catch (error) {
      console.error("Failed to load main disciplines", error);
    }
  }

  async function loadSubDisciplines(mainDisciplineId: string) {
    if (!mainDisciplineId) {
      setSubDisciplines([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/sub-disciplines/${mainDisciplineId}`
      );
      const data = await response.json();
      setSubDisciplines(data);
    } catch (error) {
      console.error("Failed to load sub disciplines", error);
    }
  }

  async function loadCountries() {
    try {
      const response = await fetch(`${API_URL}/api/countries`);
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error("Failed to load countries", error);
    }
  }

  function updateField(name: string, value: string) {
    setForm({
      ...form,
      [name]: value
    });
  }

  function splitValues(value: string) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();

    const selectedMain = mainDisciplines.find(
      (d) => String(d.id) === form.mainDiscipline
    );

    const selectedSub = subDisciplines.find(
      (d) => String(d.id) === form.subDiscipline
    );

    const payload = {
      ...form,
      mainDiscipline: selectedMain ? selectedMain.name : form.mainDiscipline,
      subDiscipline: selectedSub ? selectedSub.name : form.subDiscipline,
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

        setSubDisciplines([]);
      } else {
        setMessage(`❌ ${data.error || data.details || "Failed to save record"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Unable to connect to server");
    }
  }

  return (
    <div className="container">
      <h1>Staff Resource Entry Form</h1>

      <p className="subtitle">
        Enter staff member details below
      </p>

      <p style={{ textAlign: "center", color: "red" }}>
        Loaded disciplines: {mainDisciplines.length} | Loaded countries:{" "}
        {countries.length}
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
                onChange={(e) => updateField("calledName", e.target.value)}
              />
            </div>

            <div>
              <label>First Name *</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>

            <div>
              <label>Surname *</label>
              <input
                required
                value={form.surname}
                onChange={(e) => updateField("surname", e.target.value)}
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div>
              <label>Mobile</label>
              <input
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
              />
            </div>

            <div>
              <label>Country</label>

              <input
                list="country-list"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Start typing country..."
              />

              <datalist id="country-list">
                {countries.map((country) => (
                  <option key={country.id} value={country.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label>Town</label>
              <input
                value={form.town}
                onChange={(e) => updateField("town", e.target.value)}
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
                onChange={(e) => {
                  updateField("mainDiscipline", e.target.value);
                  updateField("subDiscipline", "");
                  loadSubDisciplines(e.target.value);
                }}
              >
                <option value="">Select Main Discipline</option>

                {mainDisciplines.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Sub Discipline</label>
              <select
                value={form.subDiscipline}
                onChange={(e) => updateField("subDiscipline", e.target.value)}
                disabled={!form.mainDiscipline}
              >
                <option value="">Select Sub Discipline</option>

                {subDisciplines.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Grade / Level</label>
              <input
                value={form.grade}
                onChange={(e) => updateField("grade", e.target.value)}
              />
            </div>

            <div>
              <label>Availability</label>
              <select
                value={form.availability}
                onChange={(e) => updateField("availability", e.target.value)}
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
                onChange={(e) => updateField("skills", e.target.value)}
              />
            </div>

            <div>
              <label>Industries</label>
              <textarea
                placeholder="Rail, Metro, Highway"
                value={form.industries}
                onChange={(e) => updateField("industries", e.target.value)}
              />
            </div>

            <div>
              <label>Project Phases</label>
              <textarea
                placeholder="Feasibility, Design, Construction"
                value={form.phases}
                onChange={(e) => updateField("phases", e.target.value)}
              />
            </div>

            <div>
              <label>Project Roles</label>
              <textarea
                placeholder="Engineer, Lead Designer, Project Manager"
                value={form.roles}
                onChange={(e) => updateField("roles", e.target.value)}
              />
            </div>

            <div className="full-width">
              <label>Projects</label>
              <textarea
                placeholder="Crossrail, Dubai Metro, Etihad Rail"
                value={form.projects}
                onChange={(e) => updateField("projects", e.target.value)}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="save-btn">
          Save Staff Details
        </button>

        {message && <div className="message">{message}</div>}
      </form>
    </div>
  );
}
