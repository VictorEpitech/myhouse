import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Award, Shield, ExternalLink, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import housesData from '../data/houses.json';
import { sounds } from '../utils/soundEffects';

export default function HouseRevealModal({ result, onClose }) {
  if (!result) return null;

  const house = result.officialHouse || result.affinityHouse || housesData[0];

  useEffect(() => {
    // Shoot celebratory confettis matching house theme color
    const hex = house.color;
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: [hex, '#ffffff', '#ffd700']
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [hex, '#38bdf8']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [hex, '#c084fc']
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [house]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      
      <div 
        className="relative w-full max-w-4xl my-8 bg-[#090e17] border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style={{
          borderColor: `${house.color}60`,
          boxShadow: `0 0 50px -10px ${house.color}40`
        }}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: The Magnificent Official Poster */}
        <div className="md:w-5/12 relative bg-slate-950 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800/80">
          
          <div 
            className="absolute inset-0 opacity-25 blur-3xl"
            style={{ backgroundColor: house.color }}
          ></div>

          <div className="relative w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 group">
            <img
              src={house.poster}
              alt={house.name}
              className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
              <span>{house.number}</span>
              <span style={{ color: house.color }}>AFFICHE OFFICIELLE</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs font-mono text-slate-400">
              Bannière officielle homologuée Epitech
            </span>
          </div>

        </div>

        {/* Right Side: Details, Artifact, Secret Notice & Codex Action (NO STUDENT NAMES) */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[85vh]">
          
          {/* Header */}
          <div className="space-y-2">
            
            <div className="flex flex-wrap items-center gap-2">
              <span 
                className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5"
                style={{
                  color: house.color,
                  borderColor: `${house.color}50`,
                  backgroundColor: `${house.color}15`
                }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Verdict Officiel du Codex
              </span>

              {result.correctCount !== undefined && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Score Énigmes : {result.correctCount} / {result.totalTechnicalQuestions || 25}
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-slate-400">
              L'algorithme a analysé vos réponses et déterminé votre profil d'ingénieur. Vous rejoignez :
            </div>

            <h2 
              className="text-3xl sm:text-4xl font-extrabold font-cyber tracking-wide"
              style={{ color: house.color }}
            >
              {house.name}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 italic font-light leading-relaxed">
              {house.tagline}
            </p>

          </div>

          {/* Archetype & Artifact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Artifact */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                <Award className="w-4 h-4" style={{ color: house.color }} />
                <span>Artefact Suprême</span>
              </div>
              <div className="font-bold text-sm text-white">{house.artefact.name}</div>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                {house.artefact.desc}
              </p>
            </div>

            {/* Archetype */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-slate-400 mb-1">
                <Shield className="w-4 h-4" style={{ color: house.color }} />
                <span>Archétype d'Ingénieur</span>
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                {house.archetype}
              </p>
            </div>

          </div>

          {/* SECRET BROTHERHOOD NOTICE - NO STUDENT NAMES TO PREVENT LEAKS */}
          <div 
            className="p-4 rounded-2xl border flex items-start gap-3.5"
            style={{
              backgroundColor: `${house.color}10`,
              borderColor: `${house.color}35`
            }}
          >
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md"
              style={{
                backgroundColor: `${house.color}25`,
                color: house.color,
                border: `1px solid ${house.color}50`
              }}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Secret de Confrérie</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-300 border border-white/10 font-normal">
                  Révélation Présentielle
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                L'identité de vos coéquipiers de Maison reste confidentielle. Vous découvrirez vos frères et sœurs d'armes lors de la cérémonie officielle sur le campus d'Epitech Moulins !
              </p>
            </div>
          </div>

          {/* Direct CTA to codex.techmoulins.fr */}
          <div className="pt-2 space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0e1626] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Rejoignez la compétition du campus !
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rendez-vous sur le Codex officiel pour marquer des points pour {house.name}.
                </p>
              </div>

              <a
                href="https://codex.techmoulins.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-cyber font-bold text-xs text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                style={{
                  backgroundColor: house.color
                }}
              >
                <span>Accéder à codex.techmoulins.fr</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-4 py-2 transition"
              >
                Fermer
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
