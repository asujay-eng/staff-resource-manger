import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Check backend/.env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000
});

app.get("/", (_, res) => {
  res.json({ status: "Staff Resource API Running" });
});

app.get("/api/test-db", async (_, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0].current_time
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Database connection failed",
      details: error.message
    });
  }
});

app.get("/api/setup", async (_, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        employee_number TEXT UNIQUE,
        called_name TEXT NOT NULL,
        first_name TEXT NOT NULL,
        surname TEXT NOT NULL,
        email TEXT UNIQUE,
        mobile TEXT,
        country TEXT,
        town TEXT,
        main_discipline TEXT,
        sub_discipline TEXT,
        grade TEXT,
        availability TEXT,
        skills TEXT[],
        industries TEXT[],
        phases TEXT[],
        roles TEXT[],
        projects TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    res.json({ message: "Staff table created successfully" });
  } catch (error: any) {
    res.status(500).json({
      error: "Staff table setup failed",
      details: error.message
    });
  }
});

app.get("/api/setup-disciplines", async (_, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS main_disciplines (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sub_disciplines (
        id SERIAL PRIMARY KEY,
        main_discipline_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (main_discipline_id)
        REFERENCES main_disciplines(id)
        ON DELETE CASCADE,
        UNIQUE (main_discipline_id, name)
      );
    `);

    await pool.query(`
      INSERT INTO main_disciplines (name, sort_order)
      VALUES
      ('Structural Engineering', 1),
      ('Permanent Way (P-Way) / Track Engineering', 2),
      ('Earthworks & Earthworks Structures', 3),
      ('Tunnelling and Geotechnical Engineering', 4),
      ('Signalling and Train Control (Command & Control)', 5),
      ('Traction Power Supply & Electrification', 6),
      ('Telecommunications & SCADA', 7),
      ('Rolling Stock Design', 8),
      ('Mechanical, Electrical, and Plumbing (MEP)', 9),
      ('Systems Engineering and Integration', 10)
      ON CONFLICT (name) DO NOTHING;
    `);

    res.json({ message: "Discipline tables created successfully" });
  } catch (error: any) {
    res.status(500).json({
      error: "Discipline setup failed",
      details: error.message
    });
  }
});

app.get("/api/main-disciplines", async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, active, sort_order
      FROM main_disciplines
      WHERE active = true
      ORDER BY sort_order, name;
    `);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch main disciplines",
      details: error.message
    });
  }
});

app.get("/api/sub-disciplines/:mainDisciplineId", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, main_discipline_id, name, active, sort_order
      FROM sub_disciplines
      WHERE active = true
      AND main_discipline_id = $1
      ORDER BY sort_order, name;
      `,
      [req.params.mainDisciplineId]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch sub disciplines",
      details: error.message
    });
  }
});

app.post("/api/main-disciplines", async (req, res) => {
  try {
    const { name, sortOrder } = req.body;

    const result = await pool.query(
      `
      INSERT INTO main_disciplines (name, sort_order)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [name, sortOrder || 0]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to create main discipline",
      details: error.message
    });
  }
});

app.put("/api/main-disciplines/:id", async (req, res) => {
  try {
    const { name, active, sortOrder } = req.body;

    const result = await pool.query(
      `
      UPDATE main_disciplines
      SET name = $1,
          active = $2,
          sort_order = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
      `,
      [name, active, sortOrder || 0, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update main discipline",
      details: error.message
    });
  }
});

app.delete("/api/main-disciplines/:id", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE main_disciplines
      SET active = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
      `,
      [req.params.id]
    );

    res.json({ message: "Main discipline deactivated" });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to deactivate main discipline",
      details: error.message
    });
  }
});

app.post("/api/sub-disciplines", async (req, res) => {
  try {
    const { mainDisciplineId, name, sortOrder } = req.body;

    const result = await pool.query(
      `
      INSERT INTO sub_disciplines (
        main_discipline_id,
        name,
        sort_order
      )
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [mainDisciplineId, name, sortOrder || 0]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to create sub discipline",
      details: error.message
    });
  }
});

app.put("/api/sub-disciplines/:id", async (req, res) => {
  try {
    const { mainDisciplineId, name, active, sortOrder } = req.body;

    const result = await pool.query(
      `
      UPDATE sub_disciplines
      SET main_discipline_id = $1,
          name = $2,
          active = $3,
          sort_order = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
      `,
      [mainDisciplineId, name, active, sortOrder || 0, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update sub discipline",
      details: error.message
    });
  }
});

app.delete("/api/sub-disciplines/:id", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE sub_disciplines
      SET active = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
      `,
      [req.params.id]
    );

    res.json({ message: "Sub discipline deactivated" });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to deactivate sub discipline",
      details: error.message
    });
  }
});

app.post("/api/staff", async (req, res) => {
  try {
    const {
      employeeNumber,
      calledName,
      firstName,
      surname,
      email,
      mobile,
      country,
      town,
      mainDiscipline,
      subDiscipline,
      grade,
      availability,
      skills,
      industries,
      phases,
      roles,
      projects
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO staff (
        employee_number,
        called_name,
        first_name,
        surname,
        email,
        mobile,
        country,
        town,
        main_discipline,
        sub_discipline,
        grade,
        availability,
        skills,
        industries,
        phases,
        roles,
        projects
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      )
      RETURNING *;
      `,
      [
        employeeNumber || null,
        calledName,
        firstName,
        surname,
        email || null,
        mobile || null,
        country || null,
        town || null,
        mainDiscipline || null,
        subDiscipline || null,
        grade || null,
        availability || null,
        skills || [],
        industries || [],
        phases || [],
        roles || [],
        projects || []
      ]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to create staff",
      details: error.message
    });
  }
});

app.get("/api/staff", async (req, res) => {
  try {
    const {
      discipline,
      country,
      grade,
      availability,
      skill,
      industry,
      phase,
      role
    } = req.query;

    const result = await pool.query(
      `
      SELECT *
      FROM staff
      WHERE
        ($1::text IS NULL OR main_discipline = $1)
        AND ($2::text IS NULL OR country = $2)
        AND ($3::text IS NULL OR grade = $3)
        AND ($4::text IS NULL OR availability = $4)
        AND ($5::text IS NULL OR $5 = ANY(skills))
        AND ($6::text IS NULL OR $6 = ANY(industries))
        AND ($7::text IS NULL OR $7 = ANY(phases))
        AND ($8::text IS NULL OR $8 = ANY(roles))
      ORDER BY called_name;
      `,
      [
        discipline || null,
        country || null,
        grade || null,
        availability || null,
        skill || null,
        industry || null,
        phase || null,
        role || null
      ]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch staff",
      details: error.message
    });
  }
});

app.get("/api/dashboard", async (_, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*) FROM staff`);
    const available = await pool.query(
      `SELECT COUNT(*) FROM staff WHERE availability = 'Available'`
    );

    res.json({
      totalStaff: Number(total.rows[0].count),
      availableStaff: Number(available.rows[0].count)
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to load dashboard",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});