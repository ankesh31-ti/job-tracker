import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const APP_PASSWORD = process.env.APP_PASSWORD || "changeme";

function requireAuth(req, res, next) {
  const provided = req.header("x-app-password");
  if (!provided || provided !== APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (password === APP_PASSWORD) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: "Incorrect password" });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/applications", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM applications ORDER BY date_applied DESC, id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

app.post("/api/applications", requireAuth, async (req, res) => {
  const {
    company,
    date_applied,
    cv_version,
    cv_link,
    jd_text,
    jd_link,
    channel,
    status,
    notes,
  } = req.body || {};

  if (!company || !date_applied) {
    return res.status(400).json({ error: "company and date_applied are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO applications
        (company, date_applied, cv_version, cv_link, jd_text, jd_link, channel, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        company,
        date_applied,
        cv_version || null,
        cv_link || null,
        jd_text || null,
        jd_link || null,
        channel || null,
        status || "Applied",
        notes || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create application" });
  }
});

app.put("/api/applications/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    company,
    date_applied,
    cv_version,
    cv_link,
    jd_text,
    jd_link,
    channel,
    status,
    notes,
  } = req.body || {};

  try {
    const { rows } = await pool.query(
      `UPDATE applications SET
        company=$1, date_applied=$2, cv_version=$3, cv_link=$4,
        jd_text=$5, jd_link=$6, channel=$7, status=$8, notes=$9
       WHERE id=$10
       RETURNING *`,
      [
        company,
        date_applied,
        cv_version || null,
        cv_link || null,
        jd_text || null,
        jd_link || null,
        channel || null,
        status || "Applied",
        notes || null,
        id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update application" });
  }
});

app.delete("/api/applications/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM applications WHERE id=$1", [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Job tracker backend running on port ${PORT}`);
});
