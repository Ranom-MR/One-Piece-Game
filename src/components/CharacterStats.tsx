'use client';

import React from 'react';
import { Player, PlayerAttributes } from '@/types/player';
import { DevilFruit } from '@/types/fruit';
import { calculateMaxHp } from '@/core/stats';
import { Swords, Plus } from 'lucide-react';

export interface CharacterStatsProps {
  player: Player;
  effectiveAttributes: PlayerAttributes;
  gearBonuses: PlayerAttributes;
  equippedFruit?: DevilFruit | null;
  onAllocatePoint?: (attr: keyof PlayerAttributes) => void;
  showDerivedStats?: boolean;
  className?: string;
}

interface StatItemConfig {
  key: keyof PlayerAttributes;
  label: string;
  iconSrc: string;
  iconAlt: string;
  barColor: string;
  glowColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  btnBg: string;
  fruitMultiplier?: number;
}

/**
 * Componente modular de Atributos de Combate (Clean, Moderno e com Barras Grossas)
 * Lógica rigorosa de alocação de atributos base:
 * - O número ao lado do botão '+' reflete exclusivamente os pontos base investidos (player.attributes)
 * - Botão '+' valida o teto de pontos livres disponíveis (desativado se availableAttributePoints <= 0)
 * - Barra de status grossa preenche de forma proporcional e fluida a cada ponto base adicionado
 * - Cores oficiais:
 *   * Força: Laranja (`bg-orange-500`)
 *   * Agilidade: Amarelo Ouro (`bg-amber-400`)
 *   * Inteligência: Azul/Roxo (`bg-indigo-500`)
 *   * Resistência: Vermelho Vigorosa (`bg-red-600`)
 */
