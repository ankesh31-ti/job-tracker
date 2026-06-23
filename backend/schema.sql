CREATE TABLE IF NOT EXISTS applications (
  id            SERIAL PRIMARY KEY,
  company       TEXT NOT NULL,
  date_applied  DATE NOT NULL,
  cv_version    TEXT,
  cv_link       TEXT,
  jd_text       TEXT,
  jd_link       TEXT,
  channel       TEXT,
  status        TEXT DEFAULT 'Applied',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_company ON applications (company);
CREATE INDEX IF NOT EXISTS idx_applications_date ON applications (date_applied);
