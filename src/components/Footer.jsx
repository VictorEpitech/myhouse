import React from 'react';
import { ExternalLink, Heart, Shield } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { sounds } from '../utils/soundEffects';

export default function Footer({ onNavigate }) {
  const { isAdmin } = useAuth();

  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#05080e] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-white font-cyber font-bold text-sm">
            CX
          </div>
          <div>
            <div className="font-cyber font-bold text-white text-sm">
              CODEX EPITECH MOULINS
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Plateforme d'intégration & Rituel des Maisons
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px]">
          <button 
            onClick={() => { sounds.playSelect(); onNavigate('home'); }} 
            className="hover:text-cyan-400 transition"
          >
            Accueil
          </button>
          <button 
            onClick={() => { sounds.playSelect(); onNavigate('quiz'); }} 
            className="hover:text-purple-400 transition"
          >
            Rituel Tech
          </button>
          <button 
            onClick={() => { sounds.playSelect(); onNavigate('houses'); }} 
            className="hover:text-amber-400 transition"
          >
            Les 4 Maisons
          </button>
          {isAdmin && (
            <button 
              onClick={() => { sounds.playSelect(); onNavigate('admin'); }} 
              className="text-red-400 hover:text-red-300 transition flex items-center gap-1"
            >
              <Shield className="w-3 h-3" /> Dashboard Admin
            </button>
          )}
          <a
            href="https://codex.techmoulins.fr"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            codex.techmoulins.fr <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Disclaimer / Credits */}
        <div className="text-[11px] text-slate-500 font-mono text-center sm:text-right">
          <span>Conçu pour le campus Epitech Moulins</span>
        </div>

      </div>
    </footer>
  );
}
