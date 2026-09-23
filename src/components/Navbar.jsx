import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Shield, LogOut, ExternalLink, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { getStoredResults } from '../utils/storage';

export default function Navbar({ currentView, setCurrentView, soundEnabled, setSoundEnabled, userRevealedHouse, hasCompletedQuiz }) {
  const { currentUser, loginWithMicrosoft, logout, isAdmin } = useAuth();

  const toggleSound = () => {
    const state = sounds.toggleSound();
    setSoundEnabled(state);
  };

  // Only display house badge if user already completed the ritual
  const completedTest = hasCompletedQuiz || (userRevealedHouse != null);
  const activeHouse = userRevealedHouse || (completedTest ? currentUser?.house : null);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#070b12]/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => { sounds.playSelect(); setCurrentView('home'); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-purple-600 to-red-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#070b12] rounded-[10px] flex items-center justify-center">
              <span className="font-cyber font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                CX
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cyber font-bold text-lg tracking-wider text-white group-hover:text-cyan-400 transition-colors">
                CODEX
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                Moulins
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              L'Équilibre des 4 Maisons
            </p>
          </div>
        </div>

        {/* Central Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => { sounds.playSelect(); setCurrentView('home'); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentView === 'home'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => { sounds.playSelect(); setCurrentView('quiz'); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'quiz'
                ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {completedTest ? "Mon Affectation" : "Le Rituel d'Attribution"}
          </button>
          <button
            onClick={() => { sounds.playSelect(); setCurrentView('houses'); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentView === 'houses'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Les 4 Maisons
          </button>

          {isAdmin && (
            <button
              onClick={() => { sounds.playSelect(); setCurrentView('admin'); }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-red-500/20 text-red-300 shadow-sm border border-red-500/40'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-950/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-red-400" />
              Admin Dashboard
            </button>
          )}
        </nav>

        {/* Right Actions & Auth */}
        <div className="flex items-center gap-3">
          
          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Couper le son" : "Activer le son"}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Official Codex Link */}
          <a
            href="https://codex.techmoulins.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition hover:border-cyan-500/40"
          >
            <span>codex.techmoulins.fr</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>

          {/* Auth Button or Profile Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition"
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: activeHouse ? `${activeHouse.color}25` : '#1e293b',
                    color: activeHouse ? activeHouse.color : '#38bdf8',
                    border: `1px solid ${activeHouse ? activeHouse.color : '#475569'}`
                  }}
                >
                  {currentUser.firstName ? currentUser.firstName.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight flex items-center gap-1.5">
                    {currentUser.fullName}
                    {currentUser.isAdmin && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 px-1 rounded font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {activeHouse ? activeHouse.name : currentUser.classe}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { sounds.playSelect(); logout(); }}
                title="Se déconnecter"
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { sounds.playSelect(); loginWithMicrosoft(); }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-lg shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <span className="bg-[#f25022] w-1.5 h-1.5 rounded-[1px]"></span>
                <span className="bg-[#7fba00] w-1.5 h-1.5 rounded-[1px]"></span>
                <span className="bg-[#00a4ef] w-1.5 h-1.5 rounded-[1px]"></span>
                <span className="bg-[#ffb900] w-1.5 h-1.5 rounded-[1px]"></span>
              </div>
              <span>Connexion Microsoft 365</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
