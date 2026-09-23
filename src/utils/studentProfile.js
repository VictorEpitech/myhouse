// Utility to analyze student results and generate rich, friendly pedagogical recaps
// Covers Tech Culture (25 technical questions) and Personality Archetype (10 behavioral questions)

export const DOMAINS = {
  ALGO: {
    id: 'algo',
    name: 'Logique & Algorithmique',
    icon: '🧠',
    questionIds: [1, 5, 9, 12, 16, 19, 22, 26, 29], // 9 questions
    color: '#38bdf8'
  },
  WEB: {
    id: 'web',
    name: 'Réseaux, Web & Terminal',
    icon: '🌐',
    questionIds: [6, 18, 27, 28], // 4 questions
    color: '#818cf8'
  },
  SYSTEMS: {
    id: 'systems',
    name: 'Systèmes, Sécurité & Hardware',
    icon: '🛡️',
    questionIds: [3, 8, 11, 13, 14, 23, 25], // 7 questions
    color: '#c084fc'
  },
  HISTORY: {
    id: 'history',
    name: 'Culture Tech, Histoire & Epitech',
    icon: '📜',
    questionIds: [2, 15, 21, 24, 30], // 5 questions
    color: '#fbbf24'
  }
};

export const CULTURE_LEVELS = [
  {
    minScore: 21,
    title: 'Expert & Passionné Tech',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    color: '#10b981',
    icon: '🚀',
    summary: "Excellente maîtrise technique, réflexes algorithmiques affûtés et solide culture générale informatique. Un profil autonome et moteur, taillé pour concevoir des projets techniques ambitieux."
  },
  {
    minScore: 16,
    title: 'Solide Culture Numérique',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    color: '#06b6d4',
    icon: '⚡',
    summary: "Très bon bagage technologique, bonne vivacité d'esprit et compréhension claire des fondamentaux. Répond avec méthode et discernement face aux problèmes complexes."
  },
  {
    minScore: 11,
    title: 'Bonne Base & Curiosité Active',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    color: '#3b82f6',
    icon: '💡',
    summary: "Bases logiques saines et belle curiosité d'apprentissage. L'immersion pratique dans la pédagogie par projet d'Epitech et la Piscine vont lui permettre de progresser à pas de géant."
  },
  {
    minScore: 6,
    title: 'Apprenti Explorateur',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    color: '#f59e0b',
    icon: '🌱',
    summary: "Profil en phase de découverte avec une bonne intuition pratique. Beaucoup de potentiel qui ne demande qu'à s'épanouir par l'expérimentation, le code et l'entraide."
  },
  {
    minScore: 0,
    title: 'Novice Enthousiaste',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    color: '#94a3b8',
    icon: '🌟',
    summary: "Un regard neuf sur la tech. Prêt à acquérir sa culture et forger ses automatismes grâce à l'apprentissage actif 'Learning by doing' d'Epitech."
  }
];

export const ARCHETYPES = {
  timelords: {
    slug: 'timelords',
    color: '#4da3ff',
    title: "L'Orchestrateur & Maître du Temps",
    subtitle: 'DevOps, Résilience & Méthodologie',
    icon: '⏳',
    idealRole: 'Scrum Master & Pilote d\'Intégration / DevOps',
    bugReaction: 'Analyse méthodique des logs et reproduction étape par étape sans panique',
    workStyle: 'Workflow rigoureux, respect scrupuleux des jalons et automatisation maximale',
    traits: ['Anticipation des jalons', 'Sang-froid sous pression', 'Rigueur Git / CI-CD', 'Esprit d\'équipe structuré'],
    narrative: "Méthodique, posé et prévoyant. Dans une équipe de projet, c'est le garant du bon fonctionnement des rouages, de la clarté du code et de la livraison sans accroc. Il préfère concevoir une architecture propre et pérenne plutôt que de coder dans la précipitation."
  },
  gatekeepers: {
    slug: 'gatekeepers',
    color: '#a855f7',
    title: "Le Protecteur & Audacieux",
    subtitle: 'Cybersécurité, Rétro-ingénierie & Rigueur',
    icon: '🛡️',
    idealRole: 'Lead DevSecOps & Chasseur de Vulnérabilités / Pentest',
    bugReaction: 'Disséquer le code sous le capot, inspecter la mémoire et chercher la faille invisible',
    workStyle: 'Exploration approfondie, curiosité insatiable et persévérance face aux blocages ardus',
    traits: ['Curiosité sans limite', 'Sens critique affûté', 'Persévérance tenace', 'Audace technique'],
    narrative: "Instinctif et méticuleux, il ne se contente jamais d'un simple « ça compile ». Il cherche à comprendre le pourquoi des choses, sonde les limites du système et trouve des solutions là où d'autres baissent les bras. Toujours prêt à sécuriser l'équipe contre les imprévus."
  },
  codecrafters: {
    slug: 'codecrafters',
    color: '#a3e635',
    title: "Le Bâtisseur & Maker",
    subtitle: 'Développement Logiciel, Prototypage & Innovation',
    icon: '⚡',
    idealRole: 'Lead Prototypage, Bâtisseur de Features & Full-Stack',
    bugReaction: 'Tester immédiatement, console.log rapides, casser pour comprendre et réparer vite',
    workStyle: 'Prototypage express, apprentissage itératif par l\'erreur et passion du craft',
    traits: ['Vitesse d\'exécution', 'Créativité débridée', 'Pragmatisme agile', 'Énergie communicative'],
    narrative: "Artisan passionné du code, il aime voir les fonctionnalités naître concrètement sous ses doigts. Il préfère expérimenter, itérer rapidement et apprendre par l'erreur plutôt que d'attendre un plan théorique parfait. C'est l'étincelle d'énergie idéale pour dynamiser un hackathon !"
  },
  oracles: {
    slug: 'oracles',
    color: '#ff5a5a',
    title: "L'Analyste & Visionnaire",
    subtitle: 'Data Science, Algorithmie Avancée & Architecture',
    icon: '🔮',
    idealRole: 'Architecte Logiciel & Spécialiste Données / Algorithmes',
    bugReaction: 'Modélisation abstraite du flux de données, analyse logique et tests aux limites',
    workStyle: 'Prise de recul conceptuelle, optimisation élégante et vision globale',
    traits: ['Vision systémique', "Sens de l'abstraction", 'Optimisation poussée', 'Lucidité stratégique'],
    narrative: "Esprit conceptuel et visionnaire. Il excelle dans la modélisation, la manipulation intelligente des flux de données et la recherche de l'algorithme le plus élégant. Avant d'écrire la moindre ligne de code, il visualise déjà l'architecture cible et anticipe les scénarios futurs."
  }
};

