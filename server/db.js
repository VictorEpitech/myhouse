import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'codex.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    classe TEXT,
    affinity_house TEXT,
    official_team TEXT,
    correct_count INTEGER,
    total_technical_questions INTEGER,
    total_questions INTEGER,
    scores_json TEXT,
    answers_json TEXT,
    completed_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_results_email ON results(email);
`);

console.log(`[Database] SQLite connected at: ${dbPath}`);

export const getAllResults = () => {
  const query = db.prepare('SELECT * FROM results ORDER BY completed_at DESC');
  const rows = query.all();
  return rows.map(r => ({
    id: r.id,
    email: r.email,
    studentName: r.student_name,
    classe: r.classe,
    affinityHouse: r.affinity_house,
    officialTeam: r.official_team,
    correctCount: r.correct_count,
    totalTechnicalQuestions: r.total_technical_questions,
    totalQuestions: r.total_questions,
    scores: r.scores_json ? JSON.parse(r.scores_json) : {},
    answers: r.answers_json ? JSON.parse(r.answers_json) : [],
    completedAt: r.completed_at
  }));
};

export const getResultByEmail = (email) => {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const query = db.prepare('SELECT * FROM results WHERE email = ?');
  const r = query.get(cleanEmail);
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    studentName: r.student_name,
    classe: r.classe,
    affinityHouse: r.affinity_house,
    officialTeam: r.official_team,
    correctCount: r.correct_count,
    totalTechnicalQuestions: r.total_technical_questions,
    totalQuestions: r.total_questions,
    scores: r.scores_json ? JSON.parse(r.scores_json) : {},
    answers: r.answers_json ? JSON.parse(r.answers_json) : [],
    completedAt: r.completed_at
  };
};

export const saveResult = (data) => {
  const cleanEmail = data.email.trim().toLowerCase();
  
  // Check if result already exists for single-attempt rule
  const existing = getResultByEmail(cleanEmail);
  if (existing) {
    const err = new Error('Ce compte a déjà complété le rituel d\'attribution.');
    err.status = 409;
    throw err;
  }

  const completedAt = data.completedAt || new Date().toISOString();
  const scoresJson = JSON.stringify(data.scores || {});
  const answersJson = JSON.stringify(data.answers || []);

  const insert = db.prepare(`
    INSERT INTO results (
      email,
      student_name,
      classe,
      affinity_house,
      official_team,
      correct_count,
      total_technical_questions,
      total_questions,
      scores_json,
      answers_json,
      completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    cleanEmail,
    data.studentName || 'Étudiant Epitech',
    data.classe || '',
    data.affinityHouse || '',
    data.officialTeam || '',
    data.correctCount || 0,
    data.totalTechnicalQuestions || 25,
    data.totalQuestions || 35,
    scoresJson,
    answersJson,
    completedAt
  );

  return getResultByEmail(cleanEmail);
};

export const deleteResultByEmail = (email) => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const query = db.prepare('DELETE FROM results WHERE email = ?');
  query.run(cleanEmail);
  return true;
};
