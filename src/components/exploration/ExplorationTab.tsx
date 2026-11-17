'use client';

import React, { useState } from 'react';
import { Player } from '@/types/player';
import { Island, Quest } from '@/types/island';
import islandsData from '@/data/islands.json';
import {
  Compass,
  Lock,
  CheckCircle2,
  X,
  Skull,
  Coins,
  Clock,
  Zap,
  Award,
  Swords,
  Anchor,
  Sparkles,
  Ship,
  ChevronRight,
  Flame,
  Check,
  Map,
  List,
  Dumbbell,
} from 'lucide-react';

/**
 * Coordenadas percentuais exatas dos 10 pontos da Carta Náutica de Expedição (Vila dos Moinhos)
 * Mapeadas diretamente sobre a imagem 2754x1536 de /cenario/mapa_ilha_1.png
 */
export const WINDMILL_ISLAND_HOTSPOTS = [
  { index: 0, number: 1, x: 26.14, y: 63.80 },
  { index: 1, number: 2, x: 38.85, y: 61.20 },
  { index: 2, number: 3, x: 46.84, y: 59.57 },
  { index: 3, number: 4, x: 53.20, y: 51.11 },
  { index: 4, number: 5, x: 53.92, y: 39.06 }, // Mini-Chefe (Espadas Cruzadas)
  { index: 5, number: 6, x: 45.03, y: 43.62 }, // Praça da Vila
  { index: 6, number: 7, x: 65.36, y: 50.78 }, // Ponte de Madeira / Rio
  { index: 7, number: 8, x: 70.62, y: 34.18 }, // Caverna da Montanha
  { index: 8, number: 9, x: 75.71, y: 44.27 }, // Posto dos Bandidos (Caveira)
  { index: 9, number: 10, x: 85.33, y: 40.69 }, // Caverna Pirata (Chefe Final Higuma)
];

/**
 * Coordenadas percentuais exatas dos 10 pontos da Carta Náutica de Expedição (Orange Town)
 * Mapeadas diretamente sobre a imagem 1024x571 de /cenario/mapa_ilha_2.png
 */
export const ORANGE_TOWN_HOTSPOTS = [
  { index: 0, number: 1, x: 20.02, y: 62.70 }, // South Docks
  { index: 1, number: 2, x: 31.05, y: 57.09 }, // Barracas Comerciais
  { index: 2, number: 3, x: 36.72, y: 60.95 }, // Main Street
  { index: 3, number: 4, x: 48.54, y: 55.87 }, // Praça Destroçada da Cidade
  { index: 4, number: 5, x: 56.15, y: 53.94 }, // Combate contra Cabaji [Mini-Chefe]
  { index: 5, number: 6, x: 43.26, y: 43.78 }, // Chafariz e Praça Central
  { index: 6, number: 7, x: 50.78, y: 38.53 }, // Pet Food Shop (Chouchou)
  { index: 7, number: 8, x: 61.04, y: 30.12 }, // Mansão do Prefeito Boodle
  { index: 8, number: 9, x: 72.85, y: 36.78 }, // Tenda do Circo (Mohji & Richie) [Mini-Chefe]
  { index: 9, number: 10, x: 83.50, y: 42.38 }, // Quartel-General de Buggy [Chefe Final]
];

export interface IslandChartData {
  image: string;
  aspectRatio: string;
  hotspots: { index: number; number: number; x: number; y: number }[];
  title: string;
}

export const ISLAND_CHART_CONFIG: Record<string, IslandChartData> = {
  'windmill-village': {
    image: '/cenario/mapa_ilha_1.png',
    aspectRatio: 'aspect-[2754/1536]',
    hotspots: WINDMILL_ISLAND_HOTSPOTS,
    title: 'Carta Náutica de Expedição: Vila dos Moinhos (Capítulo 1)',
  },
  'orange-town': {
    image: '/cenario/mapa_ilha_2.png',
    aspectRatio: 'aspect-[1024/571]',
    hotspots: ORANGE_TOWN_HOTSPOTS,
    title: 'Carta Náutica de Expedição: Orange Town (Capítulo 2)',
  },
};

export interface ActiveQuestData {
  questId: string;
  questName: string;
  islandName?: string;
  remainingSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
}

export interface ActiveTrainingData {
  attribute?: string;
  attributeName: string;
  remainingSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
}

interface ExplorationTabProps {
  player: Player;
  onUpdatePlayer: (updated: Player) => void;
  onStartQuest: (quest: Quest, island: Island) => void;
  activeQuestData?: ActiveQuestData | null;
  activeTrainingData?: ActiveTrainingData | null;
  onCompleteQuestDev?: () => void;
  onCompleteTrainingDev?: () => void;
  formatTime: (totalSeconds: number) => string;
  setNotification: (msg: string) => void;
}