/**
 * Computes a detailed, friendly pedagogical recap for a student
 * @param {Object} result - Result record from DB / storage
 * @param {Object} student - Student record from DB / students.json
 */
export function getStudentProfile(result, student) {
  if (!result) {
    return {
      hasResult: false,
      studentName: student?.fullName || 'Étudiant',
      officialHouseName: student?.teamName || 'Non assigné',
      classe: student?.classe || '2031 - PGE',
      culture: {
        score: 0,
        total: 25,
        percent: 0,
        level: CULTURE_LEVELS[CULTURE_LEVELS.length - 1],
        domains: Object.values(DOMAINS).map(d => ({ ...d, score: 0, total: d.questionIds.length, percent: 0 }))
      },
      personality: {
        title: 'Non calculé',
        subtitle: 'En attente du test',
        icon: '⏳',
        color: '#64748b',
        idealRole: 'Non défini',
        bugReaction: 'Non défini',
        workStyle: 'Non défini',
        traits: [],
        breakdown: []
      }
    };
  }

  // 1. Tech Culture Score & Level
  const score = result.correctCount !== undefined ? result.correctCount : 0;
  const total = result.totalTechnicalQuestions || 25;
  const percent = Math.round((score / Math.max(total, 1)) * 100);

  const level = CULTURE_LEVELS.find(lvl => score >= lvl.minScore) || CULTURE_LEVELS[CULTURE_LEVELS.length - 1];

  // 2. Domain Breakdown
  const answers = Array.isArray(result.answers) ? result.answers : [];
  const answerMap = {};
  answers.forEach(a => {
    answerMap[a.questionId] = a;
  });

  const domains = Object.values(DOMAINS).map(dom => {
    let domCorrect = 0;
    let domAnswered = 0;

    dom.questionIds.forEach(qId => {
      const a = answerMap[qId];
      if (a) {
        domAnswered++;
        if (a.isCorrect === true) {
          domCorrect++;
        }
      }
    });

    // If answers list is missing (e.g. simulated demo data), estimate proportionally from overall score
    const domTotal = dom.questionIds.length;
    const effectiveScore = answers.length > 0 
      ? domCorrect 
      : Math.round((score / total) * domTotal);

    return {
      ...dom,
      score: effectiveScore,
      total: domTotal,
      percent: Math.round((effectiveScore / domTotal) * 100)
    };
  });

  // 3. Personality Archetype & Affinity
  const scores = result.scores || {};
  let dominantSlug = 'timelords';
  let maxScore = -1;

  ['timelords', 'gatekeepers', 'codecrafters', 'oracles'].forEach(slug => {
    const s = scores[slug] || 0;
    if (s > maxScore) {
      maxScore = s;
      dominantSlug = slug;
    }
  });

  const archetype = ARCHETYPES[dominantSlug] || ARCHETYPES.timelords;

  // Compute breakdown %
  const totalScore = Object.values(scores).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const breakdown = [
    { slug: 'timelords', label: 'DevOps & Résilience', count: scores.timelords || 0, percent: Math.round(((scores.timelords || 0) / totalScore) * 100), color: '#4da3ff' },
    { slug: 'gatekeepers', label: 'Sécurité & Audit', count: scores.gatekeepers || 0, percent: Math.round(((scores.gatekeepers || 0) / totalScore) * 100), color: '#a855f7' },
    { slug: 'codecrafters', label: 'Prototypage & Code', count: scores.codecrafters || 0, percent: Math.round(((scores.codecrafters || 0) / totalScore) * 100), color: '#a3e635' },
    { slug: 'oracles', label: 'Data & Architecture', count: scores.oracles || 0, percent: Math.round(((scores.oracles || 0) / totalScore) * 100), color: '#ff5a5a' }
  ];

  // Specific personality question answers
  const personalityQuestions = answers.filter(a => a.isCorrect === null || a.isCorrect === undefined);

  return {
    hasResult: true,
    studentName: student?.fullName || result.studentName || 'Étudiant',
    email: student?.email || result.email,
    classe: student?.classe || result.classe || '2031 - PGE',
    officialTeam: student?.teamName || result.officialTeam || 'Non assigné',
    completedAt: result.completedAt,
    culture: {
      score,
      total,
      percent,
      level,
      domains
    },
    personality: {
      ...archetype,
      breakdown,
      personalityQuestions
    }
  };
}
