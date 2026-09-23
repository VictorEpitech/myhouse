import React, { useState, useEffect } from 'react';
import studentsData from '../data/students.json';
import housesData from '../data/houses.json';
import questionsData from '../data/questions.json';
import { 
  getStoredResults, 
  saveUserResult, 
  removeUserResult,
  fetchResultsFromDB, 
  fetchStudentsFromDB, 
  addStudentToDB, 
  updateStudentHouseInDB, 
  deleteStudentFromDB 
} from '../utils/storage';
import { getStudentProfile } from '../utils/studentProfile';
import { 
  Shield, Download, Search, Users, Award, 
  CheckCircle2, Clock, Sparkles, RefreshCw, ExternalLink,
  UserPlus, Edit3, Trash2, RotateCcw, Check, AlertCircle, X,
  ChevronDown, ChevronUp, Brain, Globe, Wrench, BookOpen, Target, Bug, Zap
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AdminDashboard() {
  const [students, setStudents] = useState(studentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState('all');
  const [selectedPromoFilter, setSelectedPromoFilter] = useState('all');
  const [resultsData, setResultsData] = useState({});
  const [inspectStudent, setInspectStudent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAnswersDetail, setShowAnswersDetail] = useState(false);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    classe: '2031 - PGE',
    customClasse: '',
    teamId: '1'
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [storedResults, dbStudents] = await Promise.all([
        fetchResultsFromDB(),
        fetchStudentsFromDB()
      ]);
      if (dbStudents && Array.isArray(dbStudents) && dbStudents.length > 0) {
        setStudents(dbStudents);
      }
      setResultsData(storedResults || getStoredResults());
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const promos = Array.from(
    new Set(students.map(s => s.classe).filter(Boolean))
  ).sort();

  const filteredStudents = students.filter(s => {
    const matchSearch = (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchHouse = selectedHouseFilter === 'all' 
      ? true 
      : selectedHouseFilter === 'unassigned' 
        ? !s.teamId 
        : s.teamId === parseInt(selectedHouseFilter);

    const matchPromo = selectedPromoFilter === 'all' 
      ? true 
      : s.classe === selectedPromoFilter;

    return matchSearch && matchHouse && matchPromo;
  });

  const totalStudents = students.filter(s => !s.isAdmin).length;
  const completedCount = Object.keys(resultsData).length;
  const countsByHouse = {
    1: students.filter(s => s.teamId === 1).length,
    2: students.filter(s => s.teamId === 2).length,
    3: students.filter(s => s.teamId === 3).length,
    4: students.filter(s => s.teamId === 4).length,
    unassigned: students.filter(s => !s.teamId && !s.isAdmin).length
  };

  const totalTechCount = questionsData.filter(q => q.correctOption).length;
  const totalQuestionsCount = questionsData.length;

  // Add Student Submit Handler
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    const cleanEmail = (newStudent.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      setAddError('L\'adresse email est obligatoire.');
      return;
    }

    if (!cleanEmail.endsWith('@epitech.eu')) {
      setAddError('L\'adresse doit être une adresse officielle Epitech (@epitech.eu)');
      return;
    }

    if (!newStudent.firstName.trim() || !newStudent.lastName.trim()) {
      setAddError('Le prénom et le nom sont obligatoires.');
      return;
    }

    const classe = newStudent.classe === 'custom' 
      ? (newStudent.customClasse.trim() || 'Epitech Moulins') 
      : newStudent.classe;

    const teamId = newStudent.teamId ? parseInt(newStudent.teamId, 10) : null;

    try {
      setIsSubmitting(true);
      const created = await addStudentToDB({
        firstName: newStudent.firstName.trim(),
        lastName: newStudent.lastName.trim().toUpperCase(),
        email: cleanEmail,
        classe,
        teamId
      });

      sounds.playSelect();
      setAddSuccess(`Étudiant ${created.fullName} enregistré avec succès dans ${created.teamName} !`);
      
      // Reload students
      await loadData();

      setTimeout(() => {
        setIsAddModalOpen(false);
        setNewStudent({
          firstName: '',
          lastName: '',
          email: '',
          classe: '2031 - PGE',
          customClasse: '',
          teamId: '1'
        });
        setAddSuccess('');
      }, 1200);
    } catch (err) {
      setAddError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Student's House Attribution
  const handleUpdateStudentHouse = async (email, newTeamId) => {
    try {
      sounds.playSelect();
      const updated = await updateStudentHouseInDB(email, newTeamId);
      
      setStudents(prev => prev.map(s => 
        s.email.toLowerCase() === email.toLowerCase() 
          ? { ...s, teamId: updated.teamId, teamName: updated.teamName } 
          : s
      ));

      if (inspectStudent && inspectStudent.student.email.toLowerCase() === email.toLowerCase()) {
        setInspectStudent(prev => ({
          ...prev,
          student: {
            ...prev.student,
            teamId: updated.teamId,
            teamName: updated.teamName
          }
        }));
      }
    } catch (e) {
      console.error('Error updating house:', e);
    }
  };

  // Reset Test Result for Student (allows retaking the quiz)
  const handleResetTest = async (studentEmail, studentName) => {
    const displayName = studentName ? `${studentName} (${studentEmail})` : studentEmail;
    if (window.confirm(`Confirmez-vous la réinitialisation du test pour ${displayName} ?\n\nSes réponses et son score seront effacés du Codex. L'étudiant pourra repasser le rituel d'attribution.`)) {
      sounds.playSelect();
      await removeUserResult(studentEmail);
      const cleanEmail = studentEmail.toLowerCase().trim();
      const altEmail = cleanEmail.includes('1.') ? cleanEmail.replace('1.', '.') : cleanEmail.replace('.', '1.');
      setResultsData(prev => {
        const next = { ...prev };
        delete next[cleanEmail];
        delete next[altEmail];
        return next;
      });
      if (inspectStudent && (inspectStudent.student.email.toLowerCase() === cleanEmail || inspectStudent.student.email.toLowerCase() === altEmail)) {
        setInspectStudent(prev => ({
          ...prev,
          result: null
        }));
      }
    }
  };

  // Delete Student completely from Codex
  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Confirmez-vous la suppression définitive de ${student.fullName} (${student.email}) du Codex ?\n\nAttention : cette action supprimera l'étudiant ainsi que son résultat de test éventuel.`)) {
      sounds.playSelect();
      await deleteStudentFromDB(student.email);
      await removeUserResult(student.email);
      const cleanEmail = student.email.toLowerCase().trim();
      setStudents(prev => prev.filter(s => s.email.toLowerCase() !== cleanEmail));
      setResultsData(prev => {
        const next = { ...prev };
        delete next[cleanEmail];
        return next;
      });
      if (inspectStudent?.student.email.toLowerCase() === cleanEmail) {
        setInspectStudent(null);
      }
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    sounds.playSelect();
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `Nom,Prénom,Email,Promotion,Maison Officielle,Score Énigmes (/${totalTechCount}),Niveau Culture Info,Logique & Algo (/9),Réseaux & Web (/4),Systèmes & Hardware (/7),Culture Tech (/5),Archétype Personnalité,Rôle Idéal Projet,Réflexe Bug,DevOps %,Sécurité %,Prototypage %,Data %,Date Complétion\n`;

    students.filter(s => !s.isAdmin).forEach(s => {
      const res = resultsData[s.email.toLowerCase()] || null;
      const prof = getStudentProfile(res, s);
      const row = [
        `"${s.lastName}"`,
        `"${s.firstName}"`,
        `"${s.email}"`,
        `"${s.classe}"`,
        `"${s.teamName}"`,
        res && res.correctCount !== undefined ? `${res.correctCount}/${res.totalTechnicalQuestions || totalTechCount}` : 'N/A',
        `"${prof.hasResult ? prof.culture.level.title : 'Non passé'}"`,
        prof.hasResult ? `${prof.culture.domains[0]?.score || 0}/9` : 'N/A',
        prof.hasResult ? `${prof.culture.domains[1]?.score || 0}/4` : 'N/A',
        prof.hasResult ? `${prof.culture.domains[2]?.score || 0}/7` : 'N/A',
        prof.hasResult ? `${prof.culture.domains[3]?.score || 0}/5` : 'N/A',
        `"${prof.hasResult ? prof.personality.title : 'Non calculé'}"`,
        `"${prof.hasResult ? prof.personality.idealRole : 'N/A'}"`,
        `"${prof.hasResult ? prof.personality.bugReaction : 'N/A'}"`,
        prof.hasResult ? (prof.personality.breakdown[0]?.percent || 0) : 0,
        prof.hasResult ? (prof.personality.breakdown[1]?.percent || 0) : 0,
        prof.hasResult ? (prof.personality.breakdown[2]?.percent || 0) : 0,
        prof.hasResult ? (prof.personality.breakdown[3]?.percent || 0) : 0,
        `"${res?.completedAt ? new Date(res.completedAt).toLocaleString('fr-FR') : ''}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `resultats_epitech_codex_${totalQuestionsCount}_questions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Seed Demo Data for admin preview
  const handleSeedDemoData = () => {
    sounds.playSelect();
    const mockHouses = ['Les Timelords', 'Les Gatekeepers', 'The CodeCrafters', 'The Oracles'];
    const candidates = students.filter(s => !s.isAdmin).slice(0, 15);
    
    candidates.forEach((s, idx) => {
      const aff = mockHouses[idx % mockHouses.length];
      const correct = Math.floor(Math.random() * 8) + 16; // 16 to 23 correct
      saveUserResult(s.email, {
        studentName: s.fullName,
        classe: s.classe,
        affinityHouse: aff,
        officialTeam: s.teamName,
        correctCount: correct,
        totalTechnicalQuestions: totalTechCount,
        totalQuestions: totalQuestionsCount,
        scores: {
          timelords: Math.floor(Math.random() * 8) + 4,
          gatekeepers: Math.floor(Math.random() * 8) + 4,
          codecrafters: Math.floor(Math.random() * 8) + 4,
          oracles: Math.floor(Math.random() * 8) + 4
        },
        answers: []
      });
    });

    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      
      {/* Top Banner with Admin Identity */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/70 via-slate-900 to-[#0c1322] border border-red-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 text-white shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Pôle Pédagogique Epitech Moulins
              </span>
              <span className="text-xs text-slate-400 font-mono">victor1.granger@epitech.eu</span>
              {Boolean(resultsData['victor1.granger@epitech.eu'] || resultsData['victor.granger@epitech.eu']) && (
                <button
                  onClick={() => handleResetTest('victor1.granger@epitech.eu', 'Victor Granger')}
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition"
                  title="Réinitialiser mon propre test pour le repasser"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser mon test</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-cyber font-extrabold text-white mt-1">
              Résultats du QCM ({totalQuestionsCount} Questions) & Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Supervision des résultats, gestion de la promotion et attribution confidentielle des Maisons.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => { sounds.playSelect(); setIsAddModalOpen(true); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition transform hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Ajouter un Étudiant</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => { sounds.playSelect(); loadData(); }}
            title="Rafraîchir les résultats depuis la base de données"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser DB</span>
          </button>

          <button
            onClick={handleSeedDemoData}
            title="Simuler des réponses pour observer les répartitions"
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Démo QCM</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Étudiants</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-cyber text-white">
            {totalStudents}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {completedCount} tests passés
          </div>
        </div>

        {/* Timelords */}
        <div className="p-4 rounded-2xl bg-[#0b1622] border border-[#4da3ff]/40 shadow-md">
          <div className="flex items-center justify-between text-[#4da3ff] text-xs font-mono">
            <span>Timelords</span>
            <span className="w-2 h-2 rounded-full bg-[#4da3ff]"></span>
          </div>
          <div className="mt-2 text-2xl font-bold font-cyber text-[#4da3ff]">
            {countsByHouse[1]}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Maison 1</div>
        </div>

        {/* Gatekeepers */}
        <div className="p-4 rounded-2xl bg-[#170e1e] border border-[#fb923c]/40 shadow-md">
          <div className="flex items-center justify-between text-[#fb923c] text-xs font-mono">
            <span>Gatekeepers</span>
            <span className="w-2 h-2 rounded-full bg-[#fb923c]"></span>
          </div>
          <div className="mt-2 text-2xl font-bold font-cyber text-[#fb923c]">
            {countsByHouse[2]}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Maison 2</div>
        </div>

        {/* CodeCrafters */}
        <div className="p-4 rounded-2xl bg-[#0e1a14] border border-[#a3e635]/40 shadow-md">
          <div className="flex items-center justify-between text-[#a3e635] text-xs font-mono">
            <span>CodeCrafters</span>
            <span className="w-2 h-2 rounded-full bg-[#a3e635]"></span>
          </div>
          <div className="mt-2 text-2xl font-bold font-cyber text-[#a3e635]">
            {countsByHouse[3]}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Maison 3</div>
        </div>

        {/* Oracles */}
        <div className="p-4 rounded-2xl bg-[#1c0f12] border border-[#ff5a5a]/40 shadow-md">
          <div className="flex items-center justify-between text-[#ff5a5a] text-xs font-mono">
            <span>Oracles</span>
            <span className="w-2 h-2 rounded-full bg-[#ff5a5a]"></span>
          </div>
          <div className="mt-2 text-2xl font-bold font-cyber text-[#ff5a5a]">
            {countsByHouse[4]}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Maison 4</div>
        </div>

        {/* Unassigned */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono">
            <span>Non assignés</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-cyber text-amber-400">
            {countsByHouse.unassigned}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">À ventiler</div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* House Filter */}
          <select
            value={selectedHouseFilter}
            onChange={(e) => setSelectedHouseFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Toutes les Maisons</option>
            <option value="1">Maison 1 : Les Timelords</option>
            <option value="2">Maison 2 : Les Gatekeepers</option>
            <option value="3">Maison 3 : The CodeCrafters</option>
            <option value="4">Maison 4 : The Oracles</option>
            <option value="unassigned">Non assignés uniquement</option>
          </select>

          {/* Promo Filter */}
          <select
            value={selectedPromoFilter}
            onChange={(e) => setSelectedPromoFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Toutes les Promotions</option>
            {promos.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

        </div>

      </div>

      {/* Main Students & Results Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Étudiant</th>
                <th className="p-4">Promotion</th>
                <th className="p-4">Maison Attribuée</th>
                <th className="p-4">Score Énigmes (/{totalTechCount})</th>
                <th className="p-4">Type de Personnalité</th>
                <th className="p-4 text-center">Statut Test</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredStudents.map(student => {
                const res = resultsData[student.email.toLowerCase()];
                const house = housesData.find(h => h.id === student.teamId);
                const hasCompleted = !!res;

                return (
                  <tr 
                    key={student.id || student.email}
                    className="hover:bg-slate-900/40 transition group"
                  >
                    <td 
                      className="p-4 cursor-pointer"
                      onClick={() => setInspectStudent({ student, result: res })}
                    >
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition">
                        {student.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {student.email}
                      </div>
                    </td>

                    <td className="p-4 text-slate-300 font-mono">
                      {student.classe}
                    </td>

                    {/* House Attribution Dropdown inline */}
                    <td className="p-4">
                      <select
                        value={student.teamId || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : null;
                          handleUpdateStudentHouse(student.email, val);
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-slate-950 focus:outline-none cursor-pointer transition"
                        style={{
                          color: house ? house.color : '#f59e0b',
                          borderColor: house ? `${house.color}40` : '#b4530940',
                          backgroundColor: house ? `${house.color}15` : '#451a0320'
                        }}
                      >
                        <option value="" className="bg-slate-900 text-amber-400">Non assigné</option>
                        <option value="1" className="bg-slate-900 text-[#4da3ff]">1 : Les Timelords</option>
                        <option value="2" className="bg-slate-900 text-[#fb923c]">2 : Les Gatekeepers</option>
                        <option value="3" className="bg-slate-900 text-[#a3e635]">3 : The CodeCrafters</option>
                        <option value="4" className="bg-slate-900 text-[#ff5a5a]">4 : The Oracles</option>
                      </select>
                    </td>

                    {/* Logic Score with Culture Level Badge */}
                    <td className="p-4">
                      {hasCompleted && res.correctCount !== undefined ? (
                        (() => {
                          const prof = getStudentProfile(res, student);
                          return (
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 inline-block">
                                {res.correctCount} / {res.totalTechnicalQuestions || totalTechCount}
                              </span>
                              <div className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
                                <span>{prof.culture.level.icon}</span>
                                <span className="truncate max-w-[130px]" title={prof.culture.level.title}>
                                  {prof.culture.level.title}
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">—</span>
                      )}
                    </td>

                    {/* Type de Personnalité */}
                    <td className="p-4">
                      {hasCompleted ? (
                        (() => {
                          const prof = getStudentProfile(res, student);
                          return (
                            <div className="space-y-0.5">
                              <span 
                                className="font-bold text-xs flex items-center gap-1.5"
                                style={{ color: prof.personality.color }}
                              >
                                <span>{prof.personality.icon}</span>
                                <span className="truncate max-w-[160px]" title={prof.personality.title}>
                                  {prof.personality.title}
                                </span>
                              </span>
                              <div className="text-[10px] text-slate-400 truncate max-w-[160px]" title={prof.personality.subtitle}>
                                {prof.personality.subtitle}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">En attente du test</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      {hasCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Fait
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                          Non passé
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectStudent({ student, result: res })}
                          title="Inspecter le dossier"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {hasCompleted && (
                          <button
                            onClick={() => handleResetTest(student.email, student.fullName)}
                            title="Réinitialiser le test (autorise un nouveau passage)"
                            className="p-1.5 rounded-lg text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/40 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          title="Supprimer définitivement cet étudiant du Codex"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AJOUTER UN ÉTUDIANT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0b1322] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl shadow-cyan-950/50">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-cyber font-bold text-white">
                    Ajouter un Étudiant
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Enregistrement au Codex & Attribution d'une Maison
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Banners */}
            {addError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{addSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs font-mono">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Lucas"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: DURAND"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Officiel Epitech *</label>
                <input
                  type="email"
                  required
                  placeholder="prenom.nom@epitech.eu"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Promotion / Classe *</label>
                <select
                  value={newStudent.classe}
                  onChange={(e) => setNewStudent({ ...newStudent, classe: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="2031 - PGE">2031 - PGE (Tek1 Première Année)</option>
                  <option value="2030 - PGE">2030 - PGE (Tek2)</option>
                  <option value="2029 - PGE">2029 - PGE (Tek3)</option>
                  <option value="243 - Bachelor 2029">243 - Bachelor 2029</option>
                  <option value="242 - Bachelor 2028">242 - Bachelor 2028</option>
                  <option value="237 - MSC 2029">237 - MSC 2029</option>
                  <option value="230 - MSC 2027">230 - MSC 2027</option>
                  <option value="241 - Web@cademie 2027">241 - Web@cademie 2027</option>
                  <option value="custom">Autre promotion (saisie libre)...</option>
                </select>
              </div>

              {newStudent.classe === 'custom' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom de la promotion personnalisée</label>
                  <input
                    type="text"
                    placeholder="ex: 2032 - PGE"
                    value={newStudent.customClasse}
                    onChange={(e) => setNewStudent({ ...newStudent, customClasse: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Maison Attribuée (Codex)</label>
                <select
                  value={newStudent.teamId}
                  onChange={(e) => setNewStudent({ ...newStudent, teamId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="1">Maison 1 : Les Timelords (Bleu)</option>
                  <option value="2">Maison 2 : Les Gatekeepers (Violet / Orange)</option>
                  <option value="3">Maison 3 : The CodeCrafters (Vert / Jaune)</option>
                  <option value="4">Maison 4 : The Oracles (Rouge / Pourpre)</option>
                  <option value="">Non assigné (En attente)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-cyber font-bold shadow-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer au Codex'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* INSPECT STUDENT MODAL - RECAP SYMPATHIQUE CULTURE & PERSONNALITÉ */}
      {inspectStudent && (() => {
        const prof = getStudentProfile(inspectStudent.result, inspectStudent.student);
        const houseObj = housesData.find(h => h.id === inspectStudent.student.teamId);

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-[#0b1322] border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-5 sm:p-7 space-y-6 shadow-2xl shadow-cyan-950/60 max-h-[92vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Dossier Pédagogique Étudiant
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{inspectStudent.student.classe}</span>
                  </div>
                  <h3 className="text-2xl font-cyber font-extrabold text-white">
                    {inspectStudent.student.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{inspectStudent.student.email}</p>
                </div>
                
                <button
                  onClick={() => { setInspectStudent(null); setShowAnswersDetail(false); }}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Attribution Maison Officielle (Compétition Epitech) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Maison Officielle de Rattachement (Compétition Codex) :</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    L'équipe officielle de l'étudiant reste strictement déterminée par son affectation de base.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={inspectStudent.student.teamId || ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : null;
                      handleUpdateStudentHouse(inspectStudent.student.email, val);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold font-mono border bg-slate-950 focus:outline-none cursor-pointer shadow transition"
                    style={{
                      color: houseObj ? houseObj.color : '#f59e0b',
                      borderColor: houseObj ? `${houseObj.color}60` : '#b4530960',
                      backgroundColor: houseObj ? `${houseObj.color}15` : '#451a0320'
                    }}
                  >
                    <option value="" className="bg-slate-900 text-amber-400">Non assigné</option>
                    <option value="1" className="bg-slate-900 text-[#4da3ff]">Maison 1 : Les Timelords</option>
                    <option value="2" className="bg-slate-900 text-[#fb923c]">Maison 2 : Les Gatekeepers</option>
                    <option value="3" className="bg-slate-900 text-[#a3e635]">Maison 3 : The CodeCrafters</option>
                    <option value="4" className="bg-slate-900 text-[#ff5a5a]">Maison 4 : The Oracles</option>
                  </select>
                </div>
              </div>

              {/* Status Banner if not completed */}
              {!prof.hasResult && (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                  <div className="font-semibold text-white text-sm">Le rituel d'attribution n'a pas encore été passé</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Dès que l'étudiant aura complété les {totalQuestionsCount} questions sur son interface, son analyse de culture informatique et son profil de personnalité s'afficheront automatiquement ici.
                  </p>
                </div>
              )}

              {/* Rich Profiling Content */}
              {prof.hasResult && (
                <div className="space-y-5">
                  
                  {/* VOLET 1 : CULTURE INFORMATIQUE & FONDAMENTAUX */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1424] to-[#070d18] border border-cyan-500/30 space-y-4 shadow-xl">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-cyan-400" />
                        <h4 className="font-cyber font-bold text-white text-base">
                          Culture Informatique & Fondamentaux Tech
                        </h4>
                      </div>
                      
                      {/* Overall Level Badge */}
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${prof.culture.level.badge}`}>
                        <span>{prof.culture.level.icon}</span>
                        <span>{prof.culture.score} / {prof.culture.total}</span>
                        <span>•</span>
                        <span>{prof.culture.level.title}</span>
                      </span>
                    </div>

                    {/* Friendly summary */}
                    <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      💡 {prof.culture.level.summary}
                    </p>

                    {/* 4 Domain Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {prof.culture.domains.map(dom => (
                        <div 
                          key={dom.id} 
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                              <span>{dom.icon}</span>
                              <span>{dom.name}</span>
                            </span>
                            <span className="font-mono font-bold text-xs" style={{ color: dom.color }}>
                              {dom.score} / {dom.total}
                            </span>
                          </div>

                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${dom.percent}%`,
                                backgroundColor: dom.color 
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <span>Taux de réussite</span>
                            <span>{dom.percent}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* VOLET 2 : TYPE DE PERSONNALITÉ & PROFIL D'INGÉNIEUR */}
                  <div 
                    className="p-5 rounded-2xl border space-y-4 shadow-xl"
                    style={{
                      background: `linear-gradient(180deg, ${prof.personality.color}15 0%, #070d18 100%)`,
                      borderColor: `${prof.personality.color}45`
                    }}
                  >
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{prof.personality.icon}</span>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                            Archétype & Méthode d'Ingénieur
                          </div>
                          <h4 
                            className="font-cyber font-bold text-lg leading-tight"
                            style={{ color: prof.personality.color }}
                          >
                            {prof.personality.title}
                          </h4>
                        </div>
                      </div>

                      <span 
                        className="text-xs font-mono font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 self-start sm:self-auto"
                        style={{
                          color: prof.personality.color,
                          borderColor: `${prof.personality.color}50`,
                          backgroundColor: `${prof.personality.color}15`
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Profil Comportemental
                      </span>
                    </div>

                    {/* Friendly Narrative Description */}
                    <div className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                        Comportement & Rôle dans l'équipe :
                      </div>
                      <p>{prof.personality.narrative}</p>
                    </div>

                    {/* Behavioral Attributes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                      
                      {/* Ideal role */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Rôle Idéal Hackathon</span>
                        </div>
                        <div className="text-slate-200 font-sans font-semibold text-[11px] leading-snug">
                          {prof.personality.idealRole}
                        </div>
                      </div>

                      {/* Bug reaction */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Bug className="w-3.5 h-3.5 text-rose-400" />
                          <span>Réflexe Face aux Bugs</span>
                        </div>
                        <div className="text-slate-200 font-sans text-[11px] leading-snug">
                          {prof.personality.bugReaction}
                        </div>
                      </div>

                      {/* Work style */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Style de Travail</span>
                        </div>
                        <div className="text-slate-200 font-sans text-[11px] leading-snug">
                          {prof.personality.workStyle}
                        </div>
                      </div>

                    </div>

                    {/* Traits Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Points forts :</span>
                      {prof.personality.traits.map((trait, i) => (
                        <span 
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border text-slate-300"
                          style={{ borderColor: `${prof.personality.color}35` }}
                        >
                          ✦ {trait}
                        </span>
                      ))}
                    </div>

                    {/* Sensibilités méthodologiques */}
                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                        Sensibilités méthodologiques :
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {prof.personality.breakdown.map(b => (
                          <div key={b.slug} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span style={{ color: b.color }} className="font-semibold truncate">{b.label}</span>
                              <span className="text-slate-400">{b.percent}%</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${b.percent}%`, backgroundColor: b.color }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* VOLET 3 : DÉTAIL DES 35 QUESTIONS (COLLAPSIBLE) */}
                  {inspectStudent.result?.answers && inspectStudent.result.answers.length > 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                      <button
                        onClick={() => setShowAnswersDetail(!showAnswersDetail)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-900/60 transition"
                      >
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          <span>Détail complet des choix de l'étudiant ({inspectStudent.result.answers.length} Questions)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                          <span>{showAnswersDetail ? 'Masquer' : 'Afficher'}</span>
                          {showAnswersDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {showAnswersDetail && (
                        <div className="p-4 border-t border-slate-800 space-y-1.5 max-h-72 overflow-y-auto">
                          {inspectStudent.result.answers.map((ans, i) => (
                            <div 
                              key={i} 
                              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                                  Q{ans.questionId}
                                </span>
                                <span className="text-slate-400 font-mono text-[11px] truncate">
                                  {ans.category} :
                                </span>
                                <span className="text-white font-medium truncate">
                                  {ans.optionLabel}
                                </span>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                {ans.isCorrect === true && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    ✓ Juste
                                  </span>
                                )}
                                {ans.isCorrect === false && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    ✗ Faux
                                  </span>
                                )}
                                {ans.isCorrect === null && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    ✦ Profil
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {prof.hasResult && (
                    <button
                      onClick={() => handleResetTest(inspectStudent.student.email, inspectStudent.student.fullName)}
                      className="px-3.5 py-2 rounded-xl text-xs text-amber-400 hover:text-white hover:bg-amber-950/50 border border-amber-500/30 transition flex items-center gap-1.5 font-mono"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Réinitialiser le test (Reset)</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteStudent(inspectStudent.student)}
                    className="px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:text-white hover:bg-rose-950/50 border border-rose-500/30 transition flex items-center gap-1.5 font-mono"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer l'étudiant du Codex</span>
                  </button>
                </div>

                <button
                  onClick={() => { setInspectStudent(null); setShowAnswersDetail(false); }}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Fermer
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