export function ExplorationTab({
  player,
  onUpdatePlayer,
  onStartQuest,
  activeQuestData,
  activeTrainingData,
  onCompleteQuestDev,
  onCompleteTrainingDev,
  formatTime,
  setNotification,
}: ExplorationTabProps) {
  const islands = islandsData as unknown as Island[];
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [inspectedQuest, setInspectedQuest] = useState<Quest | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  function handleSelectIsland(island: Island) {
    setSelectedIsland(island);
    setInspectedQuest(null);
    if (ISLAND_CHART_CONFIG[island.id]) {
      setViewMode('map');
    } else {
      setViewMode('list');
    }
  }

  const completedQuestIds = player.completedQuestIds || [];
  const clearedIslandIds = player.clearedIslandIds || [];

  // Helper para verificar se a ilha está desbloqueada
  function isIslandUnlocked(islandIndex: number): boolean {
    if (islandIndex === 0) return true; // Primeira ilha sempre desbloqueada
    const previousIsland = islands[islandIndex - 1];
    if (!previousIsland) return true;

    // Desbloqueada se a ilha anterior foi marcada como concluída ou se todas as 10 missões foram feitas
    const isPrevCleared = clearedIslandIds.includes(previousIsland.id);
    const prevQuestsCompleted = previousIsland.quests.every((q) =>
      completedQuestIds.includes(q.id)
    );
    return isPrevCleared || prevQuestsCompleted;
  }

  // Helper para verificar se a ilha foi 100% concluída
  function isIslandFullyCleared(island: Island): boolean {
    return (
      clearedIslandIds.includes(island.id) ||
      island.quests.every((q) => completedQuestIds.includes(q.id))
    );
  }

  // Contagem de missões concluídas na ilha
  function getCompletedQuestsCount(island: Island): number {
    return island.quests.filter((q) => completedQuestIds.includes(q.id)).length;
  }

  // Renderizador do Banner de Cooldown e Progresso da Missão (Estilo Dojo de Treino)
  const renderQuestProgressCard = () => {
    if (!activeQuestData) return null;

    return (
      <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950/90 via-slate-900 to-indigo-950/90 rounded-2xl sm:rounded-3xl border-2 border-sky-500/50 shadow-2xl space-y-3.5 relative overflow-hidden animate-fade-in">
        {/* Efeito de luz ciano de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Missão de Exploração em Andamento
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-sky-950/80 border-sky-600/70 text-sky-300 flex items-center space-x-1">
                  <Compass className="w-3 h-3 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{activeQuestData.islandName || 'East Blue'}</span>
                </span>
              </div>
              <p className="text-base font-black text-slate-100 mt-0.5">
                {activeQuestData.questName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-sky-800/80 shadow-inner">
              <span className="text-xs text-slate-400 font-semibold">Tempo Restante:</span>
              <span className="text-base font-mono font-black text-sky-400">
                ⏱️ {formatTime(activeQuestData.remainingSeconds)}
              </span>
            </div>

            {onCompleteQuestDev && (
              <button
                type="button"
                onClick={onCompleteQuestDev}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow"
                title="Acelerar e concluir missão imediatamente (Modo Dev)"
              >
                ⏩ Concluir (Dev)
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progresso com Brilho idêntica ao Dojo */}
        <div className="space-y-1.5 relative z-10">
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-sky-900/60 p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-sky-600 via-cyan-400 to-sky-500 h-full rounded-full transition-all duration-300 shadow-lg relative overflow-hidden"
              style={{ width: `${activeQuestData.progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20" />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
            <span>Custo: <strong className="text-amber-400">10 Energia</strong> (Consumidos)</span>
            <span className="text-sky-300 font-bold">{activeQuestData.progressPercentage.toFixed(1)}% concluído</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizador do Banner de Bloqueio de Expedições quando o Capitão está no Dojo de Treino
  const renderTrainingProgressCard = () => {
    if (!activeTrainingData) return null;

    return (
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-orange-950/90 rounded-2xl sm:rounded-3xl border-2 border-amber-500/60 shadow-2xl space-y-3.5 relative overflow-hidden animate-fade-in">
        {/* Efeito de luz dourada de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-900/60 rounded-xl text-amber-400 border border-amber-500/40 shrink-0">
              <Dumbbell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  Capitão Ocupado no Dojo de Treino
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-amber-950/80 border-amber-600/70 text-amber-300">
                  {activeTrainingData.attributeName}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-0.5">
                O capitão está aperfeiçoando atributos no Dojo. Expedições e batalhas nas ilhas estão travadas até o término do treino.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="flex items-center space-x-2 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-amber-800/80 shadow-inner">
              <span className="text-xs text-slate-400 font-semibold">Término em:</span>
              <span className="text-base font-mono font-black text-amber-400">
                ⏱️ {formatTime(activeTrainingData.remainingSeconds)}
              </span>
            </div>

            {onCompleteTrainingDev && (
              <button
                type="button"
                onClick={onCompleteTrainingDev}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow"
                title="Concluir treino imediatamente (Modo Dev)"
              >
                ⏩ Treino (Dev)
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progresso do Treino */}
        <div className="space-y-1.5 relative z-10">
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-amber-900/60 p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-300 shadow-lg relative overflow-hidden"
              style={{ width: `${activeTrainingData.progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20" />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
            <span>Treinando no Dojo: <strong className="text-amber-300">{activeTrainingData.attributeName}</strong></span>
            <span className="text-amber-300 font-bold">{activeTrainingData.progressPercentage.toFixed(1)}% concluído</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3.5 animate-fade-in">
      
      {/* ========================================================= */}
      {/* 1. CABEÇALHO NÁUTICO & CONTROLE DO MAPA-MÚNDI (COMPACTO)  */}
      {/* ========================================================= */}
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-amber-600/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="z-10 space-y-0.5">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '18s' }} />
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest font-serif">
              Carta Náutica de Navegação • East Blue
            </span>
          </div>
          <div className="flex items-baseline space-x-2.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-100 font-serif tracking-wide">
              Mapa dos Mares & Capítulos
            </h2>
            <p className="text-xs text-slate-300 hidden md:inline truncate max-w-md">
              — Clique sobre as ilhas para abrir missões e chefes
            </p>
          </div>
        </div>

        {/* Resumo do Status do Jogador no Mar */}
        <div className="z-10 flex items-center space-x-2 shrink-0">
          <div className="px-3 py-1.5 bg-slate-950/85 rounded-xl border border-amber-600/40 shadow flex items-center space-x-3 text-right">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">
                Energia
              </span>
              <span className="text-xs font-black text-amber-400 flex items-center justify-end">
                <Zap className="w-3 h-3 mr-0.5 fill-amber-400" />
                {player.energy.current} / {player.energy.max}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">
                Conquista
              </span>
              <span className="text-xs font-black text-emerald-400">
                {islands.filter(isIslandFullyCleared).length} / {islands.length} Ilhas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DE COOLDOWN E PROGRESSO DA MISSÃO ATIVA (VISÍVEL NO MAPA) */}
      {renderQuestProgressCard()}

      {/* BANNER DE BLOQUEIO SE O CAPITÃO ESTIVER NO DOJO DE TREINO */}
      {renderTrainingProgressCard()}

      {/* ========================================================= */}
      {/* 2. MAPA NÁUTICO COMO FUNDO INTERATIVO COM HOTSPOTS        */}
      {/* ========================================================= */}
      <div className="relative w-full rounded-2xl border-2 border-amber-900/70 shadow-2xl overflow-hidden bg-[#0d1f33] select-none group">
        
        {/* Contêiner proporcional exato com a imagem de fundo do pergaminho */}
        <div className="relative w-full aspect-[2754/1536]">
          {/* A Imagem do Mapa Náutico */}
          <img
            src="/cenario/mapa_mundi.png"
            alt="Mapa Náutico de Ilhas - East Blue"
            className="w-full h-full object-fill pointer-events-none"
          />

          {/* Efeito de vinheta e sombra suave nas bordas para reforçar o pergaminho */}
          <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] pointer-events-none" />

          {/* HOTSPOTS INTERATIVOS SOBRE AS 5 ILHAS EM LINHA RETA */}
          {islands.map((island, index) => {
            const coords = island.mapCoordinates || { x: 13.6 + index * 18, y: 54.0 };
            const unlocked = isIslandUnlocked(index);
            const cleared = isIslandFullyCleared(island);

            return (
              <div
                key={island.id}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                {/* Botão Interativo Unificado (Pin + Card com Nome da Ilha) */}
                <button
                  type="button"
                  onClick={() => {
                    if (unlocked) {
                      handleSelectIsland(island);
                    } else {
                      setNotification(`A rota para ${island.name} está bloqueada! Conclua o Capítulo ${island.chapterNumber - 1} primeiro.`);
                    }
                  }}
                  className={`group/island flex flex-col items-center transition-all duration-300 ${
                    unlocked
                      ? 'cursor-pointer hover:scale-110 active:scale-95'
                      : 'cursor-not-allowed opacity-85'
                  }`}
                  title={`${island.name} (Capítulo ${island.chapterNumber}) — ${unlocked ? 'Clique para abrir missões' : 'Bloqueada'}`}
                >
                  {/* Ícone / Pin Central */}
                  <div className="relative flex items-center justify-center transition-transform duration-300 group-hover/island:scale-115">
                    {/* Ilha 100% Concluída: Pin Dourado com Estrela */}
                    {cleared && (
                      <span className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.9)] ring-2 sm:ring-4 ring-amber-300/80 flex items-center justify-center text-sm sm:text-base">
                        ⭐
                      </span>
                    )}

                    {/* Ilha Desbloqueada & Em Andamento: Farol / Bússola Pulsante */}
                    {unlocked && !cleared && (
                      <div className="relative flex items-center justify-center">
                        {/* Onda de radar expandindo */}
                        <span className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-sky-400/40 animate-ping pointer-events-none" />
                        {/* Pin Central Ativo */}
                        <span className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-sky-600 via-sky-500 to-amber-500 text-white font-black shadow-[0_0_25px_rgba(14,165,233,0.95)] ring-2 sm:ring-4 ring-white flex items-center justify-center">
                          <Ship className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow" />
                        </span>
                      </div>
                    )}

                    {/* Ilha Bloqueada: Cadeado Protetor */}
                    {!unlocked && (
                      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/90 text-slate-400 border-2 border-slate-700 shadow-xl flex items-center justify-center">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      </span>
                    )}
                  </div>

                  {/* Placa Flutuante Compacta com Apenas o Nome da Ilha em Destaque */}
                  <div className={`mt-1 sm:mt-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg backdrop-blur-md shadow-2xl text-center border transition-all duration-200 ${
                    cleared
                      ? 'bg-slate-950/95 border-amber-500/70 shadow-amber-950/50 group-hover/island:border-amber-400 group-hover/island:bg-amber-950/70'
                      : unlocked
                      ? 'bg-slate-950/95 border-amber-900/80 shadow-sky-950/40 group-hover/island:border-sky-400 group-hover/island:bg-slate-900/95'
                      : 'bg-slate-950/85 border-slate-800'
                  }`}>
                    <p className={`text-[9px] sm:text-xs font-black uppercase font-serif tracking-wide whitespace-nowrap ${
                      cleared
                        ? 'text-amber-300'
                        : unlocked
                        ? 'text-amber-200 group-hover/island:text-white'
                        : 'text-slate-400'
                    }`}>
                      {island.name}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CARDS INFORMATIVOS RÁPIDOS ABAIXO DO MAPA              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {islands.map((island, index) => {
          const unlocked = isIslandUnlocked(index);
          const cleared = isIslandFullyCleared(island);
          const completedCount = getCompletedQuestsCount(island);

          return (
            <button
              key={island.id}
              type="button"
              onClick={() => {
                if (unlocked) {
                  handleSelectIsland(island);
                } else {
                  setNotification(`A rota para ${island.name} está bloqueada! Conclua o Capítulo ${island.chapterNumber - 1} primeiro.`);
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                cleared
                  ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 hover:bg-amber-950/40'
                  : unlocked
                  ? 'bg-sky-950/30 border-sky-600/60 hover:border-sky-400 hover:bg-sky-950/50'
                  : 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>Capítulo {island.chapterNumber}</span>
                  <span>{island.icon}</span>
                </div>
                <h4 className="text-xs font-black text-slate-100 truncate">{island.name}</h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">Chefe: {island.boss.name}</p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold">
                <span className={cleared ? 'text-amber-400' : unlocked ? 'text-sky-300' : 'text-slate-500'}>
                  {cleared ? '★ Concluída' : unlocked ? `${completedCount}/10 Missões` : 'Bloqueada'}
                </span>
                {unlocked && <ChevronRight className="w-3 h-3 text-slate-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL / PAINEL LATERAL DE MISSÕES DO CAPÍTULO (10 MISSÕES) */}
      {/* ========================================================= */}
      {selectedIsland && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-5xl xl:max-w-6xl max-h-[96vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl border-2 border-amber-600/60 shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Cabeçalho Compacto do Modal do Capítulo */}
            <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border-b border-amber-900/60 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0 flex-1 overflow-hidden">
                <span className="text-xl sm:text-2xl shrink-0">{selectedIsland.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/90 px-2 py-0.5 rounded border border-sky-700">
                      Capítulo {selectedIsland.chapterNumber} • {selectedIsland.sea}
                    </span>
                    <span className="text-[9px] bg-slate-950 text-slate-300 font-bold px-1.5 py-0.5 rounded border border-slate-800">
                      Nível {selectedIsland.recommendedLevel}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-100 font-serif truncate mt-0.5">
                    {selectedIsland.name}
                    <span className="text-xs text-slate-400 font-sans font-normal truncate hidden md:inline ml-2.5 border-l border-slate-700 pl-2.5">
                      {selectedIsland.description}
                    </span>
                  </h3>
                </div>
              </div>

              {/* Controles do Topo: Alternador Carta Náutica / Lista e Fechar */}
              <div className="flex items-center space-x-2 shrink-0">
                {ISLAND_CHART_CONFIG[selectedIsland.id] && (
                  <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('map');
                        setInspectedQuest(null);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black flex items-center gap-1 transition cursor-pointer ${
                        viewMode === 'map'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Visualizar Carta Náutica da Ilha"
                    >
                      <Map className="w-3 h-3" />
                      <span className="hidden sm:inline">Carta Náutica</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('list');
                        setInspectedQuest(null);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black flex items-center gap-1 transition cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Visualizar Lista de Missões"
                    >
                      <List className="w-3 h-3" />
                      <span className="hidden sm:inline">Lista</span>
                    </button>
                  </div>
                )}

                {/* Botão Fechar Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIsland(null);
                    setInspectedQuest(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0 border border-slate-800"
                  title="Fechar e voltar ao mapa"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Barra de Progresso do Capítulo */}
            <div className="px-4 sm:px-5 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] shrink-0">
              <div className="flex items-center space-x-1.5">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-300">
                  Progresso: {getCompletedQuestsCount(selectedIsland)} / {selectedIsland.quests.length} Missões Concluídas
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-amber-400 font-bold flex items-center space-x-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{player.berries.toLocaleString()} ฿</span>
                </span>
                <span className="text-sky-400 font-bold flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 fill-sky-400" />
                  <span>{player.energy.current} / {player.energy.max} Energia</span>
                </span>
              </div>
            </div>

            {/* Banner de Cooldown e Progresso da Missão Ativa (Slim dentro do modal) */}
            {activeQuestData && (
              <div className="mx-3 sm:mx-4 mt-2 px-3 py-1.5 bg-sky-950/80 border border-sky-500/70 rounded-xl flex items-center justify-between text-xs shadow-md animate-fade-in shrink-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                  </span>
                  <span className="text-[11px] font-bold text-sky-200 truncate">
                    Expedição em Andamento: <strong className="text-white">{activeQuestData.questName}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono font-bold text-sky-400 text-xs">
                    ⏱️ {formatTime(activeQuestData.remainingSeconds)}
                  </span>
                  {onCompleteQuestDev && (
                    <button
                      type="button"
                      onClick={onCompleteQuestDev}
                      className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer"
                      title="Concluir imediatamente (Modo Dev)"
                    >
                      ⏩ Dev
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Banner de Bloqueio se o Capitão estiver no Dojo de Treino (Slim dentro do modal) */}
            {activeTrainingData && (
              <div className="mx-3 sm:mx-4 mt-2 px-3 py-1.5 bg-amber-950/80 border border-amber-500/70 rounded-xl flex items-center justify-between text-xs shadow-md animate-fade-in shrink-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <Dumbbell className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span className="text-[11px] font-bold text-amber-200 truncate">
                    Capitão Ocupado no Dojo: <strong className="text-white">{activeTrainingData.attributeName}</strong> (Expedições Bloqueadas)
                  </span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    ⏱️ {formatTime(activeTrainingData.remainingSeconds)}
                  </span>
                  {onCompleteTrainingDev && (
                    <button
                      type="button"
                      onClick={onCompleteTrainingDev}
                      className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer"
                      title="Concluir treino imediatamente (Modo Dev)"
                    >
                      ⏩ Treino (Dev)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* CONTEÚDO PRINCIPAL: CARTA NÁUTICA INTERATIVA OU LISTA VERTICAL */}
            {ISLAND_CHART_CONFIG[selectedIsland.id] && viewMode === 'map' ? (
              <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-3 flex flex-col items-center justify-center custom-scrollbar relative">
                <div className={`relative w-full min-w-[700px] sm:min-w-full ${ISLAND_CHART_CONFIG[selectedIsland.id].aspectRatio} rounded-xl overflow-hidden shadow-2xl border border-amber-950/80 select-none`}>
                  {/* Fundo: Imagem da Carta Náutica da Ilha */}
                  <img
                    src={ISLAND_CHART_CONFIG[selectedIsland.id].image}
                    alt={ISLAND_CHART_CONFIG[selectedIsland.id].title}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                  />

                  {/* 10 Hotspots Interativos da Carta Náutica */}
                  {ISLAND_CHART_CONFIG[selectedIsland.id].hotspots.map((spot) => {
                    const quest = selectedIsland.quests[spot.index];
                    if (!quest) return null;

                    const isCompleted = completedQuestIds.includes(quest.id);
                    const isUnlocked =
                      spot.index === 0 ||
                      completedQuestIds.includes(selectedIsland.quests[spot.index - 1]?.id) ||
                      isCompleted;
                    const isThisQuestActive = activeQuestData?.questId === quest.id;
                    const isInspected = inspectedQuest?.id === quest.id;
                    const isCombatMission = !!(quest.isBoss || quest.isMiniBoss);

                    return (
                      <div
                        key={quest.id}
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                      >
                        {/* Tooltip no Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap animate-fade-in">
                          <div className="bg-slate-950/95 border border-amber-500/70 text-slate-200 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md shadow-xl flex items-center gap-1.5 backdrop-blur-sm">
                            <span className="text-amber-400 font-mono">#{spot.number}</span>
                            <span>{quest.name}</span>
                            {isCompleted && (
                              <span className="text-emerald-400 text-[9px] font-black">
                                {isCombatMission ? '[💀 Vencido (Repetível)]' : '[✓ Concluída]'}
                              </span>
                            )}
                            {!isCompleted && quest.isBoss && (
                              <span className="text-red-400 text-[9px] font-black">[💀 Chefe Final]</span>
                            )}
                            {!isCompleted && quest.isMiniBoss && (
                              <span className="text-red-400 text-[9px] font-black">[💀 Mini-Chefe]</span>
                            )}
                            {!isUnlocked && (
                              <span className="text-slate-400 text-[9px] font-black">[🔒 Bloqueada]</span>
                            )}
                            {activeTrainingData && isUnlocked && !isCompleted && (
                              <span className="text-amber-400 text-[9px] font-black">[🥋 No Dojo]</span>
                            )}
                          </div>
                          <div className="w-1.5 h-1.5 bg-slate-950 border-r border-b border-amber-500/70 transform rotate-45 -mt-1" />
                        </div>

                        {/* Botão do Hotspot com Marcador Visual */}
                        <button
                          type="button"
                          onClick={() => setInspectedQuest(quest)}
                          className={`relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer transform hover:scale-125 select-none ${
                            isCompleted
                              ? isCombatMission
                                ? isInspected
                                  ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-emerald-500 text-slate-950 ring-4 ring-yellow-400 scale-115 shadow-[0_0_16px_rgba(16,185,129,0.9)]'
                                  : 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-950/90 border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-900 shadow-md ring-2 ring-emerald-500/50'
                                : isInspected
                                ? 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-500 text-slate-950 ring-4 ring-yellow-400 scale-115 shadow-xl'
                                : 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 hover:bg-emerald-900 shadow-md'
                              : isThisQuestActive
                              ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-sky-600 border-2 border-white text-white shadow-[0_0_16px_rgba(56,189,248,0.9)] animate-pulse ring-4 ring-sky-400/50'
                              : !isUnlocked
                              ? 'w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-950/85 border border-slate-700 text-slate-500 opacity-70 hover:opacity-100'
                              : isCombatMission
                              ? isInspected
                                ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-red-600 text-white ring-4 ring-yellow-400 scale-115 shadow-[0_0_20px_rgba(239,68,68,0.9)]'
                                : 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-gradient-to-tr from-red-700 via-red-600 to-amber-600 border-2 border-red-300 text-white ring-4 ring-red-500/60 animate-pulse shadow-lg'
                              : isInspected
                              ? 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-yellow-400 text-slate-950 ring-4 ring-white scale-115 shadow-xl font-black text-xs sm:text-sm'
                              : 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-yellow-100 text-slate-950 font-black text-xs sm:text-sm ring-4 ring-amber-400/50 animate-bounce shadow-lg'
                          }`}
                          title={`Ponto #${spot.number}: ${quest.name}`}
                        >
                          {isCompleted ? (
                            isCombatMission ? (
                              <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 stroke-[2.2]" />
                            ) : (
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 stroke-[3]" />
                            )
                          ) : isThisQuestActive ? (
                            <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                          ) : !isUnlocked ? (
                            <Lock className="w-3 h-3 text-slate-400" />
                          ) : isCombatMission ? (
                            <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-100 fill-red-500/25 animate-pulse" />
                          ) : (
                            <span>{spot.number}</span>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* Painel Flutuante de Inspeção da Missão Selecionada */}
                  {inspectedQuest && (
                    <div className="absolute z-30 bottom-3 right-3 left-3 sm:left-auto sm:w-[380px] bg-slate-950/95 backdrop-blur-md border-2 border-amber-500/80 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5 animate-fade-in">
                      {/* Cabeçalho */}
                      <div className="flex items-start justify-between gap-2 border-b border-amber-900/40 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {(() => {
                            const isCombatInspected = !!(inspectedQuest.isBoss || inspectedQuest.isMiniBoss);
                            const isCompletedInspected = completedQuestIds.includes(inspectedQuest.id);
                            return (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded font-mono shrink-0 ${
                                  isCombatInspected
                                    ? isCompletedInspected
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                      : 'bg-red-950 text-red-300 border border-red-700'
                                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                                }`}
                              >
                                {inspectedQuest.isBoss
                                  ? isCompletedInspected ? '💀 CHEFE VENCIDO' : '💀 CHEFE FINAL'
                                  : inspectedQuest.isMiniBoss
                                  ? isCompletedInspected ? '💀 MINI-CHEFE VENCIDO' : '💀 MINI-CHEFE'
                                  : `MISSÃO #${selectedIsland.quests.findIndex((q) => q.id === inspectedQuest.id) + 1}`}
                              </span>
                            );
                          })()}
                          <h4 className="text-sm font-black text-slate-100 truncate">
                            {inspectedQuest.name}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectedQuest(null)}
                          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
                          title="Fechar detalhes"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Descrição */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {inspectedQuest.description}
                      </p>

                      {/* Badges de Custo, Duração e Recompensas */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Custo</span>
                          <span className="text-amber-400 font-black flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-amber-400" />
                            10 Energia
                          </span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Duração</span>
                          <span className="text-sky-300 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-sky-400" />
                            {inspectedQuest.isBoss || inspectedQuest.isMiniBoss ? 'Batalha' : '1h'}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center justify-between col-span-2">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">Recompensas</span>
                          <div className="flex items-center gap-3">
                            <span className="text-amber-400 font-bold flex items-center gap-0.5">
                              <Coins className="w-3 h-3" />
                              +{inspectedQuest.rewards.berriesMin}-{inspectedQuest.rewards.berriesMax} ฿
                            </span>
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <Award className="w-3 h-3" />
                              +{inspectedQuest.rewards.experience} XP
                            </span>
                            {(inspectedQuest.rewards.possibleFruitDropId || (inspectedQuest.isBoss && inspectedQuest.rewards.fruitDropChance)) && (
                              <span className="text-purple-300 font-black text-[10px] bg-purple-950 px-1.5 py-0.5 rounded border border-purple-600">
                                ✨ Fruta ({Math.round((inspectedQuest.rewards.fruitDropChance || 0) * 100)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botão de Ação */}
                      <div className="pt-1">
                        {(() => {
                          const questIdx = selectedIsland.quests.findIndex((q) => q.id === inspectedQuest.id);
                          const isCompleted = completedQuestIds.includes(inspectedQuest.id);
                          const isUnlocked =
                            questIdx === 0 ||
                            completedQuestIds.includes(selectedIsland.quests[questIdx - 1]?.id) ||
                            isCompleted;
                          const isThisQuestActive = activeQuestData?.questId === inspectedQuest.id;
                          const isAnyQuestActive = !!activeQuestData;
                          const canAfford = player.energy.current >= inspectedQuest.energyCost;
                          const isBattle = !!(inspectedQuest.isBoss || inspectedQuest.isMiniBoss);

                          if (!isUnlocked) {
                            return (
                              <div className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Bloqueada — Conclua a Missão #{questIdx}</span>
                              </div>
                            );
                          }

                          if (isThisQuestActive) {
                            return (
                              <div className="w-full py-2 bg-sky-950 border border-sky-500 text-sky-300 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow animate-pulse">
                                <Compass className="w-4 h-4 animate-spin text-sky-400" />
                                <span>Em Progresso ({formatTime(activeQuestData!.remainingSeconds)})</span>
                              </div>
                            );
                          }

                          if (!isBattle && isCompleted) {
                            return (
                              <div className="w-full py-2 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-black text-xs rounded-xl flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Missão Já Concluída</span>
                              </div>
                            );
                          }

                          if (activeTrainingData) {
                            return (
                              <div
                                className="w-full py-2.5 bg-slate-900 border border-amber-600/50 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-85 shadow"
                                title="Capitão ocupado no Dojo de Treino"
                              >
                                <Dumbbell className="w-4 h-4 text-amber-400 animate-pulse" />
                                <span>Capitão no Dojo de Treino ({formatTime(activeTrainingData.remainingSeconds)})</span>
                              </div>
                            );
                          }

                          if (isAnyQuestActive) {
                            return (
                              <div className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Expedição em Andamento (Aguarde o Cooldown)</span>
                              </div>
                            );
                          }

                          if (!canAfford) {
                            return (
                              <div className="w-full py-2 bg-red-950/60 border border-red-800 text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Energia Insuficiente (Requer 10 ⚡)</span>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                onStartQuest(inspectedQuest, selectedIsland);
                                setInspectedQuest(null);
                              }}
                              className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 ${
                                inspectedQuest.isBoss
                                  ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow-red-950/60'
                                  : inspectedQuest.isMiniBoss
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-purple-950/60'
                                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-950/60'
                              }`}
                            >
                              {inspectedQuest.isBoss ? (
                                <>
                                  <Skull className={`w-4 h-4 ${isCompleted ? 'text-emerald-300' : 'text-amber-200 fill-current'}`} />
                                  <span>10⚡ {isCompleted ? 'Repetir Batalha do Chefe' : 'Desafiar Chefe Final'}</span>
                                </>
                              ) : inspectedQuest.isMiniBoss ? (
                                <>
                                  <Skull className={`w-4 h-4 ${isCompleted ? 'text-emerald-300' : 'text-pink-200 fill-current'}`} />
                                  <span>10⚡ {isCompleted ? 'Repetir Batalha' : 'Entrar em Combate'}</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 fill-current" />
                                  <span>10⚡ Iniciar Expedição (1h)</span>
                                </>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* LISTA COMPACTADA DAS 10 MISSÕES DO CAPÍTULO (ENQUADRADA SEM SCROLL VERTICAL) */
              <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-1 sm:space-y-1.5 custom-scrollbar">
              {selectedIsland.quests.map((quest, index) => {
                const isCompleted = completedQuestIds.includes(quest.id);
                // Desbloqueada estritamente em sequência: a Missão N só libera se a Missão N-1 estiver concluída
                const isUnlocked =
                  index === 0 ||
                  completedQuestIds.includes(selectedIsland.quests[index - 1].id) ||
                  isCompleted;
                const canAfford = player.energy.current >= quest.energyCost;
                const isBattle = !!(quest.isBoss || quest.isMiniBoss);
                const isThisQuestActive = activeQuestData?.questId === quest.id;
                const isAnyQuestActive = !!activeQuestData;

                return (
                  <div
                    key={quest.id}
                    className={`w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 shadow-sm ${
                      quest.isBoss
                        ? 'bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/60 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : quest.isMiniBoss
                        ? 'bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/60 border-purple-500/80'
                        : isThisQuestActive
                        ? 'bg-slate-900/90 border-sky-500/80 ring-1 ring-sky-400/40'
                        : isCompleted
                        ? 'bg-slate-950/80 border-emerald-800/40'
                        : isUnlocked
                        ? 'bg-slate-950/80 border-slate-800 hover:border-sky-500/60'
                        : 'bg-slate-950/40 border-slate-900/60 opacity-50'
                    }`}
                  >
                    {/* Esquerda: Identificação + Título */}
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 font-mono ${
                          quest.isBoss
                            ? 'bg-red-950 text-red-300 border-red-700'
                            : quest.isMiniBoss
                            ? 'bg-purple-950 text-purple-300 border-purple-700'
                            : isCompleted
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        #{index + 1}
                      </span>

                      {quest.isBoss && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center space-x-0.5 shrink-0 shadow ${
                          isCompleted ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-600' : 'bg-red-600 text-white'
                        }`}>
                          <Skull className={`w-2.5 h-2.5 ${isCompleted ? 'text-emerald-300' : 'text-red-200 fill-current'}`} />
                          <span>{isCompleted ? 'Chefe Vencido' : 'Chefe'}</span>
                        </span>
                      )}

                      {quest.isMiniBoss && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center space-x-0.5 shrink-0 shadow ${
                          isCompleted ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-600' : 'bg-purple-700 text-purple-100'
                        }`}>
                          <Skull className={`w-2.5 h-2.5 ${isCompleted ? 'text-emerald-300' : 'text-purple-300'}`} />
                          <span>{isCompleted ? 'Mini-Chefe Vencido' : 'Mini-Chefe'}</span>
                        </span>
                      )}

                      {(quest.rewards.possibleFruitDropId || (quest.isBoss && quest.rewards.fruitDropChance)) && (!isCompleted || quest.isBoss) && (
                        <span className="text-[8px] font-black text-amber-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-600 shrink-0 hidden sm:inline">
                          ✨ Fruta ({Math.round((quest.rewards.fruitDropChance || 0) * 100)}%)
                        </span>
                      )}

                      <div className="flex items-baseline space-x-2 min-w-0 overflow-hidden">
                        <h4 className="text-xs font-black text-slate-100 truncate flex items-center space-x-1 shrink-0">
                          {quest.bossAvatar && <span className="text-xs mr-0.5">{quest.bossAvatar}</span>}
                          <span className={quest.isBoss ? 'text-red-200' : quest.isMiniBoss ? 'text-purple-200' : ''}>
                            {quest.name}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate hidden xl:inline">
                          — {quest.description}
                        </p>
                      </div>
                    </div>

                    {/* Direita: Recompensas + Botão de Ação / Status */}
                    <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
                      {/* Recompensas */}
                      <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                        <span className="text-amber-400 font-bold flex items-center">
                          <Coins className="w-3 h-3 mr-0.5" />
                          +{quest.rewards.berriesMin}-{quest.rewards.berriesMax} ฿
                        </span>
                        <span className="text-emerald-400 font-bold flex items-center">
                          <Award className="w-3 h-3 mr-0.5" />
                          +{quest.rewards.experience} XP
                        </span>
                        {isBattle ? (
                          <span className="text-red-400 font-bold flex items-center hidden sm:flex">
                            <Swords className="w-3 h-3 mr-0.5" />
                            Batalha
                          </span>
                        ) : (
                          <span className="text-sky-400 font-bold flex items-center hidden sm:flex">
                            <Clock className="w-3 h-3 mr-0.5" />
                            1h
                          </span>
                        )}
                      </div>

                      {/* Botões e Regras de Trava e Conclusão */}
                      {/* REGRA 3: Missão padrão já concluída NÃO pode ser repetida */}
                      {!isBattle && isCompleted ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/80 border border-emerald-700/70 text-emerald-300 flex items-center space-x-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Concluída</span>
                        </span>
                      ) : !isUnlocked ? (
                        /* Bloqueada sequencialmente */
                        <div className="flex items-center space-x-1 text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-bold whitespace-nowrap shrink-0">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Requer #{index}</span>
                        </div>
                      ) : isThisQuestActive ? (
                        /* Esta missão é a que está em andamento */
                        <div className="px-2.5 py-1 bg-sky-950/90 border border-sky-500 text-sky-300 font-black text-[10px] rounded-lg flex items-center space-x-1 shadow animate-pulse shrink-0">
                          <Compass className="w-3 h-3 animate-spin" />
                          <span>Em Progresso ({formatTime(activeQuestData!.remainingSeconds)})</span>
                        </div>
                      ) : activeTrainingData ? (
                        /* Bloqueado por Treino Ativo no Dojo */
                        <div
                          className="px-2.5 py-1 bg-slate-900 border border-amber-600/40 text-amber-300 font-bold text-[10px] rounded-lg cursor-not-allowed opacity-80 flex items-center space-x-1 shrink-0"
                          title="Capitão ocupado no Dojo de Treino"
                        >
                          <Dumbbell className="w-3 h-3 text-amber-400" />
                          <span>Em Treino (Dojo)</span>
                        </div>
                      ) : isAnyQuestActive ? (
                        /* REGRA 2: Quando qualquer missão estiver em andamento, TODAS as outras ficam travadas */
                        <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-500 font-bold text-[10px] rounded-lg cursor-not-allowed opacity-50 shrink-0">
                          ⏱️ Em Missão
                        </div>
                      ) : isBattle ? (
                        /* Batalha contra Chefe / Mini-chefe: permite iniciar ou repetir */
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onStartQuest(quest, selectedIsland)}
                          className={`px-3 py-1 rounded-lg font-black text-xs transition shadow flex items-center space-x-1 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 hover:bg-emerald-900 shadow-emerald-950/40'
                              : quest.isBoss
                              ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow-red-950/60'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-purple-950/60'
                          }`}
                        >
                          <Skull className={`w-3 h-3 ${isCompleted ? 'text-emerald-400' : 'text-red-200 fill-current'}`} />
                          <span>
                            10⚡ {isCompleted ? 'Repetir Batalha' : quest.isBoss ? 'Desafiar Chefe' : 'Batalhar'}
                          </span>
                        </button>
                      ) : (
                        /* Missão Padrão pronta para iniciar */
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onStartQuest(quest, selectedIsland)}
                          className="px-3 py-1 rounded-lg font-black text-xs transition shadow flex items-center space-x-1 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>10⚡ Iniciar (1h)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Rodapé do Modal com Informações do Chefe & Ações */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="text-base">{selectedIsland.boss.avatar}</span>
                <span className="text-[11px]">
                  Chefe Final: <strong className="text-slate-200">{selectedIsland.boss.name}</strong> (+{selectedIsland.boss.rewardBerries.toLocaleString()} ฿)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIsland(null)}
                className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-bold text-xs transition cursor-pointer"
              >
                Voltar ao Mapa
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
