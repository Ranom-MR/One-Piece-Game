'use client';

import React from 'react';
import { Player } from '@/types/player';
import { calculateMaxHp } from '@/core/stats';
import { PirateAvatar } from '@/components/PirateAvatar';
import { Coins, Zap, Heart, Sparkles, Award } from 'lucide-react';

interface PlayerHeaderProps {
  player: Player;
  equippedFruitName?: string | null;
  maxHp?: number;
}

export function PlayerHeader({ player, equippedFruitName, maxHp: customMaxHp }: PlayerHeaderProps) {
  const maxHp = customMaxHp ?? calculateMaxHp(player.attributes.resistance, player.level);
  const hpPercentage = Math.min(100, Math.max(0, 100)); // Hub = 100%
  const energyPercentage = Math.min(100, Math.max(0, (player.energy.current / player.energy.max) * 100));
  const expPercentage = Math.min(100, Math.max(0, (player.experience / player.experienceToNextLevel) * 100));

  return (
    <header className="bg-slate-950/95 border-b border-amber-900/40 p-3 md:px-6 md:py-3 sticky top-0 z-30 backdrop-blur-md shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
        
        {/* Lado Esquerdo: Perfil do Pirata & Nível */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden flex items-center justify-center">
              <PirateAvatar
                appearance={player.appearance}
                bustOnly={true}
                className="w-full h-full object-cover transform scale-110"
                showBackground={false}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-100 text-sm md:text-base tracking-wide">
                {player.name}
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                Nv. {player.level}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span>{player.title}</span>
              {equippedFruitName ? (
                <span className="flex items-center text-[10px] text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-700/60">
                  <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                  {equippedFruitName}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 italic">Sem Akuma no Mi</span>
              )}
            </div>
          </div>
        </div>

        {/* Centro: Barras de Status Lado a Lado (Vida, Energia e EXP) */}
        <div className="flex-1 w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {/* Barra de Vida */}
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1 text-[11px] text-red-300 font-semibold">
              <span className="flex items-center">
                <Heart className="w-3.5 h-3.5 mr-1 text-red-500 fill-red-500" /> Vida (HP)
              </span>
              <span>{maxHp} / {maxHp}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-red-950">
              <div
                className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>

          {/* Barra de Energia */}
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1 text-[11px] text-amber-300 font-semibold">
              <span className="flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-400 fill-amber-400" /> Energia
              </span>
              <span>{player.energy.current} / {player.energy.max}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-amber-950">
              <div
                className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-300"
                style={{ width: `${energyPercentage}%` }}
              />
            </div>
          </div>

          {/* Barra de EXP */}
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1 text-[11px] text-emerald-300 font-semibold">
              <span className="flex items-center">
                <Award className="w-3.5 h-3.5 mr-1 text-emerald-400" /> EXP
              </span>
              <span>{player.experience} / {player.experienceToNextLevel}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-emerald-950">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-300"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lado Direito: Economia e Recompensa da Marinha (Wanted) */}
        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-1.5 shrink-0">
          <div className="flex items-center space-x-1.5 text-amber-300 font-black text-sm md:text-base tracking-wide bg-gradient-to-r from-amber-950/80 to-slate-900 px-3 py-1 rounded-lg border border-amber-600/40 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{player.berries.toLocaleString()} ฿</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px] bg-red-950/70 border border-red-700/50 text-red-300 px-2.5 py-0.5 rounded font-black tracking-wider uppercase">
            <span>WANTED:</span>
            <span>{player.bounty > 0 ? `${player.bounty.toLocaleString()} ฿` : 'SEM RECOMPENSA'}</span>
          </div>
        </div>

      </div>
    </header>
  );
}
