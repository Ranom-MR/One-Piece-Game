'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Player, PlayerAttributes, PirateAppearance } from '@/types/player';
import { Quest, Island } from '@/types/island';
import { CombatFighter, CombatResult, CombatTurnAction } from '@/types/combat';
import { simulateCombat } from '@/core/combat';
import { calculateMaxHp, getEffectiveAttributes } from '@/core/stats';
import { calculateGearBonuses } from '@/data/equipmentItems';
import { DevilFruit } from '@/types/fruit';
import fruitsData from '@/data/fruits.json';
import { PirateAvatar } from '@/components/PirateAvatar';
import { DevilFruitFxLayer } from './DevilFruitFxLayer';
import { Swords, Trophy, Skull } from 'lucide-react';

export interface CombatModalProps {
  player: Player;
  quest: Quest;
  island: Island;
  onVictory: (quest: Quest, island: Island, result: CombatResult) => void;
  onClose: () => void;
}

export function CombatModal({
  player,
  quest,
  island,
  onVictory,
  onClose,
}: CombatModalProps) {
  // 1. Constrói lutador do jogador com bônus de equipamentos e Akuma no Mi ativa
  const playerFighter = useMemo<CombatFighter>(() => {
    const gearBonuses = calculateGearBonuses(player.equippedGear);
    const equippedFruit = (fruitsData as unknown as DevilFruit[]).find(
      (f) => f.id === player.equippedFruitId
    );
    const effectiveAttributes = getEffectiveAttributes(
      player.attributes,
      equippedFruit,
      gearBonuses
    );
    const maxHp = calculateMaxHp(effectiveAttributes.resistance, player.level);

    return {
      id: player.id,
      name: player.name,
      level: player.level,
      attributes: effectiveAttributes,
      currentHp: maxHp,
      maxHp,
      isPlayer: true,
      equippedFruitId: player.equippedFruitId,
    };
  }, [player]);

  // Identifica se o oponente possui Akuma no Mi oficial ativa
  const enemyFruitId = useMemo<string | null>(() => {
    // Pode ser associado dinamicamente a chefes com Akuma no Mi oficial (ex: Smoker, Crocodile, Enel)
    return null;
  }, []);

  // 2. Constrói lutador inimigo (Chefe de Ilha ou Mini-Chefe da Missão)
  const enemyFighter = useMemo<CombatFighter>(() => {
    const isBoss = !!quest.isBoss;
    const enemyName = isBoss
      ? island.boss.name
      : quest.name.includes(':')
      ? quest.name.split(':')[1].trim()
      : quest.name;
    const enemyAttributes: PlayerAttributes = isBoss
      ? {
          strength: island.boss.attributes.strength,
          intelligence: island.boss.attributes.intelligence ?? island.boss.attributes.fruitPower ?? 6,
          agility: island.boss.attributes.agility,
          resistance: island.boss.attributes.resistance,
          fruitPower: island.boss.attributes.fruitPower,
        }
      : {
          strength: Math.max(6, Math.round(island.boss.attributes.strength * 0.75)),
          intelligence: Math.max(5, Math.round((island.boss.attributes.intelligence ?? island.boss.attributes.fruitPower ?? 6) * 0.75)),
          agility: Math.max(5, Math.round(island.boss.attributes.agility * 0.75)),
          resistance: Math.max(6, Math.round(island.boss.attributes.resistance * 0.75)),
          fruitPower: 0,
        };

    const enemyMaxHp = isBoss
      ? (island.boss.maxHp || calculateMaxHp(enemyAttributes.resistance, quest.recommendedLevel))
      : Math.round((island.boss.maxHp || calculateMaxHp(enemyAttributes.resistance, quest.recommendedLevel)) * 0.75);

    return {
      id: quest.id,
      name: enemyName,
      level: quest.recommendedLevel,
      attributes: enemyAttributes,
      currentHp: enemyMaxHp,
      maxHp: enemyMaxHp,
      isPlayer: false,
      equippedFruitId: enemyFruitId,
    };
  }, [quest, island, enemyFruitId]);

  // Aparência visual do inimigo para o avatar Paper-Doll
  const enemyAppearance = useMemo<Partial<PirateAppearance>>(() => {
    if (island.id === 'orange-town') {
      if (quest.id === 'ot-10' || quest.isBoss) {
        // Buggy, o Palhaço Estrela
        return {
          skinColor: '#f1c27d',
          hairStyle: 'long',
          hairColor: '#0284c7', // Cabelo azul vibrante do Buggy
          eyes: 'determined',
          mouth: 'grin',
          scar: 'none',
          hat: 'bandana_vermelha',
          outfit: 'striped',
          pants: 'calca_preta',
          shoes: 'sandalias_simples',
          outfitColor: '#dc2626',
        };
      }
      if (quest.id === 'ot-9') {
        // Mohji & Richie
        return {
          skinColor: '#e0ac69',
          hairStyle: 'spiky',
          hairColor: '#facc15',
          eyes: 'fierce',
          mouth: 'serious',
          hat: 'none',
          outfit: 'vest',
          pants: 'bermuda_preta',
          shoes: 'sandalias_simples',
          outfitColor: '#854d0e',
        };
      }
      // Cabaji (ot-5)
      return {
        skinColor: '#fcd34d',
        hairStyle: 'slick',
        hairColor: '#16a34a',
        eyes: 'confident',
        mouth: 'smirk',
        hat: 'bandana_listrada',
        outfit: 'coat',
        pants: 'calca_preta',
        shoes: 'sandalias_simples',
        outfitColor: '#ffffff',
      };
    }

    return {
      skinColor: '#d49b72',
      hairStyle: 'messy',
      hairColor: '#2b1d0c',
      eyes: 'fierce',
      mouth: 'smirk',
      scar: 'eye_cut',
      hat: 'bandana_vermelha',
      outfit: 'colete_vermelho',
      pants: 'bermuda_preta',
      shoes: 'sandalias_simples',
      outfitColor: '#7f1d1d',
    };
  }, [island.id, quest]);

  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [playerHp, setPlayerHp] = useState<number>(playerFighter.maxHp);
  const [enemyHp, setEnemyHp] = useState<number>(enemyFighter.maxHp);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Estados de animação e impacto
  const [isPlayerAttacking, setIsPlayerAttacking] = useState<boolean>(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState<boolean>(false);
  const [isPlayerHit, setIsPlayerHit] = useState<boolean>(false);
  const [isEnemyHit, setIsEnemyHit] = useState<boolean>(false);
  const [floatingText, setFloatingText] = useState<{
    target: 'player' | 'enemy';
    text: string;
    isCrit: boolean;
    isDodge: boolean;
  } | null>(null);

  const combatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializa a simulação de combate
  useEffect(() => {
    const result = simulateCombat(playerFighter, enemyFighter);
    setCombatResult(result);
    setCurrentTurnIndex(0);
    setPlayerHp(playerFighter.maxHp);
    setEnemyHp(enemyFighter.maxHp);
    setIsFinished(false);
    setFloatingText(null);
    setIsPlayerAttacking(false);
    setIsEnemyAttacking(false);
    setIsPlayerHit(false);
    setIsEnemyHit(false);

    return () => {
      if (combatTimeoutRef.current) clearTimeout(combatTimeoutRef.current);
    };
  }, [playerFighter, enemyFighter]);

  // Loop de execução assistida turno a turno (sem pulo, 1.25s por turno)
  useEffect(() => {
    if (!combatResult || isFinished) return;

    if (currentTurnIndex < combatResult.turns.length) {
      combatTimeoutRef.current = setTimeout(() => {
        const turn = combatResult.turns[currentTurnIndex];
        const isPlayerAttacker = turn.attackerId === playerFighter.id;

        // Atualiza o HP do defensor imediatamente
        if (isPlayerAttacker) {
          setEnemyHp(turn.defenderRemainingHp);
        } else {
          setPlayerHp(turn.defenderRemainingHp);
        }

        // Animação de investida do atacante e recuo de dano
        if (isPlayerAttacker) {
          setIsPlayerAttacking(true);
          setTimeout(() => {
            setIsPlayerAttacking(false);
            if (!turn.isDodged) {
              setIsEnemyHit(true);
              setTimeout(() => setIsEnemyHit(false), 380);
            }
          }, 260);
        } else {
          setIsEnemyAttacking(true);
          setTimeout(() => {
            setIsEnemyAttacking(false);
            if (!turn.isDodged) {
              setIsPlayerHit(true);
              setTimeout(() => setIsPlayerHit(false), 380);
            }
          }, 260);
        }

        // Texto flutuante de dano ou esquiva
        const targetSide = isPlayerAttacker ? 'enemy' : 'player';
        if (turn.isDodged) {
          setFloatingText({
            target: targetSide,
            text: 'ESQUIVA!',
            isCrit: false,
            isDodge: true,
          });
        } else {
          setFloatingText({
            target: targetSide,
            text: turn.isCritical ? `CRÍTICO! -${turn.damageDealt} HP` : `-${turn.damageDealt} HP`,
            isCrit: turn.isCritical,
            isDodge: false,
          });
        }

        setTimeout(() => {
          setFloatingText(null);
        }, 900);

        setCurrentTurnIndex((prev) => prev + 1);
      }, 1250);
    } else {
      // Batalha finalizada
      setIsFinished(true);
      if (combatResult.winnerId === playerFighter.id) {
        setEnemyHp(0);
      } else {
        setPlayerHp(0);
      }
    }

    return () => {
      if (combatTimeoutRef.current) clearTimeout(combatTimeoutRef.current);
    };
  }, [combatResult, currentTurnIndex, isFinished, playerFighter.id]);

  if (!combatResult) return null;

  const currentTurnAction: CombatTurnAction | null =
    currentTurnIndex > 0 ? combatResult.turns[currentTurnIndex - 1] : null;

  const isVictory = combatResult.winnerId === playerFighter.id;
  const playerHpPercent = Math.max(0, Math.min(100, (playerHp / playerFighter.maxHp) * 100));
  const enemyHpPercent = Math.max(0, Math.min(100, (enemyHp / enemyFighter.maxHp) * 100));

  const handleFinish = () => {
    if (isVictory) {
      onVictory(quest, island, combatResult);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-slate-950/95 border-2 border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* TOPO: Barras de Vida e Título */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-4 border-b border-amber-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black tracking-wider text-amber-100 uppercase">
                Confronto em Alto Mar
              </h2>
            </div>
            <div className="px-3 py-1 bg-black/60 rounded-full border border-amber-500/30 text-xs font-bold text-amber-300">
              Turno {Math.min(currentTurnIndex + 1, combatResult.turns.length)} / {combatResult.turns.length}
            </div>
          </div>

          {/* Barras de HP Duplas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player HP */}
            <div className="bg-black/50 p-2.5 rounded-xl border border-blue-500/30 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-300 truncate max-w-[120px] sm:max-w-[160px]">
                  {playerFighter.name}
                </span>
                <span className="font-mono text-blue-200">
                  {Math.round(playerHp)} / {playerFighter.maxHp}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-blue-900/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 ease-out"
                  style={{ width: `${playerHpPercent}%` }}
                />
              </div>
            </div>

            {/* Enemy HP */}
            <div className="bg-black/50 p-2.5 rounded-xl border border-red-500/30 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-red-200">
                  {Math.round(enemyHp)} / {enemyFighter.maxHp}
                </span>
                <span className="font-bold text-red-300 truncate max-w-[120px] sm:max-w-[160px]">
                  {enemyFighter.name}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-red-900/50">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300 ease-out"
                  style={{ width: `${enemyHpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ARENA VISUAL: Convés do Navio com Sprites Frente a Frente (Estilo Dojo) */}
        <div className="relative w-full h-[360px] sm:h-[420px] overflow-hidden flex items-end justify-between px-8 sm:px-16 pb-6">
          {/* Imagem de Fundo da Arena */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85 pointer-events-none"
            style={{
              backgroundImage: "url('/cenario/conves_treino_vazio.png')",
              filter: 'brightness(0.7) contrast(1.15)',
            }}
          />

          {/* Vinheta atmosférica */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

          {/* LADO ESQUERDO: Pirata do Jogador */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Texto Flutuante de Dano no Jogador */}
            {floatingText && floatingText.target === 'player' && (
              <div
                className={`absolute -top-12 z-30 font-black text-sm sm:text-base animate-bounce px-2.5 py-1 rounded-md shadow-lg ${
                  floatingText.isDodge
                    ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-400'
                    : floatingText.isCrit
                    ? 'text-yellow-300 bg-red-950/90 border border-yellow-400 text-lg'
                    : 'text-red-400 bg-black/80 border border-red-500'
                }`}
              >
                {floatingText.text}
              </div>
            )}

            {/* Container do Avatar com Animação de Golpe / Dano */}
            <div
              className={`transition-all duration-200 ease-out transform flex flex-col items-center ${
                isPlayerAttacking
                  ? 'translate-x-16 sm:translate-x-24 scale-105 rotate-3'
                  : isPlayerHit
                  ? '-translate-x-6 sm:-translate-x-8 rotate-[-8deg] opacity-75 filter brightness-150 duration-150'
                  : 'translate-x-0 rotate-0 scale-100 duration-250 ease-in-out'
              }`}
            >
              <div className="w-[140px] sm:w-[170px] h-[220px] sm:h-[260px] relative flex items-center justify-center">
                <PirateAvatar
                  appearance={player.appearance}
                  overrideHat={player.equippedGear?.head?.spriteId}
                  overrideOutfit={player.equippedGear?.torso?.spriteId}
                  overridePants={player.equippedGear?.legs?.spriteId}
                  overrideShoes={player.equippedGear?.shoes?.spriteId}
                  fruitId={player.equippedFruitId}
                  className="w-full h-full"
                  showBackground={false}
                />
                {/* Camada Dedicada de VFX de Akuma no Mi (`devil-fruit-fx-layer`) */}
                <DevilFruitFxLayer
                  fruitId={player.equippedFruitId}
                  isAttacking={isPlayerAttacking}
                  isHit={isPlayerHit}
                />
              </div>

              {/* Sombra de Contato com o Chão */}
              <div className="w-28 h-4 bg-black/70 rounded-full blur-[2px] mt-1" />
            </div>

            {/* Rótulo do Jogador */}
            <div className="mt-2 text-center bg-black/60 px-3 py-0.5 rounded-full border border-blue-500/40">
              <span className="text-xs font-bold text-blue-200">{playerFighter.name}</span>
            </div>
          </div>

          {/* VERSUS ICON NO CENTRO: Pulsação suave de opacidade (estilo Dojo de Treino) */}
          <div className="relative z-10 flex flex-col items-center justify-center self-center mb-10 select-none pointer-events-none animate-pulse">
            <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shadow-lg">
              <Swords className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-black tracking-widest text-amber-300 mt-1 uppercase drop-shadow">
              VS
            </span>
          </div>

          {/* LADO DIREITO: Inimigo / Chefe (Espelhado para encarar o jogador) */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Texto Flutuante de Dano no Inimigo */}
            {floatingText && floatingText.target === 'enemy' && (
              <div
                className={`absolute -top-12 z-30 font-black text-sm sm:text-base animate-bounce px-2.5 py-1 rounded-md shadow-lg ${
                  floatingText.isDodge
                    ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-400'
                    : floatingText.isCrit
                    ? 'text-yellow-300 bg-red-950/90 border border-yellow-400 text-lg'
                    : 'text-red-400 bg-black/80 border border-red-500'
                }`}
              >
                {floatingText.text}
              </div>
            )}

            {/* Container de Movimento e Animação do Inimigo */}
            <div
              className={`transition-all duration-200 ease-out transform flex flex-col items-center ${
                isEnemyAttacking
                  ? '-translate-x-16 sm:-translate-x-24 scale-105 rotate-[-3deg]'
                  : isEnemyHit
                  ? 'translate-x-6 sm:translate-x-8 rotate-[8deg] opacity-75 filter brightness-150 duration-150'
                  : 'translate-x-0 rotate-0 scale-100 duration-250 ease-in-out'
              }`}
            >
              {/* Espelhamento horizontal do sprite para olhar para a esquerda */}
              <div className="scale-x-[-1] transform">
                <div className="w-[140px] sm:w-[170px] h-[220px] sm:h-[260px] relative flex items-center justify-center">
                  <PirateAvatar
                    appearance={enemyAppearance}
                    overrideHat="bandana_vermelha"
                    overrideOutfit="colete_vermelho"
                    overridePants="bermuda_preta"
                    overrideShoes="sandalias_simples"
                    fruitId={enemyFruitId}
                    className="w-full h-full"
                    showBackground={false}
                  />
                  {/* Camada Dedicada de VFX de Akuma no Mi no Inimigo (`devil-fruit-fx-layer`) */}
                  {enemyFruitId && (
                    <DevilFruitFxLayer
                      fruitId={enemyFruitId}
                      isAttacking={isEnemyAttacking}
                      isHit={isEnemyHit}
                      isMirrored
                    />
                  )}
                </div>
              </div>

              {/* Sombra de Contato com o Chão */}
              <div className="w-28 h-4 bg-black/70 rounded-full blur-[2px] mt-1" />
            </div>

            {/* Rótulo do Inimigo */}
            <div className="mt-2 text-center bg-black/60 px-3 py-0.5 rounded-full border border-red-500/40">
              <span className="text-xs font-bold text-red-300">{enemyFighter.name}</span>
            </div>
          </div>
        </div>

        {/* FEED DE LOG DO TURNO ATUAL */}
        <div className="bg-slate-950/90 border-t border-amber-900/50 p-3 sm:p-4 min-h-[70px] flex items-center justify-center">
          {currentTurnAction ? (
            <p className="text-xs sm:text-sm text-center text-slate-200 animate-fade-in font-medium">
              <span className="text-amber-400 font-bold">[{currentTurnAction.turnNumber}º Turno] </span>
              {currentTurnAction.logMessage}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 italic text-center">
              Os guerreiros tomam suas posições e preparam seus golpes...
            </p>
          )}
        </div>

        {/* TELA DE FIM DE COMBATE (VITÓRIA / DERROTA) */}
        {isFinished && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
            {isVictory ? (
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 animate-bounce">
                  <Trophy className="w-9 h-9 text-amber-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-300 uppercase tracking-widest mb-1">
                  Vitória Esmagadora!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-5">
                  Você superou as investidas de <span className="text-amber-200 font-bold">{enemyFighter.name}</span> e garantiu seu triunfo nas águas!
                </p>

                {/* Recompensas */}
                <div className="w-full bg-slate-900/80 border border-amber-500/30 rounded-xl p-3 mb-6 flex justify-around items-center">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Recompensa</span>
                    <span className="text-base font-black text-amber-300">+{quest.rewards.berriesMax.toLocaleString()} ฿</span>
                  </div>
                  <div className="h-8 w-px bg-amber-500/20" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Experiência</span>
                    <span className="text-base font-black text-blue-300">+{quest.rewards.experience} XP</span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 uppercase tracking-wider text-sm cursor-pointer"
                >
                  Coletar Recompensas
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4 animate-pulse">
                  <Skull className="w-9 h-9 text-red-500" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-red-400 uppercase tracking-widest mb-1">
                  Derrota em Batalha
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-5">
                  Você caiu perante o poder de <span className="text-red-300 font-bold">{enemyFighter.name}</span>. Treine no Dojo, melhore seus equipamentos e tente novamente!
                </p>

                <button
                  onClick={handleFinish}
                  className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold rounded-xl border border-slate-600 shadow-lg transition-all duration-200 transform hover:scale-105 uppercase tracking-wider text-sm cursor-pointer"
                >
                  Recuar e Recuperar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CombatModal;
