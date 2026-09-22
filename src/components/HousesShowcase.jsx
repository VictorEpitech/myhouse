import React, { useState } from 'react';
import housesData from '../data/houses.json';
import { Award, Shield, Users, Sparkles, ExternalLink, Maximize2, X, Lock } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function HousesShowcase({ initialHouseId = 1 }) {
  const [activeHouseId, setActiveHouseId] = useState(initialHouseId);
  const [lightboxImage, setLightboxImage] = useState(null);

  const activeHouse = housesData.find(h => h.id === activeHouseId) || housesData[0];

  const handleTabChange = (id) => {
    sounds.playSelect();
    setActiveHouseId(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
          ARCHIVES DU CAMPUS DE MOULINS
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-cyber text-white">
          LES 4 MAISONS DU CODEX
        </h2>
        <p className="text-sm text-slate-400">
          Chaque maison incarne un pilier fondamental de l'excellence informatique et technologique. Découvrez leurs affiches officielles, leurs artefacts et leur philosophie.
        </p>
      </div>

      {/* House Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
        {housesData.map((h) => {
          const isActive = h.id === activeHouseId;
          return (
            <button
              key={h.id}
              onClick={() => handleTabChange(h.id)}
              className="p-3.5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group flex flex-col justify-between"
              style={{
                borderColor: isActive ? h.color : 'rgba(30, 41, 59, 0.8)',
                backgroundColor: isActive ? `${h.color}15` : 'rgba(15, 23, 42, 0.6)',
                boxShadow: isActive ? `0 0 20px -5px ${h.borderGlow}` : undefined
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold" style={{ color: h.color }}>
                  {h.number}
                </span>
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: h.color }}
                ></span>
              </div>
              <div className="font-cyber font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                {h.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active House Feature Card */}
      <div 
        className="rounded-3xl bg-[#090f1c]/90 border p-6 sm:p-10 shadow-2xl transition-all duration-500 relative overflow-hidden"
        style={{
          borderColor: `${activeHouse.color}50`,
          boxShadow: `0 0 40px -10px ${activeHouse.color}30`
        }}
      >
        
        {/* Ambient Top Glow */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none"
          style={{ backgroundColor: activeHouse.color }}
        ></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Column 1: Affiche A3 Official Poster (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 group max-w-sm w-full">
              <img
                src={activeHouse.poster}
                alt={activeHouse.name}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                onClick={() => setLightboxImage(activeHouse.poster)}
              />
              <button
                onClick={() => setLightboxImage(activeHouse.poster)}
                className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/20 transition opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-mono"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Agrandir</span>
              </button>
            </div>
            
            <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">
              Affiche A3 Officielle — Epitech Moulins
            </p>
          </div>

          {/* Column 2: House Lore, Artefact, Values (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <span 
                className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block"
                style={{
                  color: activeHouse.color,
                  borderColor: `${activeHouse.color}40`,
                  backgroundColor: `${activeHouse.color}15`
                }}
              >
                Identité de la {activeHouse.number}
              </span>
              
              <h3 
                className="text-3xl sm:text-4xl font-extrabold font-cyber tracking-tight"
                style={{ color: activeHouse.color }}
              >
                {activeHouse.name}
              </h3>

              <p className="text-base text-slate-200 italic font-light leading-relaxed">
                {activeHouse.tagline}
              </p>
            </div>

            {/* Themes Badges */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold uppercase text-slate-400">
                Thématiques d'Excellence :
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeHouse.themes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Artifact */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                style={{
                  backgroundColor: `${activeHouse.color}20`,
                  color: activeHouse.color,
                  border: `1px solid ${activeHouse.color}40`
                }}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Artefact Sacré
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  {activeHouse.artefact.name}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeHouse.artefact.desc}
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                style={{
                  backgroundColor: `${activeHouse.color}20`,
                  color: activeHouse.color,
                  border: `1px solid ${activeHouse.color}40`
                }}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Archétype & Valeurs
                </div>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {activeHouse.archetype}
                </p>
                <div className="flex flex-wrap gap-1">
                  {activeHouse.values.map((v, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mystery Notice for Members */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Attribution confidentielle :</span> Chaque étudiant découvre sa Maison et ses frères d'armes en complétant le rituel du Codex.
              </div>
            </div>

            {/* Link to Codex */}
            <div className="pt-2">
              <a
                href="https://codex.techmoulins.fr"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border font-cyber font-bold text-xs text-white inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
                style={{
                  backgroundColor: activeHouse.color,
                  borderColor: activeHouse.color
                }}
              >
                <span>Accéder à codex.techmoulins.fr</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* Lightbox for Poster Fullscreen */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-white bg-slate-800 rounded-full hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Affiche A3"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
