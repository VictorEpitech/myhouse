import React from 'react';
import { useAuth } from '../auth/AuthContext';
import housesData from '../data/houses.json';
import { Sparkles, ArrowRight, Award, Users, Compass, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { getStoredResults } from '../utils/storage';

export default function HeroSection({ onStartQuiz, onExploreHouses, onDirectReveal, userRevealedHouse, hasCompletedQuiz, quizResult }) {
  const { currentUser, loginWithMicrosoft, authError } = useAuth();

  const completedTest = Boolean(hasCompletedQuiz || userRevealedHouse);
  const houseAssigned = userRevealedHouse || (completedTest ? currentUser?.house : null);

  return (
    <div className="relative overflow-hidden py-12 lg:py-20">
      
      {/* Background Cyber Glow Grids */}
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-purple-600/15 to-red-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner Announcement */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-xl backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-xs font-mono text-slate-300">
              Saison Codex Epitech Moulins — Campus Actif
            </span>
            <span className="text-slate-600">|</span>
            <a 
              href="https://codex.techmoulins.fr" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              codex.techmoulins.fr <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Main Title & Catchphrase */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-cyber tracking-tight text-white leading-none">
            DÉCOUVREZ L'ÉQUILIBRE <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-red-400 animate-pulse-glow">
              DES 4 MAISONS DU CODEX
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Plongez dans le sanctuaire d’Epitech Moulins. Répondez au <strong className="text-cyan-300 font-semibold">Rituel d'Attribution & Test de Culture Informatique</strong> : l'algorithme analysera votre profil d'ingénieur pour déterminer votre Maison officielle.
          </p>

          {/* User Status Card (if logged in) */}
          {currentUser && (
            <div className="pt-2 max-w-lg mx-auto">
              <div 
                className="p-4 rounded-2xl bg-slate-900/90 border shadow-2xl backdrop-blur-md flex items-center justify-between transition-all"
                style={{
                  borderColor: (completedTest && houseAssigned) ? houseAssigned.color : '#0284c7',
                  boxShadow: (completedTest && houseAssigned) ? `0 0 25px -5px ${houseAssigned.borderGlow}` : undefined
                }}
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md"
                    style={{
                      backgroundColor: (completedTest && houseAssigned) ? `${houseAssigned.color}25` : '#0369a120',
                      color: (completedTest && houseAssigned) ? houseAssigned.color : '#38bdf8',
                      border: `1px solid ${(completedTest && houseAssigned) ? houseAssigned.color : '#0284c7'}`
                    }}
                  >
                    {currentUser.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Étudiant connecté</div>
                    <div className="font-bold text-base text-white">{currentUser.fullName}</div>
                    <div className="text-xs text-slate-300 font-mono">
                      {completedTest && houseAssigned ? (
                        <span style={{ color: houseAssigned.color }} className="font-semibold">
                          ★ {houseAssigned.name}
                        </span>
                      ) : (
                        <span className="text-cyan-400">Rituel d'attribution requis</span>
                      )}
                      {' • '}{currentUser.classe}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { 
                    sounds.playSelect(); 
                    if (completedTest && houseAssigned) {
                      onDirectReveal(currentUser);
                    } else {
                      onStartQuiz();
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: (completedTest && houseAssigned) ? houseAssigned.color : '#0284c7'
                  }}
                >
                  {(completedTest && houseAssigned) ? "Voir ma Maison" : "Passer le Test"}
                </button>
              </div>
            </div>
          )}

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            
            <button
              onClick={() => { 
                sounds.playSelect(); 
                if (completedTest) {
                  onDirectReveal(currentUser);
                } else {
                  onStartQuiz();
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-cyber font-bold text-base shadow-xl shadow-cyan-600/30 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
              <span>{completedTest ? "Voir ma Maison & mes Résultats" : "Lancer le Rituel d'Attribution"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => { sounds.playSelect(); onExploreHouses(); }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-cyber font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Explorer les 4 Maisons</span>
            </button>

            {!currentUser && (
              <button
                onClick={() => { sounds.playSelect(); loginWithMicrosoft(); }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-500/50 text-xs font-mono transition flex items-center justify-center gap-2.5 shadow-lg"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                  <path fill="#f25022" d="M1 1h9v9H1z"/>
                  <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                  <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                  <path fill="#ffb900" d="M11 11h9v9h-9z"/>
                </svg>
                <span>Connexion Microsoft 365</span>
              </button>
            )}

          </div>

          {authError && (
            <div className="max-w-lg mx-auto p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 font-mono">
              ⚠️ {authError}
            </div>
          )}

        </div>

        {/* The 4 Houses Teaser Cards directly inspired by the official posters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-16">
          {housesData.map((house) => (
            <div
              key={house.id}
              onClick={() => { sounds.playSelect(); onExploreHouses(house.id); }}
              className="group relative rounded-2xl bg-[#0b101c]/90 border border-slate-800/90 p-5 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden flex flex-col justify-between"
              style={{
                boxShadow: `0 0 0 1px ${house.color}15`
              }}
            >
              {/* Top Glow on hover */}
              <div 
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: house.color }}
              ></div>

              <div>
                {/* Poster Thumbnail */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 border border-slate-800 bg-slate-950">
                  <img
                    src={house.poster}
                    alt={house.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b101c] via-transparent to-transparent"></div>
                  <span 
                    className="absolute top-2.5 right-2.5 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full backdrop-blur-md"
                    style={{
                      backgroundColor: `${house.color}25`,
                      color: house.color,
                      border: `1px solid ${house.color}50`
                    }}
                  >
                    {house.number}
                  </span>
                </div>

                {/* House Title */}
                <h3 
                  className="font-cyber font-bold text-lg tracking-wide mb-1 transition-colors"
                  style={{ color: house.color }}
                >
                  {house.name}
                </h3>
                
                {/* Tagline */}
                <p className="text-xs text-slate-400 italic line-clamp-2 mb-4 leading-relaxed">
                  {house.tagline}
                </p>

                {/* Artifact Pill */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 mb-3">
                  <Award className="w-4 h-4 shrink-0" style={{ color: house.color }} />
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Artefact</div>
                    <div className="text-xs font-semibold text-slate-200 truncate">{house.artefact.name}</div>
                  </div>
                </div>
              </div>

              {/* Themes tags */}
              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                {house.themes.slice(0, 3).map((theme, i) => (
                  <span 
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono"
                  >
                    #{theme}
                  </span>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
