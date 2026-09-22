import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { getAllResults, getResultByEmail, saveResult, deleteResultByEmail } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'codex-epitech-moulins',
    timestamp: new Date().toISOString()
  });
});

// GET all results (for Admin Dashboard)
app.get('/api/results', (req, res) => {
  try {
    const results = getAllResults();
    // Return dictionary indexed by lowercased email for instant frontend lookup
    const resultsDict = {};
    results.forEach(r => {
      resultsDict[r.email.toLowerCase()] = r;
    });
    res.json({ success: true, count: results.length, data: resultsDict, list: results });
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET result for specific email
app.get('/api/results/:email', (req, res) => {
  try {
    const email = req.params.email;
    const result = getResultByEmail(email);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Aucun résultat trouvé pour cet étudiant' });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error getting student result:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST submit quiz result (Strict single-attempt enforced by DB)
app.post('/api/results', (req, res) => {
  try {
    const { email, studentName, classe, affinityHouse, officialTeam, correctCount, totalTechnicalQuestions, totalQuestions, scores, answers } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email obligatoire' });
    }

    const saved = saveResult({
      email,
      studentName,
      classe,
      affinityHouse,
      officialTeam,
      correctCount,
      totalTechnicalQuestions,
      totalQuestions,
      scores,
      answers,
      completedAt: new Date().toISOString()
    });

    console.log(`[Codex] Nouveau résultat enregistré pour: ${email} (Score: ${correctCount}/${totalTechnicalQuestions})`);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ success: false, error: err.message });
    }
    console.error('Error saving result:', err);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'enregistrement du résultat' });
  }
});

// DELETE result (Admin reset for testing)
app.delete('/api/results/:email', (req, res) => {
  try {
    const email = req.params.email;
    deleteResultByEmail(email);
    console.log(`[Codex Admin] Résultat supprimé pour: ${email}`);
    res.json({ success: true, message: `Résultat réinitialisé pour ${email}` });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({ success: false, error: 'Erreur suppression' });
  }
});

// Serve frontend in production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA Fallback for client-side routing
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  console.log('[Server Notice] Frontend dist/ folder not found. Run "npm run build" to build static client.');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Codex Server] Serveur démarré sur http://0.0.0.0:${PORT} (Node ${process.version})`);
});
