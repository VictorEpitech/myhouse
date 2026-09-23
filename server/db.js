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

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    classe TEXT,
    team_id INTEGER,
    team_name TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
`);

console.log(`[Database] SQLite connected at: ${dbPath}`);

export const getTeamNameById = (teamId) => {
  switch (teamId) {
    case 1: return 'Les Timelords';
    case 2: return 'Les Gatekeepers';
    case 3: return 'The CodeCrafters';
    case 4: return 'The Oracles';
    default: return 'Non assigné';
  }
};

// Seed students table from students.json if empty
const seedStudentsIfEmpty = () => {
  try {
    const countQuery = db.prepare('SELECT COUNT(*) as count FROM students');
    const { count } = countQuery.get();
    if (count === 0) {
      const jsonPath = path.join(process.cwd(), 'src', 'data', 'students.json');
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const list = JSON.parse(raw);
        const insert = db.prepare(`
          INSERT INTO students (id, first_name, last_name, full_name, email, classe, team_id, team_name, is_admin)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const s of list) {
          insert.run(
            s.id,
            s.firstName,
            s.lastName,
            s.fullName,
            s.email.toLowerCase().trim(),
            s.classe,
            s.teamId || null,
            s.teamName || 'Non assigné',
            s.isAdmin ? 1 : 0
          );
        }
        console.log(`[Database] Seeding initial: ${list.length} étudiants importés dans SQLite.`);
      }
    }
  } catch (err) {
    console.error('[Database] Erreur seed étudiants:', err);
  }
};

seedStudentsIfEmpty();

// Auto-sync any existing results with the student's official assigned house from students table
const syncResultsWithStudents = () => {
  try {
    db.exec(`
      UPDATE results 
      SET official_team = (
        SELECT team_name 
        FROM students 
        WHERE LOWER(students.email) = LOWER(results.email)
      )
      WHERE EXISTS (
        SELECT 1 
        FROM students 
        WHERE LOWER(students.email) = LOWER(results.email) 
        AND students.team_name IS NOT NULL 
        AND students.team_name != 'Non assigné'
      );
    `);
  } catch (err) {
    console.warn('[Database] Sync notice:', err);
  }
};

syncResultsWithStudents();

// --- RESULTS FUNCTIONS ---

export const getAllResults = () => {
  const query = db.prepare(`
    SELECT r.*, s.team_name as assigned_team_name 
    FROM results r
    LEFT JOIN students s ON LOWER(r.email) = LOWER(s.email)
    ORDER BY r.completed_at DESC
  `);
  const rows = query.all();
  return rows.map(r => ({
    id: r.id,
    email: r.email,
    studentName: r.student_name,
    classe: r.classe,
    officialTeam: (r.assigned_team_name && r.assigned_team_name !== 'Non assigné') ? r.assigned_team_name : r.official_team,
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
  const query = db.prepare(`
    SELECT r.*, s.team_name as assigned_team_name 
    FROM results r
    LEFT JOIN students s ON LOWER(r.email) = LOWER(s.email)
    WHERE LOWER(r.email) = ?
  `);
  const r = query.get(cleanEmail);
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    studentName: r.student_name,
    classe: r.classe,
    officialTeam: (r.assigned_team_name && r.assigned_team_name !== 'Non assigné') ? r.assigned_team_name : r.official_team,
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

  // Enforce baseline assigned house from students table if assigned
  const student = getStudentByEmail(cleanEmail);
  const officialTeam = (student && student.teamName && student.teamName !== 'Non assigné')
    ? student.teamName
    : (data.officialTeam || 'Non assigné');
  const studentName = data.studentName || student?.fullName || 'Étudiant Epitech';
  const classe = data.classe || student?.classe || '2031 - PGE';

  insert.run(
    cleanEmail,
    studentName,
    classe,
    data.affinityHouse || '',
    officialTeam,
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

// --- STUDENTS FUNCTIONS ---

export const getAllStudents = () => {
  const query = db.prepare('SELECT * FROM students ORDER BY last_name ASC, first_name ASC');
  const rows = query.all();
  return rows.map(r => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    fullName: r.full_name,
    email: r.email,
    classe: r.classe,
    teamId: r.team_id,
    teamName: r.team_name || 'Non assigné',
    isAdmin: Boolean(r.is_admin)
  }));
};

export const getStudentByEmail = (email) => {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const query = db.prepare('SELECT * FROM students WHERE email = ?');
  const r = query.get(cleanEmail);
  if (!r) return null;
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    fullName: r.full_name,
    email: r.email,
    classe: r.classe,
    teamId: r.team_id,
    teamName: r.team_name || 'Non assigné',
    isAdmin: Boolean(r.is_admin)
  };
};

export const saveStudent = (data) => {
  const cleanEmail = (data.email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email obligatoire');

  const firstName = (data.firstName || '').trim() || 'Étudiant';
  const lastName = (data.lastName || '').trim().toUpperCase() || 'EPITECH';
  const fullName = `${firstName} ${lastName}`;
  const teamId = data.teamId !== undefined && data.teamId !== null && data.teamId !== '' 
    ? parseInt(data.teamId, 10) 
    : null;
  const teamName = teamId ? getTeamNameById(teamId) : 'Non assigné';
  const classe = (data.classe || '2031 - PGE').trim();
  const isAdmin = data.isAdmin || cleanEmail === 'victor1.granger@epitech.eu' ? 1 : 0;
  const id = data.id || `student-${Date.now()}`;

  const stmt = db.prepare(`
    INSERT INTO students (id, first_name, last_name, full_name, email, classe, team_id, team_name, is_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      first_name=excluded.first_name,
      last_name=excluded.last_name,
      full_name=excluded.full_name,
      classe=excluded.classe,
      team_id=excluded.team_id,
      team_name=excluded.team_name,
      is_admin=excluded.is_admin
  `);

  stmt.run(id, firstName, lastName, fullName, cleanEmail, classe, teamId, teamName, isAdmin);

  // If student already has a result in results table, also update official_team in results
  try {
    const updateRes = db.prepare('UPDATE results SET official_team = ? WHERE email = ?');
    updateRes.run(teamName, cleanEmail);
  } catch (e) {
    console.warn('Sync result team notice:', e);
  }

  return getStudentByEmail(cleanEmail);
};

export const updateStudentHouse = (email, teamId) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const tId = teamId !== undefined && teamId !== null && teamId !== '' ? parseInt(teamId, 10) : null;
  const tName = getTeamNameById(tId);

  const stmt = db.prepare('UPDATE students SET team_id = ?, team_name = ? WHERE email = ?');
  stmt.run(tId, tName, cleanEmail);

  // Sync with results if already passed
  try {
    const updateRes = db.prepare('UPDATE results SET official_team = ? WHERE email = ?');
    updateRes.run(tName, cleanEmail);
  } catch (e) {}

  return getStudentByEmail(cleanEmail);
};

export const deleteStudent = (email) => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const query = db.prepare('DELETE FROM students WHERE email = ?');
  query.run(cleanEmail);
  return true;
};