export function CharacterStats({
  player,
  effectiveAttributes,
  gearBonuses,
  equippedFruit,
  onAllocatePoint,
  showDerivedStats = true,
  className = '',
}: CharacterStatsProps) {
  const statsConfig: StatItemConfig[] = [
    {
      key: 'strength',
      label: 'Força',
      iconSrc: '/icons/stat_forca.png',
      iconAlt: 'Halter de ferro do Zoro (Força)',
      barColor: 'bg-orange-500',
      glowColor: 'shadow-[0_0_14px_rgba(249,115,22,0.4)]',
      borderColor: 'border-orange-500/25 hover:border-orange-500/50',
      textColor: 'text-orange-400',
      badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-600/40',
      btnBg: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
      fruitMultiplier: equippedFruit?.statMultipliers.strengthMultiplier,
    },
    {
      key: 'agility',
      label: 'Agilidade',
      iconSrc: '/icons/stat_agilidade.png',
      iconAlt: 'Sandálias de palha do Luffy (Agilidade)',
      barColor: 'bg-amber-400',
      glowColor: 'shadow-[0_0_14px_rgba(251,191,36,0.4)]',
      borderColor: 'border-amber-400/25 hover:border-amber-400/50',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      btnBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
      fruitMultiplier: equippedFruit?.statMultipliers.agilityMultiplier,
    },
    {
      key: 'intelligence',
      label: 'Inteligência',
      iconSrc: '/icons/stat_inteligencia.png',
      iconAlt: 'Livro da Robin (Inteligência)',
      barColor: 'bg-indigo-500',
      glowColor: 'shadow-[0_0_14px_rgba(99,102,241,0.4)]',
      borderColor: 'border-indigo-500/25 hover:border-indigo-500/50',
      textColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
      btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white',
      fruitMultiplier:
        equippedFruit?.statMultipliers.intelligenceMultiplier ||
        equippedFruit?.statMultipliers.fruitPowerMultiplier,
    },
    {
      key: 'resistance',
      label: 'Resistência',
      iconSrc: '/icons/stat_resistencia.png',
      iconAlt: 'Capacete de gladiador de Dressrosa (Resistência)',
      barColor: 'bg-red-600',
      glowColor: 'shadow-[0_0_14px_rgba(220,38,38,0.4)]',
      borderColor: 'border-red-600/25 hover:border-red-600/50',
      textColor: 'text-red-500',
      badgeBg: 'bg-red-950/80 text-red-300 border-red-600/40',
      btnBg: 'bg-red-600 hover:bg-red-500 text-white',
      fruitMultiplier: equippedFruit?.statMultipliers.resistanceMultiplier,
    },
  ];

  const canAllocate = player.availableAttributePoints > 0;

  // Escala dinâmica inteligente baseada no maior atributo base do jogador
  const highestBase = Math.max(
    30,
    player.attributes.strength,
    player.attributes.agility,
    player.attributes.intelligence ?? 5,
    player.attributes.resistance
  );
  const maxScale = Math.ceil(highestBase * 1.15);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ========================================================= */}
      {/* 1. PAINEL PRINCIPAL: BARRAS VISUAIS GROSSAS & CLEAN       */}
      {/* ========================================================= */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
            <Swords className="w-4 h-4 mr-2 text-amber-500" /> Atributos de Combate
          </h3>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
              canAllocate
                ? 'text-amber-400 bg-amber-950/60 border border-amber-600/40 animate-pulse'
                : 'text-slate-500 bg-slate-900 border border-slate-800'
            }`}
          >
            {player.availableAttributePoints} ponto{player.availableAttributePoints === 1 ? '' : 's'} livre{player.availableAttributePoints === 1 ? '' : 's'}
          </span>
        </div>

        {/* Lista Simétrica em Barras Grossas com Ícones Temáticos */}
        <div className="space-y-3">
          {statsConfig.map((stat) => {
            // Pontos base exclusivos investidos pelo jogador
            const baseVal =
              (player.attributes[stat.key] as number) ??
              (stat.key === 'intelligence' ? (player.attributes.fruitPower as number) ?? 5 : 5);

            const hasMultiplier = stat.fruitMultiplier && stat.fruitMultiplier > 1;
            const multiplierPct = hasMultiplier
              ? ((stat.fruitMultiplier! - 1) * 100).toFixed(1).replace('.0', '')
              : null;

            // Largura proporcional da barra calculada diretamente a partir dos pontos base (mínimo 8%)
            const barPercent = Math.min(100, Math.max(8, (baseVal / maxScale) * 100));

            return (
              <div
                key={stat.key}
                className={`p-3 sm:p-3.5 bg-slate-900/90 rounded-2xl border transition-all duration-200 shadow-md flex items-center gap-3 sm:gap-4 ${stat.borderColor}`}
              >
                {/* Ícone Temático Oficial em PNG Transparente (Esquerda) */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-950/95 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 shadow-inner group">
                  <img
                    src={stat.iconSrc}
                    alt={stat.iconAlt}
                    draggable={false}
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform duration-200 select-none"
                  />
                </div>

                {/* Conteúdo Central Clean: Nome do Atributo e Barra Grossa */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-sm sm:text-base font-black tracking-wide ${stat.textColor}`}>
                      {stat.label}
                    </span>
                    {hasMultiplier && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${stat.badgeBg}`}
                        title={`Bônus de Akuma no Mi: +${multiplierPct}%`}
                      >
                        +{multiplierPct}%
                      </span>
                    )}
                  </div>

                  {/* Barra de Progresso Grossa (h-5 sm:h-6) Atualizada pelos Pontos Base */}
                  <div className="w-full bg-slate-950 h-5 sm:h-6 rounded-xl overflow-hidden border border-slate-800 p-0.5 shadow-inner relative">
                    <div
                      className={`h-full rounded-lg transition-all duration-300 ease-out relative overflow-hidden ${stat.barColor} ${stat.glowColor}`}
                      style={{ width: `${barPercent}%` }}
                    >
                      {/* Efeito Especular 3D de Luz Superior */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Bloco à Direita: Número de Pontos Base Exclusivo + Botão de Incremento (+) */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                  <span
                    className="text-lg sm:text-xl font-black font-mono text-white text-right min-w-[28px]"
                    title={`Pontos base em ${stat.label}: ${baseVal}`}
                  >
                    {baseVal}
                  </span>

                  <button
                    type="button"
                    disabled={!canAllocate}
                    onClick={() => canAllocate && onAllocatePoint?.(stat.key)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-black transition-all flex items-center justify-center shrink-0 ${
                      canAllocate
                        ? `${stat.btnBg} shadow-lg active:scale-90 cursor-pointer`
                        : 'bg-slate-800/40 border border-slate-700/30 text-slate-500 opacity-30 cursor-not-allowed shadow-none'
                    }`}
                    title={
                      canAllocate
                        ? `Adicionar 1 ponto em ${stat.label} (${player.availableAttributePoints} disponíveis)`
                        : 'Sem pontos livres disponíveis'
                    }
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ESTATÍSTICAS DERIVADAS DE COMBATE (4 CARDS ALINHADOS)  */}
      {/* ========================================================= */}
      {showDerivedStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
            <span className="text-slate-400 text-[11px] block font-semibold">Dano Físico</span>
            <span className="font-black text-orange-400 text-base">
              {Math.round(10 + effectiveAttributes.strength * 2.0)} pts
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
            <span className="text-slate-400 text-[11px] block font-semibold">Acerto Crítico</span>
            <span className="font-black text-indigo-400 text-base">
              {Math.min(50, Math.round(5 + effectiveAttributes.intelligence * 0.55))}%
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
            <span className="text-slate-400 text-[11px] block font-semibold">Chance Esquiva</span>
            <span className="font-black text-amber-400 text-base">
              {Math.min(30, Math.round(5 + effectiveAttributes.agility * 0.45))}%
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
            <span className="text-slate-400 text-[11px] block font-semibold">Vida Total (HP)</span>
            <span className="font-black text-red-500 text-base">
              {calculateMaxHp(effectiveAttributes.resistance, player.level)} HP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterStats;
