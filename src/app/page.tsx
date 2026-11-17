'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Player, PlayerAttributes, ActiveTraining, ActiveQuest, InventoryItem } from '@/types/player';
import { DevilFruit } from '@/types/fruit';
import { Island, Quest } from '@/types/island';
import { CombatResult } from '@/types/combat';
import {
  loadSavedPlayer,
  savePlayer,
  deletePlayerSave,
} from '@/storage/playerStorage';
import { calculateMaxHp, getEffectiveAttributes, addExperience } from '@/core/stats';
import { PlayerHeader } from '@/components/hud/PlayerHeader';
import { CharacterCreationFlow } from '@/components/character-creation/CharacterCreationFlow';
import { BackpackTab } from '@/components/inventory/BackpackTab';
import { ExplorationTab } from '@/components/exploration/ExplorationTab';
import { DojoArena } from '@/components/dojo/DojoArena';
import { PirateAvatar } from '@/components/PirateAvatar';
import { WantedPoster } from '@/components/WantedPoster';
import { CombatModal } from '@/components/combat/CombatModal';
import { calculateGearBonuses } from '@/data/equipmentItems';
import { getAvatarById } from '@/data/avatars';
import islandsData from '@/data/islands.json';
import fruitsData from '@/data/fruits.json';
import {
  Compass,
  Dumbbell,
  Shield,
  Briefcase,
  Swords,
  Sparkles,
  Plus,
  RefreshCw,
  Coins,
  ChevronRight,
  CheckCircle2,
  Skull,
  Zap,
  Award,
  Clock,
  X,
  Brain,
} from 'lucide-react';

type Tab = 'STATUS' | 'EXPLORAR' | 'TREINO' | 'INVENTARIO';

const TRAINING_ENERGY_COST = 5;
const TRAINING_DURATION_SECONDS = 1800; // 30 minutos
const QUEST_ENERGY_COST = 10;
const STANDARD_QUEST_DURATION_SECONDS = 3600; // 1 hora (3600s) para missões padrão

function formatTrainingTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function GamePage() {
  const [mounted, setMounted] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('STATUS');

  // Estado para confronto de batalha interativa contra Chefe ou Mini-Chefe
  const [activeBattle, setActiveBattle] = useState<{
    quest: Quest;
    island: Island;
  } | null>(null);

  // Ticker de tempo para o treinamento do Dojo e Missões de Exploração
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Estado para evento/dilema da Akuma no Mi
  const [fruitEvent, setFruitEvent] = useState<{
    fruit: DevilFruit;
    fromInventory?: boolean;
  } | null>(null);
  const [fruitHoverTooltip, setFruitHoverTooltip] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = loadSavedPlayer();
    if (saved) {
      setPlayer(saved);
      setIsCreatingCharacter(false);
    } else {
      setIsCreatingCharacter(true);
    }
    setMounted(true);
  }, []);

  // Ticker de tempo em tempo real para Treino do Dojo (30 min) e Missões de Exploração (1h)
  useEffect(() => {
    if (!player?.activeTraining && !player?.activeQuest) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      if (player?.activeTraining && now >= player.activeTraining.endsAt) {
        completeTraining();
      }

      if (player?.activeQuest && now >= player.activeQuest.endsAt) {
        completeStandardQuest();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player?.activeTraining, player?.activeQuest]);

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="text-5xl animate-bounce">⚓</div>
        <p className="text-amber-400 font-extrabold text-xl tracking-wide">Carregando Diário de Bordo...</p>
        <p className="text-sm text-slate-400">Navegando pelos mares do East Blue</p>
      </div>
    );
  }

  // Se não houver save ou o usuário estiver criando pirata
  if (isCreatingCharacter || !player) {
    return (
      <CharacterCreationFlow
        onCharacterCreated={(newPlayer) => {
          setPlayer(newPlayer);
          setIsCreatingCharacter(false);
          showMessage(`Bem-vindo aos mares, Capitão ${newPlayer.name}!`);
        }}
      />
    );
  }

  const currentIsland: Island =
    (islandsData.find((isl) => isl.id === player.currentIslandId) as unknown as Island) ||
    (islandsData[0] as unknown as Island);
  const equippedFruit: DevilFruit | undefined = fruitsData.find(
    (f) => f.id === player.equippedFruitId
  ) as unknown as DevilFruit | undefined;
  const gearBonuses = calculateGearBonuses(player.equippedGear);
  const effectiveAttributes = getEffectiveAttributes(player.attributes, equippedFruit, gearBonuses);
  const playerAvatar = getAvatarById(player.avatar || 'luffy');

  function updateAndSavePlayer(updated: Player) {
    setPlayer(updated);
    savePlayer(updated);
  }

  function showMessage(msg: string) {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification(msg);
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 3200);
  }

  function allocatePoint(attr: keyof PlayerAttributes) {
    if (player!.availableAttributePoints <= 0) return;
    const attrNames: Record<keyof PlayerAttributes, string> = {
      strength: 'Força Física',
      intelligence: 'Inteligência',
      agility: 'Agilidade',
      resistance: 'Resistência',
      fruitPower: 'Poder de Fruta (Legado)',
    };
    const currentVal = player!.attributes[attr] ?? (attr === 'intelligence' ? (player!.attributes.fruitPower ?? 5) : 5);
    const updated: Player = {
      ...player!,
      availableAttributePoints: player!.availableAttributePoints - 1,
      attributes: {
        ...player!.attributes,
        [attr]: currentVal + 1,
      },
    };
    updateAndSavePlayer(updated);
    showMessage(`+1 ponto alocado em ${attrNames[attr]}! ✨`);
  }

  function startTraining(attr: keyof PlayerAttributes, name: string) {
    if (!player) return;
    if (player.activeQuest) {
      showMessage('O Capitão está em expedição nas ilhas! Aguarde a conclusão da missão para treinar.');
      return;
    }
    if (player.activeTraining) {
      showMessage('Um treinamento já está em andamento no Dojo!');
      return;
    }
    if (player.energy.current < TRAINING_ENERGY_COST) {
      showMessage(`Energia insuficiente! Treinar exige ${TRAINING_ENERGY_COST} de energia.`);
      return;
    }

    const now = Date.now();
    const activeTraining: ActiveTraining = {
      attribute: attr,
      attributeName: name,
      startedAt: now,
      durationSeconds: TRAINING_DURATION_SECONDS,
      endsAt: now + TRAINING_DURATION_SECONDS * 1000,
    };

    const updated: Player = {
      ...player,
      energy: {
        ...player.energy,
        current: player.energy.current - TRAINING_ENERGY_COST,
      },
      activeTraining,
    };

    updateAndSavePlayer(updated);
    showMessage(`🏋️ Treino de ${name} iniciado! Duração: 30 minutos (-${TRAINING_ENERGY_COST} Energia).`);
  }

  function completeTraining() {
    if (!player || !player.activeTraining) return;
    const { attribute, attributeName } = player.activeTraining;
    const updated: Player = {
      ...player,
      attributes: {
        ...player.attributes,
        [attribute]: ((player.attributes[attribute] as number) ?? 5) + 1,
      },
      activeTraining: null,
    };
    updateAndSavePlayer(updated);
    showMessage(`🎉 Treinamento de ${attributeName} concluído! +1 ponto garantido (agora ${updated.attributes[attribute] ?? 5})! 💪`);
  }

  function startQuest(quest: Quest, island: Island) {
    if (!player) return;

    // Regra de Exclusão Mútua: Não pode iniciar expedições ou batalhas enquanto treina no Dojo
    if (player.activeTraining) {
      showMessage('O Capitão está ocupado no Dojo de Treino! Aguarde o término do treino para realizar expedições ou batalhas.');
      return;
    }

    if (player.energy.current < quest.energyCost) {
      showMessage(`Energia insuficiente! Precisa de ${quest.energyCost} de energia.`);
      return;
    }

    // Se for missão de Batalha (Chefe Final ou Mini-Chefe), não usa cooldown e abre a arena interativa
    if (quest.isBoss || quest.isMiniBoss) {
      const updatedPlayer: Player = {
        ...player,
        energy: {
          ...player.energy,
          current: player.energy.current - quest.energyCost,
        },
      };
      updateAndSavePlayer(updatedPlayer);
      setActiveBattle({ quest, island });
      return;
    }

    // Missão Padrão: Duração de 1 hora (3600s) com cooldown em tempo real
    if (player.activeQuest) {
      showMessage('Já existe uma missão de exploração em andamento!');
      return;
    }

    const now = Date.now();
    const duration = STANDARD_QUEST_DURATION_SECONDS; // 3600
    const activeQuestData: ActiveQuest = {
      questId: quest.id,
      questName: quest.name,
      islandId: island.id,
      islandName: island.name,
      startedAt: now,
      durationSeconds: duration,
      endsAt: now + duration * 1000,
      rewards: quest.rewards,
    };

    const updatedPlayer: Player = {
      ...player,
      energy: {
        ...player.energy,
        current: player.energy.current - quest.energyCost,
      },
      activeQuest: activeQuestData,
    };

    updateAndSavePlayer(updatedPlayer);
    showMessage(`🧭 Missão "${quest.name}" iniciada! Duração: 1 hora (-${quest.energyCost} Energia).`);
  }

  function completeStandardQuest() {
    if (!player || !player.activeQuest) return;

    const { questId, questName, rewards } = player.activeQuest;
    const earnedBerries =
      Math.floor(
        Math.random() * (rewards.berriesMax - rewards.berriesMin + 1)
      ) + rewards.berriesMin;
    const earnedExp = rewards.experience;

    const { updatedPlayer: expPlayer, levelsGained, pointsGained } = addExperience(player, earnedExp);

    const currentCompleted = expPlayer.completedQuestIds || [];
    const newCompletedQuestIds = currentCompleted.includes(questId)
      ? currentCompleted
      : [...currentCompleted, questId];

    let finalPlayer: Player = {
      ...expPlayer,
      berries: expPlayer.berries + earnedBerries,
      completedQuestIds: newCompletedQuestIds,
      activeQuest: null,
    };

    updateAndSavePlayer(finalPlayer);

    if (levelsGained > 0) {
      showMessage(`🎉 SUBIU DE NÍVEL! Agora você é Nível ${finalPlayer.level} (+${pointsGained} pontos livres)! Missão concluída (+${earnedBerries.toLocaleString()} ฿ e +${earnedExp} XP).`);
    } else {
      showMessage(`🎉 Missão "${questName}" concluída! +${earnedBerries.toLocaleString()} ฿ e +${earnedExp} XP!`);
    }
  }

  function handleCombatVictory(quest: Quest, island: Island, result: CombatResult) {
    if (!player) return;

    const earnedBerries = quest.rewards.berriesMax;
    const earnedExp = quest.rewards.experience;
    const isFinalBoss = !!quest.isBoss;
    const bountyBonus = isFinalBoss ? island.boss.bountyIncrease : Math.round(island.boss.bountyIncrease * 0.4);

    const { updatedPlayer: expPlayer, levelsGained, pointsGained } = addExperience(player, earnedExp);

    // Registra missão completada
    const currentCompleted = expPlayer.completedQuestIds || [];
    const newCompletedQuestIds = currentCompleted.includes(quest.id)
      ? currentCompleted
      : [...currentCompleted, quest.id];

    // Verifica se concluiu ilha (Chefe Final)
    const currentCleared = expPlayer.clearedIslandIds || [];
    const newClearedIslandIds = isFinalBoss && !currentCleared.includes(island.id)
      ? [...currentCleared, island.id]
      : currentCleared;

    // Próxima ilha desbloqueada
    const allIslands = islandsData as unknown as Island[];
    let nextIslandId = expPlayer.currentIslandId;
    if (isFinalBoss) {
      const currentIndex = allIslands.findIndex((isl) => isl.id === island.id);
      if (currentIndex !== -1 && currentIndex + 1 < allIslands.length) {
        nextIslandId = allIslands[currentIndex + 1].id;
      }
    }

    // Regra de Obtenção de Akuma no Mi: Estritamente ao vencer o Chefe Final da ilha
    let droppedFruit: DevilFruit | null = null;
    let updatedInventory = expPlayer.inventory || [];

    if (isFinalBoss) {
      const dropChance = quest.rewards.fruitDropChance ?? 0.35;
      const roll = Math.random();

      if (roll < dropChance) {
        const isChapter1 = island.chapterNumber === 1 || island.id === 'windmill-village';
        const allFruits = fruitsData as unknown as DevilFruit[];

        if (isChapter1) {
          // No Capítulo 1 (Vila dos Moinhos), sorteia estritamente frutas da categoria/raridade 'Comum'
          const commonPool = allFruits.filter((f) => f.rarity === 'common');
          if (quest.rewards.possibleFruitDropId) {
            const specific = commonPool.find((f) => f.id === quest.rewards.possibleFruitDropId);
            droppedFruit = specific || commonPool[Math.floor(Math.random() * commonPool.length)] || null;
          } else if (commonPool.length > 0) {
            droppedFruit = commonPool[Math.floor(Math.random() * commonPool.length)];
          }
        } else {
          // Capítulos posteriores
          if (quest.rewards.possibleFruitDropId) {
            droppedFruit = allFruits.find((f) => f.id === quest.rewards.possibleFruitDropId) || null;
          }
          if (!droppedFruit && allFruits.length > 0) {
            droppedFruit = allFruits[Math.floor(Math.random() * allFruits.length)];
          }
        }

        // Se houve drop da fruta, o jogador decidirá no modal se come, vende ou guarda na mochila
      }
    }

    const finalPlayer: Player = {
      ...expPlayer,
      berries: expPlayer.berries + earnedBerries,
      bounty: expPlayer.bounty + bountyBonus,
      completedQuestIds: newCompletedQuestIds,
      clearedIslandIds: newClearedIslandIds,
      currentIslandId: nextIslandId,
      inventory: updatedInventory,
    };

    updateAndSavePlayer(finalPlayer);
    setActiveBattle(null);

    // Se houve drop da fruta, aciona imediatamente o modal do dilema (novo drop)
    if (droppedFruit) {
      setFruitEvent({ fruit: droppedFruit, fromInventory: false });
    }

    if (isFinalBoss) {
      if (droppedFruit) {
        showMessage(
          `🏆 VITÓRIA ÉPICA! Você derrotou ${island.boss.name}! ✨ DROP LENDÁRIO: Você obteve a ${droppedFruit.name} (${droppedFruit.rarity === 'common' ? 'Comum' : 'Especial'})! Rota liberada! (+${earnedBerries.toLocaleString()} ฿, +${earnedExp} XP e +${bountyBonus.toLocaleString()} Bounty) ⛵`
        );
      } else {
        showMessage(
          `🏆 VITÓRIA ÉPICA! Você derrotou ${island.boss.name} e libertou ${island.name}! Rota para a próxima ilha liberada! (+${earnedBerries.toLocaleString()} ฿, +${earnedExp} XP e +${bountyBonus.toLocaleString()} Bounty) ⛵`
        );
      }
    } else {
      showMessage(
        `⚔️ Vitória no confronto! ${quest.name} concluída (+${earnedBerries.toLocaleString()} ฿, +${earnedExp} XP e +${bountyBonus.toLocaleString()} Bounty)!`
      );
    }
  }

  function handleAddExp(amount: number) {
    if (!player) return;
    const { updatedPlayer, levelsGained, pointsGained } = addExperience(player, amount);
    updateAndSavePlayer(updatedPlayer);
    if (levelsGained > 0) {
      showMessage(`🎉 SUBIU DE NÍVEL! Agora você é Nível ${updatedPlayer.level} (+${pointsGained} pontos livres)!`);
    } else {
      showMessage(`+${amount} EXP adicionado! (${updatedPlayer.experience}/${updatedPlayer.experienceToNextLevel} XP)`);
    }
  }

  function handleEatFruit(fruit: DevilFruit, fromInventory: boolean = false) {
    if (!player) return;
    let updatedInventory = player.inventory || [];
    if (fromInventory) {
      const itemIndex = updatedInventory.findIndex((item) => item.fruitId === fruit.id);
      if (itemIndex !== -1) {
        updatedInventory = [
          ...updatedInventory.slice(0, itemIndex),
          ...updatedInventory.slice(itemIndex + 1),
        ];
      }
    }
    const hadPreviousFruit = !!player.equippedFruitId;
    const bountyBonus = hadPreviousFruit ? 0 : 1500000;

    const updated: Player = {
      ...player,
      equippedFruitId: fruit.id,
      bounty: player.bounty + bountyBonus,
      inventory: updatedInventory,
    };
    updateAndSavePlayer(updated);
    setFruitEvent(null);
    setFruitHoverTooltip(false);

    if (hadPreviousFruit) {
      showMessage(`✨ Você consumiu a ${fruit.name}! Seus novos poderes foram despertados, substituindo a fruta anterior!`);
    } else {
      showMessage(`😋 Você comeu a ${fruit.name}! Poderes sobrenaturais despertados! (+1.500.000 ฿ de Recompensa)`);
    }
  }

  function handleSellFruit(fruit: DevilFruit, fromInventory: boolean = false) {
    if (!player) return;
    let updatedInventory = player.inventory || [];
    if (fromInventory) {
      const itemIndex = updatedInventory.findIndex((item) => item.fruitId === fruit.id);
      if (itemIndex !== -1) {
        updatedInventory = [
          ...updatedInventory.slice(0, itemIndex),
          ...updatedInventory.slice(itemIndex + 1),
        ];
      }
    }
    const updated: Player = {
      ...player,
      berries: player.berries + fruit.sellValueInBerries,
      inventory: updatedInventory,
    };
    updateAndSavePlayer(updated);
    setFruitEvent(null);
    setFruitHoverTooltip(false);
    showMessage(`💰 Vendeu a ${fruit.name} no mercado por ${fruit.sellValueInBerries.toLocaleString()} ฿!`);
  }

  function handleStoreFruitInBackpack(fruit: DevilFruit, fromInventory: boolean = false) {
    if (!player) return;

    if (fromInventory) {
      setFruitEvent(null);
      setFruitHoverTooltip(false);
      showMessage(`🎒 A ${fruit.name} continua guardada com segurança na sua Mochila!`);
      return;
    }

    const currentFruitCount = (player.inventory || []).filter((item) => item.type === 'DEVIL_FRUIT').length;
    const MAX_FRUIT_SLOTS = 20;

    if (currentFruitCount >= MAX_FRUIT_SLOTS) {
      showMessage(`⚠️ Sua Mochila de Akuma no Mi está cheia (${currentFruitCount}/${MAX_FRUIT_SLOTS} slots)! Consuma ou venda uma fruta para liberar espaço.`);
      return;
    }

    const fruitItem: InventoryItem = {
      id: `fruit-${fruit.id}-${Date.now()}`,
      name: fruit.name,
      type: 'DEVIL_FRUIT',
      description: fruit.description,
      valueInBerries: fruit.sellValueInBerries,
      fruitId: fruit.id,
      rarity: fruit.rarity || 'common',
      icon: '🍈',
      iconPath: fruit.iconPath || fruit.spriteUrl || (fruit.id === 'suke-suke' ? '/icons/akuma_suke.png' : fruit.id === 'bane-bane' ? '/icons/akuma_bane.png' : fruit.id === 'noro-noro' ? '/icons/akuma_noro.png' : undefined),
      spriteUrl: fruit.spriteUrl || fruit.iconPath || (fruit.id === 'suke-suke' ? '/icons/akuma_suke.png' : fruit.id === 'bane-bane' ? '/icons/akuma_bane.png' : fruit.id === 'noro-noro' ? '/icons/akuma_noro.png' : undefined),
    };

    const updated: Player = {
      ...player,
      inventory: [...(player.inventory || []), fruitItem],
    };

    updateAndSavePlayer(updated);
    setFruitEvent(null);
    setFruitHoverTooltip(false);
    showMessage(`🎒 A fruta ${fruit.name} foi guardada na sua Mochila (Aba Akuma no Mi: ${currentFruitCount + 1}/${MAX_FRUIT_SLOTS})!`);
  }

  function triggerTestFruitDrop() {
    const randomFruit = fruitsData[Math.floor(Math.random() * fruitsData.length)] as unknown as DevilFruit;
    setFruitEvent({ fruit: randomFruit, fromInventory: false });
  }

  function handleResetGame() {
    if (confirm('Tem certeza de que deseja apagar seu pirata e recomeçar sua jornada?')) {
      deletePlayerSave();
      setPlayer(null);
      setIsCreatingCharacter(true);
      showMessage('Save apagado. Crie seu novo pirata!');
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between overflow-x-hidden">
      {/* Header Superior Largo */}
      <PlayerHeader
        player={player}
        equippedFruitName={equippedFruit?.name}
        maxHp={calculateMaxHp(effectiveAttributes.resistance, player.level)}
      />

      {/* Corpo Central: Sidebar Lateral no Desktop + Conteúdo Amplo */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Menu Lateral no Desktop (substitui barra inferior de celular) */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-950/80 border-r border-slate-800 p-4 space-y-4 shrink-0 justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Navegação do Navio
            </span>

            <button
              onClick={() => setActiveTab('STATUS')}
              className={`w-full p-3 rounded-xl flex items-center space-x-3 transition text-left ${
                activeTab === 'STATUS'
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-900/30 text-amber-300 font-extrabold border border-amber-500/50 shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="p-2 bg-slate-900 rounded-lg text-amber-400 border border-slate-800">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Status do Pirata</p>
                <p className="text-[11px] text-slate-400 font-normal">Cartaz & Atributos</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('EXPLORAR')}
              title={player.activeTraining ? 'Capitão ocupado no Dojo de Treino' : 'Explorar Ilhas e Missões'}
              className={`w-full p-3 rounded-xl flex items-center space-x-3 transition text-left ${
                activeTab === 'EXPLORAR'
                  ? 'bg-gradient-to-r from-sky-500/20 to-blue-900/30 text-sky-300 font-extrabold border border-sky-500/50 shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="p-2 bg-slate-900 rounded-lg text-sky-400 border border-slate-800 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold truncate">Explorar Ilhas</p>
                  {player.activeTraining && (
                    <span className="text-[9px] font-black bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600 shrink-0">
                      Em Treino
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-normal truncate">
                  {player.activeTraining ? 'Bloqueado (No Dojo)' : 'Capítulos & Missões'}
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('TREINO')}
              title={player.activeQuest ? 'Capitão em expedição nas ilhas' : 'Fortalecer Atributos no Dojo'}
              className={`w-full p-3 rounded-xl flex items-center space-x-3 transition text-left ${
                activeTab === 'TREINO'
                  ? 'bg-gradient-to-r from-amber-600/20 to-orange-900/30 text-amber-300 font-extrabold border border-amber-600/50 shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="p-2 bg-slate-900 rounded-lg text-amber-500 border border-slate-800 shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold truncate">Dojo de Treino</p>
                  {player.activeQuest && (
                    <span className="text-[9px] font-black bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-600 shrink-0">
                      Em Missão
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-normal truncate">
                  {player.activeQuest ? 'Bloqueado (Em Missão)' : 'Fortalecer Atributos'}
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('INVENTARIO')}
              className={`w-full p-3 rounded-xl flex items-center space-x-3 transition text-left ${
                activeTab === 'INVENTARIO'
                  ? 'bg-gradient-to-r from-purple-500/20 to-violet-900/30 text-purple-300 font-extrabold border border-purple-500/50 shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="p-2 bg-slate-900 rounded-lg text-purple-400 border border-slate-800">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Mochila</p>
                <p className="text-[11px] text-slate-400 font-normal">Equipamentos & Itens</p>
              </div>
            </button>
          </div>

          {/* Atalhos Rápidos no Rodapé da Sidebar */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Ferramentas Rápidas
            </span>
            <div className="flex flex-col space-y-1.5 text-xs">
              <button
                onClick={() => {
                  const updated = {
                    ...player,
                    energy: { ...player.energy, current: 100, max: 100 },
                  };
                  updateAndSavePlayer(updated);
                  showMessage('Energia totalmente restaurada (100/100)! ⚡');
                }}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg flex items-center transition border border-slate-800"
              >
                <Zap className="w-3.5 h-3.5 mr-2 text-amber-400" /> Restaurar Energia
              </button>
              <button
                onClick={() => {
                  if (!player.activeTraining) {
                    showMessage('Nenhum treino em andamento no Dojo!');
                    return;
                  }
                  completeTraining();
                }}
                className={`py-1.5 px-2 rounded-lg flex items-center transition border text-xs font-semibold cursor-pointer active:scale-95 ${
                  player.activeTraining
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
                title="Concluir treino imediatamente (Modo Dev)"
              >
                <Dumbbell className="w-3.5 h-3.5 mr-2 text-amber-400" /> Concluir Treino (Dev)
              </button>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => handleAddExp(100)}
                  className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-lg flex items-center justify-center transition border border-slate-800 text-xs font-semibold cursor-pointer active:scale-95"
                  title="Ganhar 100 XP (Modo Dev)"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" /> +100 EXP
                </button>
                <button
                  onClick={() => handleAddExp(500)}
                  className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-lg flex items-center justify-center transition border border-slate-800 text-xs font-semibold cursor-pointer active:scale-95"
                  title="Ganhar 500 EXP (Modo Dev)"
                >
                  +500
                </button>
              </div>
              <button
                onClick={() => {
                  const updated = { ...player, berries: player.berries + 1000 };
                  updateAndSavePlayer(updated);
                  showMessage('+1.000 ฿ adicionados!');
                }}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg flex items-center transition border border-slate-800"
              >
                <Coins className="w-3.5 h-3.5 mr-2 text-amber-400" /> +1.000 Berries
              </button>
              <button
                onClick={handleResetGame}
                className="py-1.5 px-2 bg-slate-900 hover:bg-red-950/50 text-red-400 rounded-lg flex items-center transition border border-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Resetar Save
              </button>
            </div>
          </div>
        </aside>

        {/* Área Central de Conteúdo Centralizada */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 pb-20 md:pb-8 flex flex-col items-center">
          
          {/* ========================================================= */}
          {/* ABA 1: STATUS DO PIRATA (CARTAZ DOMINANTE & CENTRALIZADO)  */}
          {/* ========================================================= */}
          {activeTab === 'STATUS' && (
            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Coluna Esquerda: Cartaz de Procurado Oficial (One Piece Wanted Poster Template) */}
              <div className="lg:col-span-6 xl:col-span-6 flex justify-center">
                <WantedPoster player={player} />
              </div>

              {/* Coluna Direita: Atributos de Combate & Painel de Evolução (6 cols) */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-5">
                
                {/* Banner de Pontos Livres */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 rounded-2xl border border-amber-900/50 shadow-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-amber-200">Painel de Evolução</h4>
                      <p className="text-xs text-slate-400">Distribua pontos livres ganhos ao subir de nível</p>
                    </div>
                  </div>
                  <div className="text-right bg-slate-950/90 px-4 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">
                      Pontos Livres
                    </span>
                    <span className="text-2xl font-black text-amber-300">
                      {player.availableAttributePoints}
                    </span>
                  </div>
                </div>

                {/* Grade de Atributos Principais */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3.5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
                    <Swords className="w-4 h-4 mr-2 text-amber-500" /> Atributos de Combate
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Força Física */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-bold text-slate-200">Força Física</span>
                          {equippedFruit?.statMultipliers.strengthMultiplier && equippedFruit.statMultipliers.strengthMultiplier > 1 && (
                            <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/40">
                              +{((equippedFruit.statMultipliers.strengthMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Dano físico base e cortes</p>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <div className="flex items-baseline space-x-1 justify-end">
                            <span className="font-black text-base text-amber-400">
                              {player.attributes.strength}
                            </span>
                            {gearBonuses.strength > 0 && (
                              <span className="text-xs font-bold text-emerald-400" title={`+${gearBonuses.strength} de equipamentos`}>
                                (+{gearBonuses.strength})
                              </span>
                            )}
                          </div>
                          {(gearBonuses.strength > 0 || (equippedFruit?.statMultipliers.strengthMultiplier && equippedFruit.statMultipliers.strengthMultiplier > 1)) && (
                            <span className="text-[10px] text-slate-400 block -mt-0.5">
                              Total: {effectiveAttributes.strength}
                            </span>
                          )}
                        </div>
                        {player.availableAttributePoints > 0 && (
                          <button
                            onClick={() => allocatePoint('strength')}
                            className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold transition shadow cursor-pointer active:scale-95"
                            title="Distribuir 1 ponto em Força Física"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inteligência */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-bold text-sky-300 flex items-center">
                            <Brain className="w-3.5 h-3.5 mr-1 text-sky-400" /> Inteligência
                          </span>
                          {(equippedFruit?.statMultipliers.intelligenceMultiplier || equippedFruit?.statMultipliers.fruitPowerMultiplier) && (equippedFruit.statMultipliers.intelligenceMultiplier || equippedFruit.statMultipliers.fruitPowerMultiplier)! > 1 && (
                            <span className="text-[10px] text-sky-300 font-bold bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-600/40">
                              +{(((equippedFruit.statMultipliers.intelligenceMultiplier || equippedFruit.statMultipliers.fruitPowerMultiplier)! - 1) * 100).toFixed(1).replace('.0', '')}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Porcentagem de Acerto Crítico</p>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <div className="flex items-baseline space-x-1 justify-end">
                            <span className="font-black text-base text-sky-400">
                              {player.attributes.intelligence ?? player.attributes.fruitPower ?? 5}
                            </span>
                            {gearBonuses.intelligence > 0 && (
                              <span className="text-xs font-bold text-emerald-400" title={`+${gearBonuses.intelligence} de equipamentos`}>
                                (+{gearBonuses.intelligence})
                              </span>
                            )}
                          </div>
                          {(gearBonuses.intelligence > 0 || ((equippedFruit?.statMultipliers.intelligenceMultiplier || equippedFruit?.statMultipliers.fruitPowerMultiplier) && (equippedFruit.statMultipliers.intelligenceMultiplier || equippedFruit.statMultipliers.fruitPowerMultiplier)! > 1)) && (
                            <span className="text-[10px] text-slate-400 block -mt-0.5">
                              Total: {effectiveAttributes.intelligence}
                            </span>
                          )}
                        </div>
                        {player.availableAttributePoints > 0 && (
                          <button
                            onClick={() => allocatePoint('intelligence')}
                            className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold transition shadow cursor-pointer active:scale-95"
                            title="Distribuir 1 ponto em Inteligência"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Agilidade */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-bold text-emerald-300">Agilidade</span>
                          {equippedFruit?.statMultipliers.agilityMultiplier && equippedFruit.statMultipliers.agilityMultiplier > 1 && (
                            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-600/40">
                              +{((equippedFruit.statMultipliers.agilityMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Iniciativa & Chance de Esquiva</p>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <div className="flex items-baseline space-x-1 justify-end">
                            <span className="font-black text-base text-emerald-400">
                              {player.attributes.agility}
                            </span>
                            {gearBonuses.agility > 0 && (
                              <span className="text-xs font-bold text-emerald-400" title={`+${gearBonuses.agility} de equipamentos`}>
                                (+{gearBonuses.agility})
                              </span>
                            )}
                          </div>
                          {(gearBonuses.agility > 0 || (equippedFruit?.statMultipliers.agilityMultiplier && equippedFruit.statMultipliers.agilityMultiplier > 1)) && (
                            <span className="text-[10px] text-slate-400 block -mt-0.5">
                              Total: {effectiveAttributes.agility}
                            </span>
                          )}
                        </div>
                        {player.availableAttributePoints > 0 && (
                          <button
                            onClick={() => allocatePoint('agility')}
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold transition shadow cursor-pointer active:scale-95"
                            title="Distribuir 1 ponto em Agilidade"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Resistência */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-bold text-rose-300">Resistência</span>
                          {equippedFruit?.statMultipliers.resistanceMultiplier && equippedFruit.statMultipliers.resistanceMultiplier > 1 && (
                            <span className="text-[10px] text-rose-300 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-600/40">
                              +{((equippedFruit.statMultipliers.resistanceMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Total de Vida (HP) e Armadura</p>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <div className="flex items-baseline space-x-1 justify-end">
                            <span className="font-black text-base text-rose-400">
                              {player.attributes.resistance}
                            </span>
                            {gearBonuses.resistance > 0 && (
                              <span className="text-xs font-bold text-emerald-400" title={`+${gearBonuses.resistance} de equipamentos`}>
                                (+{gearBonuses.resistance})
                              </span>
                            )}
                          </div>
                          {(gearBonuses.resistance > 0 || (equippedFruit?.statMultipliers.resistanceMultiplier && equippedFruit.statMultipliers.resistanceMultiplier > 1)) && (
                            <span className="text-[10px] text-slate-400 block -mt-0.5">
                              Total: {effectiveAttributes.resistance}
                            </span>
                          )}
                        </div>
                        {player.availableAttributePoints > 0 && (
                          <button
                            onClick={() => allocatePoint('resistance')}
                            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-lg font-bold transition shadow cursor-pointer active:scale-95"
                            title="Distribuir 1 ponto em Resistência"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estatísticas Derivadas em 4 Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
                    <span className="text-slate-400 text-[11px] block font-semibold">Dano Físico</span>
                    <span className="font-black text-amber-400 text-base">
                      {Math.round(10 + effectiveAttributes.strength * 2.0)} pts
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
                    <span className="text-slate-400 text-[11px] block font-semibold">Acerto Crítico</span>
                    <span className="font-black text-sky-400 text-base">
                      {Math.min(50, Math.round(5 + effectiveAttributes.intelligence * 0.55))}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
                    <span className="text-slate-400 text-[11px] block font-semibold">Chance Esquiva</span>
                    <span className="font-black text-emerald-400 text-base">
                      {Math.min(30, Math.round(5 + effectiveAttributes.agility * 0.45))}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow">
                    <span className="text-slate-400 text-[11px] block font-semibold">Vida Total (HP)</span>
                    <span className="font-black text-red-400 text-base">
                      {calculateMaxHp(effectiveAttributes.resistance, player.level)} HP
                    </span>
                  </div>
                </div>

                {/* Card: Akuma no Mi Ativa & Teste do Dilema */}
                <div className="p-4 sm:p-5 bg-gradient-to-b from-purple-950/50 via-slate-900 to-purple-950/40 rounded-2xl border border-purple-800/60 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-purple-400" /> Akuma no Mi Ativa
                    </span>
                    {equippedFruit && (
                      <span className="text-[10px] bg-purple-900/80 text-purple-200 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-600">
                        {equippedFruit.category}
                      </span>
                    )}
                  </div>

                  {equippedFruit ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-3">
                        {(equippedFruit.iconPath || equippedFruit.spriteUrl || equippedFruit.id === 'suke-suke' || equippedFruit.id === 'bane-bane' || equippedFruit.id === 'noro-noro') && (
                          <div className="w-12 h-12 p-1 bg-slate-950/80 rounded-xl border border-purple-500/40 shrink-0 flex items-center justify-center">
                            <img
                              src={equippedFruit.iconPath || equippedFruit.spriteUrl || (equippedFruit.id === 'bane-bane' ? '/icons/akuma_bane.png' : equippedFruit.id === 'noro-noro' ? '/icons/akuma_noro.png' : '/icons/akuma_suke.png')}
                              alt={equippedFruit.name}
                              className="w-full h-full object-contain drop-shadow"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-base font-black text-purple-200">{equippedFruit.name}</h4>
                          <p className="text-xs text-purple-300 italic">{equippedFruit.englishMeaning}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-purple-950">
                        {equippedFruit.description}
                      </p>
                      
                      <div className="pt-1 text-xs text-purple-300">
                        <span className="font-bold text-[11px]">Bônus Passivos Concedidos ao Combatente:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5 text-[10px]">
                          {(equippedFruit.statMultipliers.intelligenceMultiplier || equippedFruit.statMultipliers.fruitPowerMultiplier) && ((equippedFruit.statMultipliers.intelligenceMultiplier || equippedFruit.statMultipliers.fruitPowerMultiplier)! > 1) && (
                            <div className="bg-sky-950/80 p-2 rounded-lg border border-sky-800 text-center">
                              <span className="text-sky-400 font-bold block">Inteligência</span>
                              <span className="text-sky-200 font-black text-xs">
                                +{((((equippedFruit.statMultipliers.intelligenceMultiplier || equippedFruit.statMultipliers.fruitPowerMultiplier)!) - 1) * 100).toFixed(1).replace('.0', '')}%
                              </span>
                            </div>
                          )}
                          {equippedFruit.statMultipliers.strengthMultiplier && equippedFruit.statMultipliers.strengthMultiplier > 1 && (
                            <div className="bg-purple-950/80 p-2 rounded-lg border border-purple-800 text-center">
                              <span className="text-amber-400 font-bold block">Força</span>
                              <span className="text-amber-200 font-black text-xs">
                                +{((equippedFruit.statMultipliers.strengthMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                              </span>
                            </div>
                          )}
                          {equippedFruit.statMultipliers.agilityMultiplier && equippedFruit.statMultipliers.agilityMultiplier > 1 && (
                            <div className="bg-purple-950/80 p-2 rounded-lg border border-purple-800 text-center">
                              <span className="text-cyan-400 font-bold block">Agilidade</span>
                              <span className="text-cyan-200 font-black text-xs">
                                +{((equippedFruit.statMultipliers.agilityMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                              </span>
                            </div>
                          )}
                          {equippedFruit.statMultipliers.resistanceMultiplier && equippedFruit.statMultipliers.resistanceMultiplier > 1 && (
                            <div className="bg-purple-950/80 p-2 rounded-lg border border-purple-800 text-center">
                              <span className="text-rose-400 font-bold block">Resistência</span>
                              <span className="text-rose-200 font-black text-xs">
                                +{((equippedFruit.statMultipliers.resistanceMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 space-y-1">
                      <div className="text-2xl">🍈</div>
                      <p className="text-xs font-bold text-slate-300">Nenhuma Fruta do Diabo Consumida</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Você está lutando como um guerreiro puro dos mares. Pode manter essa forma clássica ou consumir uma Akuma no Mi encontrada em expedições.
                      </p>
                    </div>
                  )}

                  {/* Teste de Mecânica do Dilema */}
                  <div className="pt-2 border-t border-purple-900/40">
                    <button
                      type="button"
                      onClick={triggerTestFruitDrop}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simular Encontro de Akuma no Mi</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 2: EXPLORAR ILHAS (MAPA-MÚNDI & MISSÕES POR CAPÍTULO) */}
          {/* ========================================================= */}
          {activeTab === 'EXPLORAR' && (() => {
            const remainingSeconds = player.activeQuest
              ? Math.max(0, Math.ceil((player.activeQuest.endsAt - currentTime) / 1000))
              : 0;
            const elapsedSeconds = player.activeQuest
              ? Math.max(0, player.activeQuest.durationSeconds - remainingSeconds)
              : 0;
            const progressPercentage = player.activeQuest
              ? Math.min(100, Math.max(0, (elapsedSeconds / player.activeQuest.durationSeconds) * 100))
              : 0;

            const activeQuestData = player.activeQuest
              ? {
                  questId: player.activeQuest.questId,
                  questName: player.activeQuest.questName,
                  islandName: player.activeQuest.islandName,
                  remainingSeconds,
                  durationSeconds: player.activeQuest.durationSeconds,
                  progressPercentage,
                }
              : null;

            const trainingRemainingSeconds = player.activeTraining
              ? Math.max(0, Math.ceil((player.activeTraining.endsAt - currentTime) / 1000))
              : 0;
            const trainingElapsedSeconds = player.activeTraining
              ? Math.max(0, player.activeTraining.durationSeconds - trainingRemainingSeconds)
              : 0;
            const trainingProgressPercentage = player.activeTraining
              ? Math.min(100, Math.max(0, (trainingElapsedSeconds / player.activeTraining.durationSeconds) * 100))
              : 0;

            const activeTrainingData = player.activeTraining
              ? {
                  attribute: player.activeTraining.attribute,
                  attributeName: player.activeTraining.attributeName,
                  remainingSeconds: trainingRemainingSeconds,
                  durationSeconds: player.activeTraining.durationSeconds,
                  progressPercentage: trainingProgressPercentage,
                }
              : null;

            return (
              <ExplorationTab
                player={player}
                onUpdatePlayer={updateAndSavePlayer}
                onStartQuest={startQuest}
                activeQuestData={activeQuestData}
                activeTrainingData={activeTrainingData}
                onCompleteQuestDev={completeStandardQuest}
                onCompleteTrainingDev={completeTraining}
                formatTime={formatTrainingTime}
                setNotification={showMessage}
              />
            );
          })()}

          {/* ========================================================= */}
          {/* ABA 3: DOJO DE TREINO (CENTRALIZADO)                      */}
          {/* ========================================================= */}
          {activeTab === 'TREINO' && (() => {
            const isTrainingActive = !!player.activeTraining;
            const remainingSeconds = player.activeTraining
              ? Math.max(0, Math.ceil((player.activeTraining.endsAt - currentTime) / 1000))
              : 0;
            const elapsedSeconds = player.activeTraining
              ? Math.max(0, player.activeTraining.durationSeconds - remainingSeconds)
              : 0;
            const progressPercentage = player.activeTraining
              ? Math.min(100, Math.max(0, (elapsedSeconds / player.activeTraining.durationSeconds) * 100))
              : 0;

            // Se houver treino em andamento, exibe a Arena Visual de Treinamento (ocultando a grade inferior)
            if (isTrainingActive && player.activeTraining) {
              return (
                <div className="w-full max-w-5xl mx-auto space-y-6">
                  <DojoArena
                    player={player}
                    activeTraining={player.activeTraining}
                    remainingSeconds={remainingSeconds}
                    progressPercentage={progressPercentage}
                    onCompleteDev={completeTraining}
                    formatTime={formatTrainingTime}
                  />
                </div>
              );
            }

            // Informações se houver missão de exploração ativa em andamento (Bloqueio Mútuo)
            const isQuestActive = !!player.activeQuest;
            const questRemainingSeconds = player.activeQuest
              ? Math.max(0, Math.ceil((player.activeQuest.endsAt - currentTime) / 1000))
              : 0;

            // Modo normal / Bloqueado por missão:
            return (
              <div className="w-full max-w-5xl mx-auto space-y-6">
                
                {/* Banner de Aviso de Bloqueio se o Capitão estiver em Missão de Exploração */}
                {isQuestActive && player.activeQuest && (
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950/90 via-slate-900 to-indigo-950/90 rounded-2xl sm:rounded-3xl border-2 border-sky-500/60 shadow-xl space-y-2 animate-fade-in relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-sky-900/60 rounded-xl text-sky-400 border border-sky-500/40 shrink-0">
                          <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-sky-300 uppercase tracking-widest">
                              Capitão em Expedição nas Ilhas
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-sky-950/80 border-sky-600/70 text-sky-200">
                              {player.activeQuest.islandName}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-0.5">
                            O capitão está em missão ({player.activeQuest.questName}). O treinamento no Dojo fica bloqueado até o retorno da expedição.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 shrink-0">
                        <div className="flex items-center space-x-2 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-sky-800/80 shadow-inner">
                          <span className="text-xs text-slate-400 font-semibold">Retorno em:</span>
                          <span className="text-base font-mono font-black text-sky-400">
                            ⏱️ {formatTrainingTime(questRemainingSeconds)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={completeStandardQuest}
                          className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow"
                          title="Concluir missão imediatamente (Modo Dev)"
                        >
                          ⏩ Concluir (Dev)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 rounded-2xl border border-amber-800/40 shadow-lg">
                  <h2 className="text-lg font-black text-amber-300 flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2 text-amber-500" /> Academia & Dojo dos Mares
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Aprimore seu corpo físico e sua afinidade espiritual. O treino consome <strong>5 de Energia</strong> e leva <strong>30 minutos</strong> de dedicação contínua, aumentando permanentemente seus atributos fundamentais (+1 ponto por ciclo).
                  </p>
                </div>

                {/* Grade de 4 Atributos de Treino Disponíveis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'strength', name: 'Força Física', icon: '⚔️', desc: 'Aumenta poder de soco, corte e dano físico' },
                    { key: 'intelligence', name: 'Inteligência', icon: '🧠', desc: 'Aumenta a precisão e a porcentagem de acertos críticos' },
                    { key: 'agility', name: 'Agilidade', icon: '⚡', desc: 'Aumenta reflexos rápidos, iniciativa e chance de esquiva' },
                    { key: 'resistance', name: 'Resistência', icon: '🛡️', desc: 'Aumenta a barra de Vida (HP) máxima e absorção de dano' },
                  ].map((item) => {
                    const attrKey = item.key as keyof PlayerAttributes;
                    const canAfford = player.energy.current >= TRAINING_ENERGY_COST;
                    const canStart = canAfford && !isQuestActive;

                    return (
                      <div
                        key={item.key}
                        className={`p-4 bg-slate-950/80 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-md ${
                          isQuestActive ? 'border-slate-800/80 opacity-75' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                              {item.icon}
                            </span>
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-100">{item.name}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          <span className="text-base font-black text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-900/60">
                            {player.attributes[attrKey]}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                          <div className="text-xs flex items-center space-x-2 text-slate-300">
                            <span className="text-amber-400 font-bold flex items-center">
                              <Zap className="w-3.5 h-3.5 mr-1 text-amber-400 fill-amber-400" /> 5 Energia
                            </span>
                            <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                              +1 Ponto
                            </span>
                            <span className="text-slate-400 text-[11px]">⏱️ 30 min</span>
                          </div>

                          <button
                            disabled={!canStart}
                            onClick={() => startTraining(attrKey, item.name)}
                            title={
                              isQuestActive
                                ? 'Capitão em expedição nas ilhas'
                                : !canAfford
                                ? 'Energia insuficiente (Requer 5 ⚡)'
                                : 'Iniciar treinamento de 30 minutos'
                            }
                            className={`px-4 py-2 font-black text-xs rounded-xl transition shadow flex items-center space-x-1.5 ${
                              isQuestActive
                                ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                                : !canAfford
                                ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                            }`}
                          >
                            {isQuestActive ? (
                              <>
                                <Compass className="w-3.5 h-3.5 animate-spin" />
                                <span>Em Missão (Ilhas)</span>
                              </>
                            ) : (
                              <span>Treinar Agora</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* ABA 4: MOCHILA, EQUIPAMENTOS & AKUMA NO MI                */}
          {/* ========================================================= */}
          {activeTab === 'INVENTARIO' && (
            <BackpackTab
              player={player}
              onUpdatePlayer={updateAndSavePlayer}
              onTriggerFruitDrop={triggerTestFruitDrop}
              onTriggerFruitEvent={(fruit) => setFruitEvent({ fruit, fromInventory: true })}
              effectiveAttributes={effectiveAttributes}
              equippedFruit={equippedFruit}
              setNotification={showMessage}
            />
          )}

          {/* ========================================================= */}
          {/* MODAL DO DILEMA DA AKUMA NO MI (LAYOUT CLEAN DEFINITIVO)  */}
          {/* ========================================================= */}
          {fruitEvent && (
            <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/95 border-2 border-purple-500 rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-[0_0_60px_rgba(168,85,247,0.4)] animate-fade-in text-center relative overflow-visible">
                {/* Efeito de Aura Cósmica de Fundo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 blur-3xl rounded-full pointer-events-none -z-10" />

                {/* 1. TOPO: Tags de Raridade e Tesouro */}
                <div className="flex items-center justify-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest bg-purple-950/90 px-3 py-1 rounded-full border border-purple-500/50 shadow-sm flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    Tesouro Místico Encontrado!
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                      fruitEvent.fruit.rarity === 'legendary'
                        ? 'text-amber-300 bg-amber-950/80 border-amber-500/50'
                        : fruitEvent.fruit.rarity === 'epic'
                        ? 'text-purple-300 bg-purple-950/80 border-purple-500/50'
                        : fruitEvent.fruit.rarity === 'rare'
                        ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50'
                        : 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50'
                    }`}
                  >
                    {fruitEvent.fruit.rarity === 'legendary'
                      ? 'Raridade Lendária'
                      : fruitEvent.fruit.rarity === 'epic'
                      ? 'Raridade Épica'
                      : fruitEvent.fruit.rarity === 'rare'
                      ? 'Raridade Rara'
                      : 'Raridade Comum'}
                  </span>
                </div>

                {/* 2. SPRITE GRANDE CENTRALIZADA COM MOLDURA DE MIRA / CANTOS BRILHANTES & TOOLTIP */}
                <div
                  className="relative mx-auto my-3 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center cursor-pointer group"
                  onMouseEnter={() => setFruitHoverTooltip(true)}
                  onMouseLeave={() => setFruitHoverTooltip(false)}
                >
                  {/* Halo de Luz Neon Pulsante */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/40 via-fuchsia-500/30 to-indigo-500/40 rounded-3xl blur-xl animate-pulse pointer-events-none" />

                  {/* Moldura de Mira / Pedestal Tecnológico */}
                  <div className="relative w-full h-full p-2.5 bg-slate-950/90 rounded-3xl border-2 border-purple-400/90 shadow-[0_0_35px_rgba(168,85,247,0.45)] flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-purple-300 group-hover:shadow-[0_0_45px_rgba(168,85,247,0.65)]">
                    {/* Cantoneiras estilizadas de HUD / Mira com brilho */}
                    <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-purple-400 group-hover:border-purple-200 transition-colors shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-purple-400 group-hover:border-purple-200 transition-colors shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-purple-400 group-hover:border-purple-200 transition-colors shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-purple-400 group-hover:border-purple-200 transition-colors shadow-[0_0_8px_rgba(168,85,247,0.8)]" />

                    {fruitEvent.fruit.iconPath || fruitEvent.fruit.spriteUrl || fruitEvent.fruit.id === 'suke-suke' || fruitEvent.fruit.id === 'bane-bane' || fruitEvent.fruit.id === 'noro-noro' ? (
                      <img
                        src={
                          fruitEvent.fruit.iconPath ||
                          fruitEvent.fruit.spriteUrl ||
                          (fruitEvent.fruit.id === 'bane-bane'
                            ? '/icons/akuma_bane.png'
                            : fruitEvent.fruit.id === 'noro-noro'
                            ? '/icons/akuma_noro.png'
                            : '/icons/akuma_suke.png')
                        }
                        alt={fruitEvent.fruit.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transform transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-6xl filter drop-shadow group-hover:scale-110 transition-transform duration-300">🍈</span>
                    )}
                  </div>

                  {/* Tooltip Flutuante Elegante ao passar o mouse */}
                  {fruitHoverTooltip && (
                    <div className="absolute z-50 top-[105%] left-1/2 -translate-x-1/2 w-72 sm:w-80 p-3.5 bg-slate-950/95 border-2 border-purple-500/90 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95),0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-xl text-left pointer-events-none animate-fade-in space-y-2">
                      {/* Seta indicadora apontando para a fruta */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-slate-950 border-l-2 border-t-2 border-purple-500/90 transform rotate-45" />

                      {/* Cabeçalho do Tooltip */}
                      <div className="flex items-center justify-between border-b border-purple-900/60 pb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                          <span>✨</span> Detalhes & Passivas
                        </span>
                        <span className="text-[10px] text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800">
                          {fruitEvent.fruit.category}
                        </span>
                      </div>

                      {/* Descrição Narrativa */}
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {fruitEvent.fruit.description}
                      </p>

                      {/* Bônus Passivos no Tooltip */}
                      <div className="pt-1 border-t border-purple-900/60 space-y-1">
                        <span className="text-[10px] font-bold text-purple-300/80 uppercase tracking-wider block">
                          Bônus Passivos Concedidos:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {fruitEvent.fruit.statMultipliers.strengthMultiplier && fruitEvent.fruit.statMultipliers.strengthMultiplier > 1 && (
                            <div className="text-amber-300 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/30 flex items-center justify-between">
                              <span>Força:</span>
                              <strong className="text-amber-200 font-bold">
                                +{((fruitEvent.fruit.statMultipliers.strengthMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                              </strong>
                            </div>
                          )}
                          {fruitEvent.fruit.statMultipliers.agilityMultiplier && fruitEvent.fruit.statMultipliers.agilityMultiplier > 1 && (
                            <div className="text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                              <span>Agilidade:</span>
                              <strong className="text-cyan-200 font-bold">
                                +{((fruitEvent.fruit.statMultipliers.agilityMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                              </strong>
                            </div>
                          )}
                          {fruitEvent.fruit.statMultipliers.resistanceMultiplier && fruitEvent.fruit.statMultipliers.resistanceMultiplier > 1 && (
                            <div className="text-rose-300 bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-500/30 flex items-center justify-between">
                              <span>Resistência:</span>
                              <strong className="text-rose-200 font-bold">
                                +{((fruitEvent.fruit.statMultipliers.resistanceMultiplier - 1) * 100).toFixed(1).replace('.0', '')}%
                              </strong>
                            </div>
                          )}
                          {(fruitEvent.fruit.statMultipliers.intelligenceMultiplier || fruitEvent.fruit.statMultipliers.fruitPowerMultiplier) && ((fruitEvent.fruit.statMultipliers.intelligenceMultiplier || fruitEvent.fruit.statMultipliers.fruitPowerMultiplier)! > 1) && (
                            <div className="text-sky-300 bg-sky-950/40 px-2 py-1 rounded-lg border border-sky-500/30 flex items-center justify-between">
                              <span>Inteligência:</span>
                              <strong className="text-sky-200 font-bold">
                                +{((((fruitEvent.fruit.statMultipliers.intelligenceMultiplier || fruitEvent.fruit.statMultipliers.fruitPowerMultiplier)!) - 1) * 100).toFixed(1).replace('.0', '')}%
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aviso de Substituição no Tooltip */}
                      {player?.equippedFruitId && (
                        <div className="pt-1 border-t border-purple-900/60 text-[10px] text-amber-300/90 leading-tight flex items-start gap-1">
                          <span className="shrink-0">⚠️</span>
                          <span>Substitui a fruta ativa ({equippedFruit?.name}).</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. NOME DA FRUTA EM DESTAQUE E SUBTÍTULO */}
                <div className="space-y-0.5 pt-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-purple-100 tracking-wide drop-shadow-md">
                    {fruitEvent.fruit.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-300/90 italic font-medium">
                    {fruitEvent.fruit.englishMeaning} • {fruitEvent.fruit.category}
                  </p>
                </div>

                {/* 4. TRÊS BOTÕES DE AÇÃO PRINCIPAIS (DESIGN MINIMALISTA REFINADO) */}
                <div className="pt-2 space-y-2">
                  {/* Botão Principal: Consumir / Comer (Roxo/Neon Fluido Refinado) */}
                  <button
                    onClick={() => handleEatFruit(fruitEvent.fruit, fruitEvent.fromInventory)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600/90 via-purple-500 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-200 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                  >
                    {player?.equippedFruitId ? 'CONSUMIR E SUBSTITUIR' : 'COMER A FRUTA'}
                  </button>

                  {/* Botão Secundário: Vender (Dourado/Âmbar Fosco Elegante) */}
                  <button
                    onClick={() => handleSellFruit(fruitEvent.fruit, fruitEvent.fromInventory)}
                    className="w-full py-2.5 sm:py-3 px-4 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-amber-500/40 hover:border-amber-400/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                  >
                    VENDER NO MERCADO NEGRO (+{fruitEvent.fruit.sellValueInBerries.toLocaleString()} ฿)
                  </button>

                  {/* Botão Terciário: Guardar na Mochila (Escuro Translúcido com Borda Suave) */}
                  <button
                    onClick={() => handleStoreFruitInBackpack(fruitEvent.fruit, fruitEvent.fromInventory)}
                    className="w-full py-2.5 sm:py-3 px-4 bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 hover:text-slate-100 font-semibold text-xs sm:text-sm tracking-wide rounded-xl border border-slate-700/60 hover:border-slate-500/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                  >
                    Guardar na Mochila
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal de Batalha Interativa contra Chefe / Mini-Chefe (Root Level: z-[99999]) */}
      {activeBattle && player && (
        <CombatModal
          player={player}
          quest={activeBattle.quest}
          island={activeBattle.island}
          onVictory={handleCombatVictory}
          onClose={() => setActiveBattle(null)}
        />
      )}

      {/* Barra de Navegação Inferior (Exclusiva para Mobile: md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 p-2 grid grid-cols-4 gap-1">
        <button
          onClick={() => setActiveTab('STATUS')}
          className={`py-1.5 flex flex-col items-center justify-center rounded-lg transition ${
            activeTab === 'STATUS'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Status</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPLORAR')}
          title={player.activeTraining ? 'Capitão ocupado no Dojo de Treino' : 'Explorar Ilhas'}
          className={`py-1.5 flex flex-col items-center justify-center rounded-lg transition relative ${
            activeTab === 'EXPLORAR'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">
            {player.activeTraining ? 'Ilhas 🔒' : 'Ilhas'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TREINO')}
          title={player.activeQuest ? 'Capitão em expedição nas ilhas' : 'Dojo de Treino'}
          className={`py-1.5 flex flex-col items-center justify-center rounded-lg transition relative ${
            activeTab === 'TREINO'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">
            {player.activeQuest ? 'Treino 🔒' : 'Treino'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('INVENTARIO')}
          className={`py-1.5 flex flex-col items-center justify-center rounded-lg transition ${
            activeTab === 'INVENTARIO'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Mochila</span>
        </button>
      </nav>

      {/* Toast Flutuante Não-Obstrutivo (Canto Inferior Direito - Zero Layout Shift) */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-sm animate-fade-in">
          <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/50 text-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-semibold">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="flex-1 leading-snug">{notification}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
