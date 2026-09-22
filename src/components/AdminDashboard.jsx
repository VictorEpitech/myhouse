import React, { useState, useEffect } from 'react';
import studentsData from '../data/students.json';
import housesData from '../data/houses.json';
import questionsData from '../data/questions.json';
import { getStoredResults, saveUserResult, fetchResultsFromDB } from '../utils/storage';
import { 
  Shield, Download, Search, Users, Award, 
  CheckCircle2, Clock, Sparkles, RefreshCw, ExternalLink 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState('all');
  const [selectedPromoFilter, setSelectedPromoFilter] = useState('all');
  const [resultsData, setResultsData] = useState({});
  const [inspectStudent, setInspectStudent] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const stored = await fetchResultsFromDB();
    setResultsData(stored || getStoredResults());
  };

  const promos = Array.from(new Set(studentsData.filter(s => !s.isAdmin).map(s => s.classe))).sort();

  const filteredStudents = studentsData.filter(s => {
    if (s.isAdmin) return false;

    const matchSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.email.toLowerCase().includes(searchTerm.toLowerCase());

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

  const totalStudents = studentsData.filter(s => !s.isAdmin).length;
  const completedCount = Object.keys(resultsData).length;
  const countsByHouse = {
    1: studentsData.filter(s => s.teamId === 1).length,
    2: studentsData.filter(s => s.teamId === 2).length,
    3: studentsData.filter(s => s.teamId === 3).length,
    4: studentsData.filter(s => s.teamId === 4).length,
    unassigned: studentsData.filter(s => !s.teamId && !s.isAdmin).length
  };

  const totalTechCount = questionsData.filter(q => q.correctOption).length;
  const totalQuestionsCount = questionsData.length;

  // Export to CSV
  const handleExportCSV = () => {
    sounds.playSelect();
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `Nom,Prénom,Email,Promotion,Maison Officielle,Score Énigmes (/${totalTechCount}),Affinité Calculée,Affinité Timelord,Affinité Gatekeeper,Affinité CodeCrafter,Affinité Oracle,Date Complétion\n`;

    studentsData.filter(s => !s.isAdmin).forEach(s => {
      const res = resultsData[s.email.toLowerCase()] || {};
      const sc = res.scores || {};
      const row = [
        `"${s.lastName}"`,
        `"${s.firstName}"`,
        `"${s.email}"`,
        `"${s.classe}"`,
        `"${s.teamName}"`,
        res.correctCount !== undefined ? `${res.correctCount}/${res.totalTechnicalQuestions || totalTechCount}` : 'N/A',
        `"${res.affinityHouse || 'Non passé'}"`,
        sc.timelords || 0,
        sc.gatekeepers || 0,
        sc.codecrafters || 0,
        sc.oracles || 0,
        `"${res.completedAt ? new Date(res.completedAt).toLocaleString('fr-FR') : ''}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `resultats_qcm_${totalQuestionsCount}_questions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Seed Demo Data for admin preview
  const handleSeedDemoData = () => {
    sounds.playSelect();
    const mockHouses = ['Les Timelords', 'Les Gatekeepers', 'The CodeCrafters', 'The Oracles'];
    const candidates = studentsData.filter(s => !s.isAdmin).slice(0, 15);
    
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

    loadResults();
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
            </div>
            <h2 className="text-2xl sm:text-3xl font-cyber font-extrabold text-white mt-1">
              Résultats du QCM ({totalQuestionsCount} Questions) & Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Supervision des résultats de culture informatique, profils de méthode et suivi confidentiel des promotions.
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exporter Résultats CSV</span>
          </button>

          <button
            onClick={() => { sounds.playSelect(); loadResults(); }}
            title="Rafraîchir les résultats depuis la base de données"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Actualiser DB</span>
          </button>

          <button
            onClick={handleSeedDemoData}
            title="Simuler des réponses pour observer les répartitions"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Simuler réponses</span>
          </button>

          <a
            href="https://codex.techmoulins.fr"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-cyan-900/40 transition"
          >
            <span>codex.techmoulins.fr</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Total Promo</span>
          <div className="text-2xl font-cyber font-bold text-white my-1">{totalStudents}</div>
          <span className="text-[10px] text-slate-500">{completedCount} QCM complétés</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1622]/90 border border-sky-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-sky-400 uppercase font-semibold">Timelords</span>
          <div className="text-2xl font-cyber font-bold text-sky-300 my-1">{countsByHouse[1]}</div>
          <span className="text-[10px] text-slate-400">Maison 1</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#160b22]/90 border border-purple-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-purple-400 uppercase font-semibold">Gatekeepers</span>
          <div className="text-2xl font-cyber font-bold text-purple-300 my-1">{countsByHouse[2]}</div>
          <span className="text-[10px] text-slate-400">Maison 2</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#10180a]/90 border border-lime-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-lime-400 uppercase font-semibold">CodeCrafters</span>
          <div className="text-2xl font-cyber font-bold text-lime-300 my-1">{countsByHouse[3]}</div>
          <span className="text-[10px] text-slate-400">Maison 3</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#140707]/90 border border-red-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-red-400 uppercase font-semibold">The Oracles</span>
          <div className="text-2xl font-cyber font-bold text-red-300 my-1">{countsByHouse[4]}</div>
          <span className="text-[10px] text-slate-400">Maison 4</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">Non Assignés</span>
          <div className="text-2xl font-cyber font-bold text-amber-300 my-1">{countsByHouse.unassigned}</div>
          <span className="text-[10px] text-slate-400">Web@cadémie...</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, promo ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={selectedHouseFilter}
            onChange={(e) => setSelectedHouseFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="all">Toutes les Maisons</option>
            {housesData.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
            <option value="unassigned">Non assignés</option>
          </select>

          <select
            value={selectedPromoFilter}
            onChange={(e) => setSelectedPromoFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="all">Toutes les Promotions</option>
            {promos.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={loadResults}
            title="Rafraîchir"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Students Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Étudiant</th>
                <th className="p-4">Promotion</th>
                <th className="p-4">Maison Officielle</th>
                <th className="p-4">Score Énigmes (/{totalTechCount})</th>
                <th className="p-4">Profil d'Affinité</th>
                <th className="p-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredStudents.map(student => {
                const res = resultsData[student.email.toLowerCase()];
                const house = housesData.find(h => h.id === student.teamId);
                const hasCompleted = !!res;

                return (
                  <tr 
                    key={student.id}
                    className="hover:bg-slate-900/40 transition group cursor-pointer"
                    onClick={() => setInspectStudent({ student, result: res })}
                  >
                    <td className="p-4">
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

                    <td className="p-4">
                      {house ? (
                        <span
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold border inline-block"
                          style={{
                            color: house.color,
                            borderColor: `${house.color}40`,
                            backgroundColor: `${house.color}15`
                          }}
                        >
                          {house.name}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40">
                          Non assigné
                        </span>
                      )}
                    </td>

                    {/* Logic Score */}
                    <td className="p-4">
                      {hasCompleted && res.correctCount !== undefined ? (
                        <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                          {res.correctCount} / {res.totalTechnicalQuestions || totalTechCount}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">—</span>
                      )}
                    </td>

                    {/* Affinity */}
                    <td className="p-4">
                      {hasCompleted ? (
                        <span className="font-medium text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          {res.affinityHouse || 'Calculé'}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">En attente du test</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {hasCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Fait
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                          <Clock className="w-3 h-3" /> À faire
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Student Modal */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0b1322] border border-cyan-500/30 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-cyber font-bold text-white">
                  {inspectStudent.student.fullName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{inspectStudent.student.email}</p>
              </div>
              <button
                onClick={() => setInspectStudent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Promotion :</span>
                <span className="text-white font-medium">{inspectStudent.student.classe}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Maison Officielle :</span>
                <span className="text-cyan-300 font-bold">{inspectStudent.student.teamName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Score Énigmes Logiques / Tech :</span>
                <span className="text-emerald-300 font-bold">
                  {inspectStudent.result?.correctCount !== undefined ? `${inspectStudent.result.correctCount} / ${inspectStudent.result?.totalTechnicalQuestions || totalTechCount} bonnes réponses` : 'Non encore passé'}
                </span>
              </div>
              
              {inspectStudent.result?.answers && inspectStudent.result.answers.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Détail des choix de l'étudiant ({inspectStudent.result?.answers?.length || totalQuestionsCount} Questions) :
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {inspectStudent.result.answers.map((ans, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] flex items-center justify-between">
                        <span className="text-slate-300">Q{ans.questionId} ({ans.category})</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-200 font-semibold">{ans.optionLabel}</span>
                          {ans.isCorrect === true && (
                            <span className="text-[10px] text-emerald-400 font-mono">✓ Juste</span>
                          )}
                          {ans.isCorrect === false && (
                            <span className="text-[10px] text-rose-400 font-mono">✗ Faux</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectStudent(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
