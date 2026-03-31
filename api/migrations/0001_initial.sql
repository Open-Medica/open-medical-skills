-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT DEFAULT 'Open Medical Skills Community',
  repository TEXT,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array
  version TEXT DEFAULT '1.0.0',
  license TEXT DEFAULT 'MIT',
  evidence_level TEXT DEFAULT 'moderate',
  safety_classification TEXT DEFAULT 'safe',
  specialty TEXT, -- JSON array
  reviewer TEXT DEFAULT 'Pending Review',
  date_added TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_safety ON skills(safety_classification);
CREATE INDEX IF NOT EXISTS idx_skills_verified ON skills(verified);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

-- Full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
  name,
  display_name,
  description,
  tags,
  content='skills',
  content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS skills_ai AFTER INSERT ON skills BEGIN
  INSERT INTO skills_fts(rowid, name, display_name, description, tags)
  VALUES (new.id, new.name, new.display_name, new.description, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS skills_ad AFTER DELETE ON skills BEGIN
  INSERT INTO skills_fts(skills_fts, rowid, name, display_name, description, tags)
  VALUES ('delete', old.id, old.name, old.display_name, old.description, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS skills_au AFTER UPDATE ON skills BEGIN
  INSERT INTO skills_fts(skills_fts, rowid, name, display_name, description, tags)
  VALUES ('delete', old.id, old.name, old.display_name, old.description, old.tags);
  INSERT INTO skills_fts(rowid, name, display_name, description, tags)
  VALUES (new.id, new.name, new.display_name, new.description, new.tags);
END;
