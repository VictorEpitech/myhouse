import React from 'react';
import { ExternalLink, Trophy, Flame, Zap, Shield, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function CodexLinkSection() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0e1627] to-[#070b13] border border-cyan-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
        
        {/* Decorative Grid & Halos */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text & Pitch */}
          <div className="lg:col-span-8 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plateforme Officielle du Campus Moulins</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-cyber text-white">
              LE CODEX D'EPITECH MOULINS <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300">
                L'Équilibre et la Gloire de Votre Maison
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              Votre aventure ne s'arrête pas au rituel d'attribution. Sur <strong className="text-white font-semibold">codex.techmoulins.fr</strong>, vous relevez des quêtes hebdomadaires, remportez des points lors des hackathons et des soutenances, et luttez pour hisser votre bannière au sommet du classement du campus.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Points & Saisons</div>
                  <div className="text-[11px] text-slate-400">Classement en direct</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Quêtes du Campus</div>
                  <div className="text-[11px] text-slate-400">Défis tech & entraide</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Équilibre des 4</div>
                  <div className="text-[11px] text-slate-400">Synergie des talents</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white">
              <ExternalLink className="w-8 h-8" />
            </div>

            <div>
              <div className="font-cyber font-bold text-lg text-white">
                Prêt pour la Compétition ?
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                codex.techmoulins.fr
              </p>
            </div>

            <a
              href="https://codex.techmoulins.fr"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sounds.playSelect()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-cyber font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Accéder au Portail</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
