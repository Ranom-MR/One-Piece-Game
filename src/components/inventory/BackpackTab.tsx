'use client';

import React, { useState } from 'react';
import { Player, InventoryItem, EquipmentSlot, EquippedGear, PlayerAttributes, ItemRarity } from '@/types/player';
import { DevilFruit } from '@/types/fruit';
import { PirateAvatar } from '@/components/PirateAvatar';
import { calculateGearBonuses } from '@/data/equipmentItems';
import fruitsData from '@/data/fruits.json';
import {
  Sparkles,
  Shield,
  Dumbbell,
  Zap,
  Flame,
  ArrowLeftRight,
  X,
  Briefcase,
  Utensils,
  Coins,
  Brain,
} from 'lucide-react';

interface BackpackTabProps {
  player: Player;
  onUpdatePlayer: (updatedPlayer: Player) => void;
  onTriggerFruitDrop: () => void;
  onTriggerFruitEvent: (fruit: DevilFruit) => void;
  effectiveAttributes: PlayerAttributes;
  equippedFruit: DevilFruit | undefined;
  setNotification: (msg: string) => void;
}

type InventoryFilter = 'EQUIPMENT' | 'CONSUMABLE' | 'DEVIL_FRUIT';

const TOTAL_INVENTORY_SLOTS = 20;

export const RARITY_WEIGHT: Record<string, number> = {
  mythic: 5,
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
};

export function getItemRarity(item: InventoryItem): ItemRarity {
  if (item.rarity) return item.rarity;
  if (item.type === 'DEVIL_FRUIT' && item.fruitId) {
    const fruit = (fruitsData as unknown as DevilFruit[]).find((f) => f.id === item.fruitId);
    if (fruit?.rarity) return fruit.rarity as ItemRarity;
  }
  return 'common';
}

export function getRarityWeight(rarity?: string): number {
  if (!rarity) return 1;
  return RARITY_WEIGHT[rarity.toLowerCase()] || 1;
}

export function sortItemsByRarity(items: InventoryItem[]): InventoryItem[] {
  return [...items].sort((a, b) => {
    const rarityA = getItemRarity(a);
    const rarityB = getItemRarity(b);
    const weightDiff = getRarityWeight(rarityB) - getRarityWeight(rarityA);
    if (weightDiff !== 0) return weightDiff;

    // Critério 2: Maior valor em Berries primeiro
    const valDiff = (b.valueInBerries || 0) - (a.valueInBerries || 0);
    if (valDiff !== 0) return valDiff;

    // Critério 3: Ordem alfabética
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

function getRarityStyle(rawRarity: string = 'common') {
  const rarity = (rawRarity?.toLowerCase() || 'common') as ItemRarity | 'mythic';
  switch (rarity) {
    case 'mythic' as any:
      return {
        label: 'Mítico',
        border: 'border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.4)]',
        bg: 'bg-gradient-to-br from-rose-950/70 via-slate-800/90 to-slate-800/90 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        corner: 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]',
        textColor: 'text-rose-300',
      };
    case 'legendary':
      return {
        label: 'Lendário',
        border: 'border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.35)]',
        bg: 'bg-gradient-to-br from-amber-950/70 via-slate-800/90 to-slate-800/90 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        corner: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]',
        textColor: 'text-amber-300',
      };
    case 'epic':
      return {
        label: 'Épico',
        border: 'border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]',
        bg: 'bg-gradient-to-br from-purple-950/70 via-slate-800/90 to-slate-800/90 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
        corner: 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]',
        textColor: 'text-purple-300',
      };
    case 'rare':
      return {
        label: 'Raro',
        border: 'border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
        bg: 'bg-gradient-to-br from-cyan-950/70 via-slate-800/90 to-slate-800/90 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
        corner: 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]',
        textColor: 'text-cyan-300',
      };
    case 'common':
    default:
      return {
        label: 'Comum',
        border: 'border-slate-500/70 hover:border-slate-400',
        bg: 'bg-slate-800/85 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]',
        badgeBg: 'bg-slate-700/80 text-slate-200 border-slate-600',
        corner: 'bg-slate-400',
        textColor: 'text-slate-200',
      };
  }
}

function getSlotLabel(slot?: EquipmentSlot, type?: string) {
  if (type === 'CONSUMABLE') return 'Consumível';
  if (type === 'DEVIL_FRUIT') return 'Akuma no Mi';
  if (type === 'MATERIAL') return 'Material';
  switch (slot) {
    case 'head':
      return 'Cabeça';
    case 'torso':
      return 'Torso / Blusa';
    case 'legs':
      return 'Pernas / Calça';
    case 'shoes':
      return 'Calçados';
    default:
      return 'Equipamento';
  }
}

/**
 * Retorna o caminho do sprite PNG real do item para renderização de alta fidelidade
 */
function getItemIconPath(item?: InventoryItem | null): string | null {
  if (!item) return null;

  // 1. Akuma no Mi: Ícone/Sprite detalhado dedicado (ex: /icons/akuma_suke.png)
  if (item.type === 'DEVIL_FRUIT') {
    if (item.iconPath) return item.iconPath;
    if (item.spriteUrl) return item.spriteUrl;
    if (item.fruitId === 'suke-suke') return '/icons/akuma_suke.png';
    if (item.fruitId === 'bane-bane') return '/icons/akuma_bane.png';
    if (item.fruitId === 'noro-noro') return '/icons/akuma_noro.png';
    if (item.fruitId === 'doru-doru') return '/icons/akuma_doru.png';
    if (item.fruitId === 'neko-neko') return '/icons/akuma_neko.png';
    if (item.fruitId === 'ushi-ushi') return '/icons/akuma_ushi_bisao.png';
    if (item.fruitId === 'gomu-gomu') return '/icons/akuma_gomu.png';
    if (item.fruitId === 'moku-moku') return '/icons/akuma_moku.png';
    if (item.fruitId === 'suna-suna') return '/icons/akuma_suna.png';
    if (item.fruitId === 'bari-bari') return '/icons/akuma_bari.png';
    if (item.fruitId === 'mera-mera') return '/icons/akuma_mera.png';
    if (item.fruitId === 'goro-goro') return '/icons/akuma_goro.png';
    if (item.fruitId === 'pika-pika') return '/icons/akuma_pika.png';
    const fruit = (fruitsData as unknown as DevilFruit[]).find((f) => f.id === item.fruitId);
    if (fruit?.iconPath) return fruit.iconPath;
    if (fruit?.spriteUrl) return fruit.spriteUrl;
    return null;
  }

  // 2. Equipamento: Sprite PNG das peças de vestuário
  if (item.type !== 'EQUIPMENT' || !item.spriteId || item.spriteId === 'none') {
    return null;
  }
  let id = item.spriteId;
  if (id === 'bandana') id = 'bandana_vermelha';
  if (id === 'vest') id = 'colete_vermelho';
  if (id === 'striped') id = 'camisa_listrada';
  if (id === 'botas_pretas') id = 'botas_zoro';
  if (id === 'camisa_linho') id = 'camisa_pirata_linho';
  if (id === 'cabelo_curto_espetado') id = 'cabelo_curto_espetado_zoro';

  return `/sprites/icons/${id}.png`;
}

interface InteractiveSlotConfig {
  slot: EquipmentSlot;
  label: string;
  watermarkIcon: string;
  defaultName: string;
  positionClasses: string;
  lineSide: 'left' | 'right';
  tooltipSide: 'left' | 'right';
}

const INTERACTIVE_SLOTS: InteractiveSlotConfig[] = [
  {
    slot: 'head',
    label: 'CABEÇA',
    watermarkIcon: '🧢',
    defaultName: 'Sem Chapéu',
    positionClasses: 'top-3 left-3 sm:top-5 sm:left-4',
    lineSide: 'right',
    tooltipSide: 'right',
  },
  {
    slot: 'torso',
    label: 'BLUSA',
    watermarkIcon: '🦺',
    defaultName: 'Sem Blusa',
    positionClasses: 'top-28 right-3 sm:top-32 sm:right-4',
    lineSide: 'left',
    tooltipSide: 'left',
  },
  {
    slot: 'legs',
    label: 'CALÇA',
    watermarkIcon: '👖',
    defaultName: 'Sem Calça',
    positionClasses: 'bottom-28 left-3 sm:bottom-32 sm:left-4',
    lineSide: 'right',
    tooltipSide: 'right',
  },
  {
    slot: 'shoes',
    label: 'CALÇADO',
    watermarkIcon: '👢',
    defaultName: 'Descalço',
    positionClasses: 'bottom-3 right-3 sm:bottom-5 sm:right-4',
    lineSide: 'left',
    tooltipSide: 'left',
  },
];

interface DevilFruitTooltipProps {
  fruit: DevilFruit;
  positionClasses: string;
  arrowClasses: string;
  isEquipped?: boolean;
  activeEquippedFruitName?: string;
}

function DevilFruitTooltip({
  fruit,
  positionClasses,
  arrowClasses,
  isEquipped,
  activeEquippedFruitName,
}: DevilFruitTooltipProps) {
  const strBonus =
    fruit.statMultipliers.strengthMultiplier && fruit.statMultipliers.strengthMultiplier > 1
      ? ((fruit.statMultipliers.strengthMultiplier - 1) * 100).toFixed(1).replace('.0', '')
      : null;
  const agiBonus =
    fruit.statMultipliers.agilityMultiplier && fruit.statMultipliers.agilityMultiplier > 1
      ? ((fruit.statMultipliers.agilityMultiplier - 1) * 100).toFixed(1).replace('.0', '')
      : null;
  const resBonus =
    fruit.statMultipliers.resistanceMultiplier && fruit.statMultipliers.resistanceMultiplier > 1
      ? ((fruit.statMultipliers.resistanceMultiplier - 1) * 100).toFixed(1).replace('.0', '')
      : null;

  return (
    <div
      className={`absolute z-[9999] w-72 sm:w-80 p-3.5 bg-slate-950/95 border-2 border-purple-500/90 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95),0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-xl text-left pointer-events-none animate-fade-in space-y-2.5 ${positionClasses}`}
    >
      {/* Seta Indicadora Apontando para o Slot */}
      <div
        className={`absolute w-3.5 h-3.5 bg-slate-950 border-purple-500/90 transform rotate-45 ${arrowClasses}`}
      />

      {/* Cabeçalho do Tooltip */}
      <div className="flex items-center justify-between border-b border-purple-900/60 pb-1.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Detalhes & Passivas</span>
        </span>
        <div className="flex items-center space-x-1.5">
          {fruit.rarity && (
            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-purple-900/50 border border-purple-700 text-purple-200">
              {fruit.rarity}
            </span>
          )}
          <span className="text-[10px] text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800">
            {fruit.category}
          </span>
        </div>
      </div>

      {/* Nome Canônico e Romaji */}
      <div>
        <h4 className="text-sm font-black text-purple-100 tracking-wide">{fruit.name}</h4>
        <p className="text-[11px] text-purple-300/80 italic font-medium">
          {fruit.englishMeaning} {fruit.romajiName ? `• ${fruit.romajiName}` : ''}
        </p>
      </div>

      {/* Descrição Narrativa */}
      <p className="text-xs text-slate-200 leading-relaxed">{fruit.description}</p>

      {/* Bônus Passivos Concedidos (Sem Inteligência) */}
      <div className="pt-1.5 border-t border-purple-900/60 space-y-1">
        <span className="text-[10px] font-bold text-purple-300/80 uppercase tracking-wider block">
          Bônus Passivos Concedidos:
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {strBonus && (
            <div className="text-amber-300 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/30 flex items-center justify-between">
              <span>Força:</span>
              <strong className="text-amber-200 font-bold">+{strBonus}%</strong>
            </div>
          )}
          {agiBonus && (
            <div className="text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-500/30 flex items-center justify-between">
              <span>Agilidade:</span>
              <strong className="text-cyan-200 font-bold">+{agiBonus}%</strong>
            </div>
          )}
          {resBonus && (
            <div className="text-rose-300 bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-500/30 flex items-center justify-between">
              <span>Resistência:</span>
              <strong className="text-rose-200 font-bold">+{resBonus}%</strong>
            </div>
          )}
          {!strBonus && !agiBonus && !resBonus && (
            <div className="col-span-2 text-purple-300/70 bg-purple-950/30 px-2 py-1 rounded-lg border border-purple-900/40 text-[10px] italic">
              Concede poderes e habilidades elementares únicas.
            </div>
          )}
        </div>
      </div>

      {/* Status no Pirata & Valor em Berries */}
      <div className="pt-1.5 border-t border-purple-900/60 flex items-center justify-between text-[10px]">
        {isEquipped ? (
          <span className="text-emerald-300 font-bold flex items-center gap-1">
            <span>✨</span> Ativa no Pirata
          </span>
        ) : activeEquippedFruitName ? (
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <span>⚠️</span> Substitui {activeEquippedFruitName}
          </span>
        ) : (
          <span className="text-purple-300 font-bold flex items-center gap-1">
            <span>⚡</span> Pronta para consumo
          </span>
        )}

        <span className="text-amber-400 font-black">
          +{fruit.sellValueInBerries.toLocaleString()} ฿
        </span>
      </div>
    </div>
  );
}

export function BackpackTab({
  player,
  onUpdatePlayer,
  onTriggerFruitDrop,
  onTriggerFruitEvent,
  effectiveAttributes,
  equippedFruit,
  setNotification,
}: BackpackTabProps) {
  const [filter, setFilter] = useState<InventoryFilter>('EQUIPMENT');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemToSell, setItemToSell] = useState<InventoryItem | null>(null);
  const [hoveredSlotItemId, setHoveredSlotItemId] = useState<string | null>(null);
  const [hoveredInspectFruit, setHoveredInspectFruit] = useState<boolean>(false);

  const gearBonuses = calculateGearBonuses(player.equippedGear);
  const equippedGear = player.equippedGear || {
    head: null,
    torso: null,
    legs: null,
    shoes: null,
  };

  // Item selecionado para inspeção (suporta tanto itens da mochila quanto peças equipadas)
  const equippedList = (Object.values(equippedGear).filter(Boolean) as InventoryItem[]);
  const allInspectableItems = [...player.inventory, ...equippedList];
  const selectedItem = allInspectableItems.find((i) => i.id === selectedItemId) || null;

  const isSelectedEquipped = selectedItem
    ? Object.values(equippedGear).some((gear) => gear?.id === selectedItem.id)
    : false;
  const selectedEquippedSlot = isSelectedEquipped
    ? (Object.keys(equippedGear) as EquipmentSlot[]).find((slot) => equippedGear[slot]?.id === selectedItem?.id)
    : null;

  // =========================================================
  // AÇÕES DE EQUIPAMENTO E ITENS
  // =========================================================

  function handleEquip(item: InventoryItem) {
    if (!item.slot) return;
    const slot = item.slot;
    const currentEquipped = equippedGear[slot];

    // Remove o item clicado da mochila e devolve o item anteriormente equipado (se houver)
    let newInventory = player.inventory.filter((i) => i.id !== item.id);
    if (currentEquipped) {
      newInventory = [currentEquipped, ...newInventory];
    }

    const newEquippedGear: EquippedGear = {
      ...equippedGear,
      [slot]: item,
    };

    const newAppearance = {
      ...player.appearance!,
      ...(slot === 'head' ? { hat: item.spriteId || 'none' } : {}),
      ...(slot === 'torso' ? { outfit: item.spriteId || 'none' } : {}),
      ...(slot === 'legs' ? { pants: item.spriteId || 'none' } : {}),
      ...(slot === 'shoes' ? { shoes: item.spriteId || 'none' } : {}),
    };

    const updatedPlayer: Player = {
      ...player,
      appearance: newAppearance,
      equippedGear: newEquippedGear,
      inventory: newInventory,
    };

    onUpdatePlayer(updatedPlayer);
    setSelectedItemId(item.id);
  }

  function handleUnequip(slot: EquipmentSlot) {
    const currentItem = equippedGear[slot];
    if (!currentItem) return;

    const newEquippedGear: EquippedGear = {
      ...equippedGear,
      [slot]: null,
    };

    const newInventory = [...player.inventory, currentItem];

    const newAppearance = {
      ...player.appearance!,
      ...(slot === 'head' ? { hat: 'none' } : {}),
      ...(slot === 'torso' ? { outfit: 'none' } : {}),
      ...(slot === 'legs' ? { pants: 'none' } : {}),
      ...(slot === 'shoes' ? { shoes: 'none' } : {}),
    };

    const updatedPlayer: Player = {
      ...player,
      appearance: newAppearance,
      equippedGear: newEquippedGear,
      inventory: newInventory,
    };

    onUpdatePlayer(updatedPlayer);
    setSelectedItemId(currentItem.id);
  }

  function handleUseConsumable(item: InventoryItem) {
    if (item.type !== 'CONSUMABLE') return;

    const restoreAmount = item.energyRestore || 10;
    if (player.energy.current >= player.energy.max) {
      setNotification('Sua energia já está cheia (100%)!');
      return;
    }

    const newEnergyCurrent = Math.min(player.energy.max, player.energy.current + restoreAmount);

    const itemIndex = player.inventory.findIndex((i) => i.id === item.id);
    if (itemIndex === -1) return;

    const newInventory = [...player.inventory];
    newInventory.splice(itemIndex, 1);

    const updatedPlayer: Player = {
      ...player,
      energy: {
        ...player.energy,
        current: newEnergyCurrent,
      },
      inventory: newInventory,
    };

    onUpdatePlayer(updatedPlayer);
    setNotification(`Você consumiu ${item.name} e recuperou +${restoreAmount} de Energia! 🍖`);
    setSelectedItemId(null);
  }

  function handleConfirmSell() {
    if (!itemToSell) return;

    const itemPrice = itemToSell.valueInBerries || 0;
    const itemIndex = player.inventory.findIndex((i) => i.id === itemToSell.id);
    if (itemIndex === -1) {
      setItemToSell(null);
      return;
    }

    const newInventory = [...player.inventory];
    newInventory.splice(itemIndex, 1);

    const updatedPlayer: Player = {
      ...player,
      berries: player.berries + itemPrice,
      inventory: newInventory,
    };

    onUpdatePlayer(updatedPlayer);

    if (itemPrice > 0) {
      setNotification(`Você vendeu ${itemToSell.name} por +${itemPrice.toLocaleString()} ฿! 💰`);
    } else {
      setNotification(`${itemToSell.name} foi removido da sua mochila para liberar espaço.`);
    }

    setItemToSell(null);
    if (selectedItemId === itemToSell.id) {
      setSelectedItemId(null);
    }
  }

  // Separação estrita da mochila em três categorias independentes
  const equipmentItems = player.inventory.filter((item) => item.type === 'EQUIPMENT');
  const consumableItems = player.inventory.filter((item) => item.type === 'CONSUMABLE' || item.type === 'MATERIAL');
  const devilFruitItems = player.inventory.filter((item) => item.type === 'DEVIL_FRUIT');

  // Seleção da categoria ativa com ordenação estrita da maior para a menor raridade
  const activeCategoryItems =
    filter === 'EQUIPMENT'
      ? equipmentItems
      : filter === 'CONSUMABLE'
      ? consumableItems
      : devilFruitItems;

  const sortedFilteredInventory = sortItemsByRarity(activeCategoryItems);

  // Cálculo de slots vazios para completar a grade de 20 posições independentes por aba
  const emptySlotsCount = Math.max(0, TOTAL_INVENTORY_SLOTS - sortedFilteredInventory.length);

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
      
      {/* ========================================================= */}
      {/* BLOCO 1: PAPER DOLL INTERATIVO DE EQUIPAMENTOS (ESQ. 5 COL) */}
      {/* ========================================================= */}
      <div className="lg:col-span-5 flex flex-col space-y-5">
        
        {/* Card do Visual Equipado com Slots Flutuantes ao Redor */}
        <div className="bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-950/95 p-4 sm:p-5 rounded-3xl border-2 border-amber-600/40 shadow-2xl relative overflow-hidden flex flex-col items-center">
          {/* Fundo temático da praia com claridade e iluminação de céu (mais aberto e arejado) */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 brightness-110 contrast-105 pointer-events-none transition-opacity duration-300"
            style={{ backgroundImage: `url('/cenarios/praia_inicio.jpg')` }}
          />
          {/* Máscara de transição suave mantendo o céu iluminado */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent pointer-events-none" />
          {/* Brilho zenital simulando luz do sol e respiro visual */}
          <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-sky-400/15 via-amber-300/5 to-transparent pointer-events-none" />

          {/* Cabeçalho do Card */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 z-10">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest font-serif">
                Visual & Equipamentos
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              Nível {player.level}
            </span>
          </div>

          {/* PALCO DO PAPER DOLL: AVATAR CENTRALIZADO + SLOTS FLUTUANTES COM SPRITES REAIS */}
          <div className="relative w-full h-[410px] sm:h-[450px] flex items-center justify-center my-2 z-10">
            {/* O Avatar de Corpo Inteiro */}
            <div className="w-full h-full flex items-center justify-center">
              <PirateAvatar
                appearance={player.appearance}
                bustOnly={false}
                className="w-full h-full max-h-[430px]"
              />
            </div>

            {/* SLOTS FLUTUANTES AO REDOR DO PERSONAGEM COM SPRITES REAIS E LINHAS DE CONEXÃO */}
            {INTERACTIVE_SLOTS.map(({ slot, label, watermarkIcon, defaultName, positionClasses, lineSide, tooltipSide }) => {
              const item = equippedGear[slot];
              const itemRarity = item ? getItemRarity(item) : 'common';
              const rarityStyle = item ? getRarityStyle(itemRarity) : null;
              const isSelected = item && selectedItemId === item.id;
              const itemIconPath = getItemIconPath(item);

              return (
                <div
                  key={slot}
                  className={`absolute ${positionClasses} z-30 hover:z-[9999] group-hover:z-[9999] flex flex-col items-center group`}
                >
                  {/* Linha / Conexão Visual de HUD apontando para o personagem */}
                  {lineSide === 'right' && (
                    <div className="hidden sm:flex items-center absolute top-1/2 -right-7 -translate-y-1/2 pointer-events-none z-10">
                      <div className="w-6 h-[2px] bg-gradient-to-r from-amber-400/80 via-amber-400/40 to-transparent" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.8)] -ml-1" />
                    </div>
                  )}
                  {lineSide === 'left' && (
                    <div className="hidden sm:flex items-center absolute top-1/2 -left-7 -translate-y-1/2 pointer-events-none z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.8)] -mr-1" />
                      <div className="w-6 h-[2px] bg-gradient-to-l from-amber-400/80 via-amber-400/40 to-transparent" />
                    </div>
                  )}

                  {/* Rótulo Superior Flutuante */}
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300/90 bg-slate-950/90 px-1.5 py-0.5 rounded-md border border-slate-800 shadow mb-1 pointer-events-none select-none">
                    {label}
                  </span>

                  {/* Mini Card Padronizado (Idêntico ao Grid da Mochila) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (item) {
                          setSelectedItemId(isSelected ? null : item.id);
                        } else {
                          setFilter('EQUIPMENT');
                        }
                      }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all duration-150 active:scale-95 cursor-pointer relative shadow-xl backdrop-blur-md ${
                        item
                          ? `${rarityStyle?.bg} ${rarityStyle?.border} ${
                              isSelected
                                ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10'
                                : 'hover:scale-105 hover:brightness-110 hover:border-amber-400/80'
                            }`
                          : 'bg-slate-800/60 backdrop-blur-md border-2 border-dashed border-slate-600/70 hover:border-amber-400/70 hover:bg-slate-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                      }`}
                      title={
                        item
                          ? `${item.name} (${rarityStyle?.label}) — Clique para inspecionar`
                          : `${defaultName} — Clique para ver equipamentos`
                      }
                    >
                      {/* Marcador de Canto de Raridade */}
                      {item && rarityStyle && (
                        <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${rarityStyle.corner}`} />
                      )}

                      {/* Sprite Real do Item ou Marca d'água */}
                      {item && itemIconPath ? (
                        <img
                          src={itemIconPath}
                          alt={item.name}
                          className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow select-none group-hover:scale-110 transition duration-150"
                        />
                      ) : item ? (
                        <span className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition duration-150">
                          {item.icon || watermarkIcon}
                        </span>
                      ) : (
                        <span className="text-xl sm:text-2xl opacity-30 select-none">
                          {watermarkIcon}
                        </span>
                      )}
                    </button>

                    {/* Botão Rápido de Tirar / Desequipar */}
                    {item && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnequip(slot);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transition active:scale-90 z-30 cursor-pointer border border-rose-300/40"
                        title={`Tirar ${item.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Nome Curto do Item */}
                  <span className={`text-[10px] font-bold mt-1 max-w-[70px] sm:max-w-[80px] truncate text-center select-none ${
                    item ? 'text-slate-200' : 'text-slate-500 italic'
                  }`}>
                    {item ? item.name : 'Vazio'}
                  </span>

                  {/* Tooltip Dinâmico ao passar o mouse */}
                  {item && (
                    <div
                      className={`hidden sm:block absolute ${
                        tooltipSide === 'right' ? 'left-full ml-3 top-0' : 'right-full mr-3 top-0'
                      } z-[9999] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-52 p-3 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-amber-400/80 shadow-[0_12px_32px_rgba(0,0,0,0.85)] text-left`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black text-slate-100 truncate">{item.name}</span>
                        <span className={`text-[8px] px-1 py-0.2 rounded font-black border ${rarityStyle?.badgeBg}`}>
                          {rarityStyle?.label}
                        </span>
                      </div>
                      {item.statBonus && (
                        <div className="flex flex-wrap gap-1 text-[9px] mb-1">
                          {item.statBonus.strength && (
                            <span className="text-amber-400 font-bold">+{item.statBonus.strength} For</span>
                          )}
                          {item.statBonus.resistance && (
                            <span className="text-emerald-400 font-bold">+{item.statBonus.resistance} Res</span>
                          )}
                          {item.statBonus.agility && (
                            <span className="text-cyan-400 font-bold">+{item.statBonus.agility} Agi</span>
                          )}
                          {(item.statBonus.intelligence || item.statBonus.fruitPower) && (
                            <span className="text-sky-400 font-bold">+{item.statBonus.intelligence || item.statBonus.fruitPower} Int</span>
                          )}
                        </div>
                      )}
                      <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">{item.description}</p>
                      <span className="text-[9px] text-amber-300 font-bold block mt-1">Clique para inspecionar</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Nome e Título do Pirata */}
          <div className="w-full text-center py-2 px-3 bg-slate-900/80 rounded-xl border border-amber-900/40 z-10">
            <h3 className="text-sm font-black text-amber-200 uppercase font-serif tracking-wide truncate">
              {player.name}
            </h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {player.title}
            </p>
          </div>

          {/* Mini-resumo de Bônus de Equipamento */}
          <div className="w-full mt-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" /> Bônus Totais dos Equipamentos
              </span>
              {(gearBonuses.strength > 0 || gearBonuses.resistance > 0 || gearBonuses.agility > 0 || gearBonuses.intelligence > 0) && (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-full font-bold">
                  Ativo
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center text-[11px]">
                  <Dumbbell className="w-3 h-3 mr-1 text-amber-400" /> Força
                </span>
                <span className={`font-black ${gearBonuses.strength > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  +{gearBonuses.strength}
                </span>
              </div>

              <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center text-[11px]">
                  <Shield className="w-3 h-3 mr-1 text-emerald-400" /> Res
                </span>
                <span className={`font-black ${gearBonuses.resistance > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  +{gearBonuses.resistance}
                </span>
              </div>

              <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center text-[11px]">
                  <Zap className="w-3 h-3 mr-1 text-cyan-400" /> Agi
                </span>
                <span className={`font-black ${gearBonuses.agility > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                  +{gearBonuses.agility}
                </span>
              </div>

              <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center text-[11px]">
                  <Brain className="w-3 h-3 mr-1 text-sky-400" /> Int
                </span>
                <span className={`font-black ${gearBonuses.intelligence > 0 ? 'text-sky-400' : 'text-slate-500'}`}>
                  +{gearBonuses.intelligence}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* BLOCO 2: MOCHILA DO PIRATA & INSPEÇÃO (DIREITA 7 COLUNAS)  */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="p-4 sm:p-6 bg-slate-950/90 rounded-3xl border-2 border-amber-900/60 shadow-xl space-y-4">
          
          {/* Cabeçalho da Mochila & Lotação de Slots */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
            <h3 className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-widest font-serif flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Mochila do Pirata</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-amber-300/80 font-bold bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Raridade: Alta ➔ Baixa</span>
              </span>
              <span className="text-[11px] font-black text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2.5 py-1 rounded-xl tracking-wider">
                {sortedFilteredInventory.length} / {TOTAL_INVENTORY_SLOTS} SLOTS
              </span>
            </div>
          </div>

          {/* Três Abas Distintas: Equipamentos, Consumíveis e Akuma no Mi */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setFilter('EQUIPMENT');
                setSelectedItemId(null);
              }}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl font-black transition text-center cursor-pointer flex items-center justify-center space-x-1.5 ${
                filter === 'EQUIPMENT'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Equipamentos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                filter === 'EQUIPMENT' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {equipmentItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilter('CONSUMABLE');
                setSelectedItemId(null);
              }}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl font-black transition text-center cursor-pointer flex items-center justify-center space-x-1.5 ${
                filter === 'CONSUMABLE'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span>Consumíveis</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                filter === 'CONSUMABLE' ? 'bg-slate-950/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {consumableItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilter('DEVIL_FRUIT');
                setSelectedItemId(null);
              }}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl font-black transition text-center cursor-pointer flex items-center justify-center space-x-1.5 ${
                filter === 'DEVIL_FRUIT'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-purple-100 shadow-md shadow-purple-500/25 border border-purple-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Akuma no Mi</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                filter === 'DEVIL_FRUIT' ? 'bg-purple-950/60 text-purple-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {devilFruitItems.length}
              </span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* GRADE TÁTICA EXPANDIDA DE INVENTÁRIO (GRID 20 SLOTS)     */}
          {/* ========================================================= */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 p-3 bg-slate-900/50 rounded-2xl border border-slate-700/60 shadow-inner">
            {/* Itens Preenchidos (Ordenados por Raridade: Maior ➔ Menor) */}
            {sortedFilteredInventory.map((item, index) => {
              const itemRarity = getItemRarity(item);
              const rarityStyle = getRarityStyle(itemRarity);
              const isSelected = selectedItemId === item.id;
              const itemIconPath = getItemIconPath(item);
              const fruit =
                item.type === 'DEVIL_FRUIT'
                  ? (fruitsData as unknown as DevilFruit[]).find((f) => f.id === item.fruitId)
                  : null;
              const isHovered = hoveredSlotItemId === item.id;

              // Posicionamento dinâmico e inteligente do pop-up para evitar corte da tela:
              // - Fileiras superiores (1ª e 2ª fileiras) abrem para baixo
              // - Fileiras inferiores (a partir da 3ª fileira) abrem para cima
              const isTopMobile = index < 8; // Linhas 0 e 1 em telas móveis (4 colunas)
              const isTopDesktop = index < 10; // Linhas 0 e 1 em desktop (5 colunas)

              let verticalPosClass = '';
              let verticalArrowClass = '';

              if (isTopMobile && isTopDesktop) {
                // 1ª e 2ª fileiras em qualquer resolução: abre para baixo
                verticalPosClass = 'top-[112%]';
                verticalArrowClass = '-top-2 border-l-2 border-t-2';
              } else if (!isTopMobile && !isTopDesktop) {
                // Fileiras inferiores em qualquer resolução: abre para cima
                verticalPosClass = 'bottom-[112%]';
                verticalArrowClass = '-bottom-2 border-r-2 border-b-2';
              } else {
                // Índices 8 e 9: inferior em mobile (para cima), superior em desktop (para baixo)
                verticalPosClass = 'bottom-[112%] sm:bottom-auto sm:top-[112%]';
                verticalArrowClass =
                  '-bottom-2 border-r-2 border-b-2 sm:-bottom-auto sm:-top-2 sm:border-l-2 sm:border-t-2 sm:border-r-0 sm:border-b-0';
              }

              const isRightMobile = index % 4 >= 2;
              const isRightDesktop = index % 5 >= 2;

              let horizontalPosClass = '';
              let horizontalArrowClass = '';

              if (isRightMobile && isRightDesktop) {
                horizontalPosClass = 'right-0';
                horizontalArrowClass = 'right-6';
              } else if (!isRightMobile && !isRightDesktop) {
                horizontalPosClass = 'left-0';
                horizontalArrowClass = 'left-6';
              } else if (isRightMobile && !isRightDesktop) {
                horizontalPosClass = 'right-0 sm:right-auto sm:left-0';
                horizontalArrowClass = 'right-6 sm:right-auto sm:left-6';
              } else {
                horizontalPosClass = 'left-0 sm:left-auto sm:right-0';
                horizontalArrowClass = 'left-6 sm:left-auto sm:right-6';
              }

              const positionClasses = `${verticalPosClass} ${horizontalPosClass}`;
              const arrowClasses = `${verticalArrowClass} ${horizontalArrowClass}`;
              const isUshiFruit =
                item.type === 'DEVIL_FRUIT' &&
                (item.fruitId === 'ushi-ushi' || fruit?.id === 'ushi-ushi' || item.name.includes('Ushi'));
              const isNekoFruit =
                item.type === 'DEVIL_FRUIT' &&
                (item.fruitId === 'neko-neko' || fruit?.id === 'neko-neko' || item.name.includes('Neko'));

              return (
                <div
                  key={item.id}
                  className={`aspect-square relative ${
                    isHovered ? 'z-50' : isSelected ? 'z-20' : 'z-1'
                  }`}
                  onMouseEnter={() => {
                    if (fruit) setHoveredSlotItemId(item.id);
                  }}
                  onMouseLeave={() => {
                    if (hoveredSlotItemId === item.id) setHoveredSlotItemId(null);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                    className={`w-full h-full relative rounded-xl border-2 flex items-center justify-center ${
                      item.type === 'DEVIL_FRUIT' ? 'p-1 sm:p-1.5 overflow-hidden' : 'p-1.5'
                    } transition duration-150 active:scale-95 cursor-pointer group ${
                      rarityStyle.bg
                    } ${rarityStyle.border} ${
                      isSelected
                        ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10'
                        : 'hover:brightness-110 hover:border-amber-400/60'
                    }`}
                    title={`${item.name} (${rarityStyle.label})`}
                  >
                    {/* Marcador de Canto de Raridade */}
                    <span
                      className={`absolute top-1.5 right-1.5 z-10 w-2 h-2 rounded-full ${rarityStyle.corner}`}
                    />

                    {/* Sprite Real do Item ou Emoji */}
                    {itemIconPath ? (
                      <img
                        src={itemIconPath}
                        alt={item.name}
                        className={`${
                          isUshiFruit
                            ? 'w-[90%] h-[90%] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)] group-hover:scale-105'
                            : isNekoFruit
                            ? 'w-[86%] h-[86%] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)] group-hover:scale-105'
                            : item.type === 'DEVIL_FRUIT'
                            ? 'w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)] scale-[1.04] group-hover:scale-110'
                            : 'w-[82%] h-[82%] object-contain drop-shadow group-hover:scale-105'
                        } select-none transform transition duration-150`}
                      />
                    ) : (
                      <span className="text-3xl select-none transform group-hover:scale-105 transition duration-150">
                        {item.icon || '📦'}
                      </span>
                    )}

                    {/* Indicador de Quantidade (se maior que 1) */}
                    {item.quantity && item.quantity > 1 && (
                      <span className="absolute bottom-1 right-1 text-[9px] font-black text-slate-200 bg-slate-950/90 px-1 rounded border border-slate-700/80">
                        x{item.quantity}
                      </span>
                    )}
                  </button>

                  {/* Tooltip Flutuante de Akuma no Mi ao passar o mouse */}
                  {isHovered && fruit && (
                    <DevilFruitTooltip
                      fruit={fruit}
                      positionClasses={positionClasses}
                      arrowClasses={arrowClasses}
                      isEquipped={player.equippedFruitId === fruit.id}
                      activeEquippedFruitName={equippedFruit?.name}
                    />
                  )}
                </div>
              );
            })}

            {/* Slots Vazios da Grade (Estilo Jogos de Extração) */}
            {Array.from({ length: emptySlotsCount }).map((_, index) => (
              <div
                key={`empty-slot-${index}`}
                className="aspect-square rounded-xl border border-slate-700/60 bg-slate-800/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-center select-none"
              >
                <span className="text-slate-500/70 font-mono text-xs">+</span>
              </div>
            ))}
          </div>

          {/* ========================================================= */}
          {/* PAINEL DE INSPEÇÃO E AÇÕES RÁPIDAS (RENDERIZAÇÃO CONDICIONAL) */}
          {/* ========================================================= */}
          {selectedItem && (
            <div className="flex flex-col justify-start animate-fade-in">
              {(() => {
                const itemRarity = getItemRarity(selectedItem);
                const rarityStyle = getRarityStyle(itemRarity);
                const slotLabel = getSlotLabel(selectedItem.slot, selectedItem.type);
                const selectedIconPath = getItemIconPath(selectedItem);
                const selectedFruit =
                  selectedItem.type === 'DEVIL_FRUIT'
                    ? (fruitsData as unknown as DevilFruit[]).find((f) => f.id === selectedItem.fruitId)
                    : null;
                const isSelectedUshi =
                  selectedItem.type === 'DEVIL_FRUIT' &&
                  (selectedItem.fruitId === 'ushi-ushi' ||
                    selectedFruit?.id === 'ushi-ushi' ||
                    selectedItem.name.includes('Ushi'));
                const isSelectedNeko =
                  selectedItem.type === 'DEVIL_FRUIT' &&
                  (selectedItem.fruitId === 'neko-neko' ||
                    selectedFruit?.id === 'neko-neko' ||
                    selectedItem.name.includes('Neko'));

                return (
                  <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/40 shadow-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 min-w-0">
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            if (selectedFruit) setHoveredInspectFruit(true);
                          }}
                          onMouseLeave={() => setHoveredInspectFruit(false)}
                        >
                          <span
                            className={`${
                              selectedFruit ? 'w-16 h-16 p-1 cursor-help' : 'w-14 h-14 p-1.5'
                            } bg-slate-950 rounded-xl border shrink-0 flex items-center justify-center ${
                              rarityStyle.border
                            }`}
                          >
                            {selectedIconPath ? (
                              <img
                                src={selectedIconPath}
                                alt={selectedItem.name}
                                className={`${
                                  isSelectedUshi
                                    ? 'w-[90%] h-[90%]'
                                    : isSelectedNeko
                                    ? 'w-[86%] h-[86%]'
                                    : 'w-full h-full'
                                } object-contain drop-shadow select-none`}
                              />
                            ) : (
                              <span className="text-3xl select-none">
                                {selectedItem.icon || '📦'}
                              </span>
                            )}
                          </span>

                          {/* Tooltip ao passar o mouse sobre o ícone grande da fruta na inspeção */}
                          {hoveredInspectFruit && selectedFruit && (
                            <DevilFruitTooltip
                              fruit={selectedFruit}
                              positionClasses="bottom-[115%] left-0"
                              arrowClasses="-bottom-2 left-6 border-r-2 border-b-2"
                              isEquipped={player.equippedFruitId === selectedFruit.id}
                              activeEquippedFruitName={equippedFruit?.name}
                            />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-black text-slate-100 truncate">{selectedItem.name}</h4>
                            {isSelectedEquipped && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-emerald-950 border border-emerald-600/70 text-emerald-300">
                                Equipado no Pirata
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${rarityStyle.badgeBg}`}>
                              {rarityStyle.label}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {slotLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedItemId(null)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                        title="Fechar detalhes"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      {selectedItem.description}
                    </p>

                    {/* Atributos Concedidos */}
                    {selectedItem.statBonus && (
                      <div className="flex items-center space-x-2 text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                        {selectedItem.statBonus.strength && (
                          <span className="text-amber-400 font-bold">+{selectedItem.statBonus.strength} Força</span>
                        )}
                        {selectedItem.statBonus.resistance && (
                          <span className="text-emerald-400 font-bold">+{selectedItem.statBonus.resistance} Resistência</span>
                        )}
                        {selectedItem.statBonus.agility && (
                          <span className="text-cyan-400 font-bold">+{selectedItem.statBonus.agility} Agilidade</span>
                        )}
                        {(selectedItem.statBonus.intelligence || selectedItem.statBonus.fruitPower) && (
                          <span className="text-sky-400 font-bold">+{selectedItem.statBonus.intelligence || selectedItem.statBonus.fruitPower} Inteligência</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
                      <span className="text-xs font-bold flex items-center space-x-1">
                        <span className="text-slate-400">Preço:</span>
                        <span className={selectedItem.valueInBerries > 0 ? 'text-amber-400 font-extrabold flex items-center' : 'text-slate-500 italic flex items-center'}>
                          <Coins className="w-3.5 h-3.5 mr-1 text-amber-400" />
                          {selectedItem.valueInBerries > 0 ? `${selectedItem.valueInBerries.toLocaleString()} ฿` : '0 ฿ (Inicial)'}
                        </span>
                      </span>

                      {/* Botões de Ação */}
                      {isSelectedEquipped && selectedEquippedSlot && (
                        <button
                          type="button"
                          onClick={() => handleUnequip(selectedEquippedSlot)}
                          className="px-4 py-2 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center space-x-1.5 cursor-pointer border border-rose-400/40"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Desequipar (Guardar na Mochila)</span>
                        </button>
                      )}

                      {!isSelectedEquipped && (
                        <div className="flex items-center space-x-2">
                          {selectedItem.type === 'EQUIPMENT' && selectedItem.slot && (
                            <button
                              type="button"
                              onClick={() => handleEquip(selectedItem)}
                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center space-x-1.5 cursor-pointer border border-amber-300/40"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Equipar</span>
                            </button>
                          )}

                          {selectedItem.type === 'CONSUMABLE' && (
                            <button
                              type="button"
                              onClick={() => handleUseConsumable(selectedItem)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                              <span>Usar (+{selectedItem.energyRestore || 10} Energia)</span>
                            </button>
                          )}

                          {selectedItem.type === 'DEVIL_FRUIT' && (
                            <button
                              type="button"
                              onClick={() => {
                                const foundFruit = fruitsData.find((f) => f.id === selectedItem.fruitId);
                                if (foundFruit) {
                                  onTriggerFruitEvent(foundFruit as unknown as DevilFruit);
                                } else {
                                  onTriggerFruitDrop();
                                }
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center space-x-1.5 cursor-pointer border border-purple-400/40"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Avaliar / Comer</span>
                            </button>
                          )}

                          {/* Botão de Vender */}
                          <button
                            type="button"
                            onClick={() => setItemToSell(selectedItem)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-600/70 font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                            title={`Vender ${selectedItem.name} por ${selectedItem.valueInBerries.toLocaleString()} ฿`}
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>Vender</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE VENDA                             */}
      {/* ========================================================= */}
      {itemToSell && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border-2 border-amber-600/50 p-6 shadow-2xl space-y-5 text-center relative">
            
            {/* Botão Fechar no canto */}
            <button
              type="button"
              onClick={() => setItemToSell(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Cancelar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-amber-200 uppercase font-serif tracking-wide">
                Confirmar Venda
              </h3>
              <p className="text-xs text-slate-400">
                Deseja realmente vender este item da sua mochila?
              </p>
            </div>

            {/* Detalhes do Item sendo Vendido */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center space-x-3.5 text-left">
              <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 p-1.5 ${getRarityStyle(itemToSell.rarity).border} ${getRarityStyle(itemToSell.rarity).bg}`}>
                {getItemIconPath(itemToSell) ? (
                  <img
                    src={getItemIconPath(itemToSell)!}
                    alt={itemToSell.name}
                    className="w-full h-full object-contain drop-shadow select-none"
                  />
                ) : (
                  <span className="text-3xl select-none">{itemToSell.icon || '📦'}</span>
                )}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-black text-slate-100 truncate">{itemToSell.name}</h4>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${getRarityStyle(itemToSell.rarity).badgeBg}`}>
                    {getRarityStyle(itemToSell.rarity).label}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {getSlotLabel(itemToSell.slot, itemToSell.type)}
                  </span>
                </div>
              </div>
            </div>

            {/* Valor da Transação */}
            <div className={`p-4 rounded-2xl border ${
              itemToSell.valueInBerries > 0
                ? 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {itemToSell.valueInBerries > 0 ? 'Você receberá' : 'Valor de Venda'}
              </span>
              <div className="flex items-center justify-center space-x-1.5 text-2xl font-black">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className={itemToSell.valueInBerries > 0 ? 'text-amber-300' : 'text-slate-400'}>
                  +{itemToSell.valueInBerries.toLocaleString()} ฿
                </span>
              </div>
              {itemToSell.valueInBerries === 0 ? (
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  Item inicial sem valor comercial. A venda removerá permanentemente o item para liberar espaço na sua mochila.
                </p>
              ) : (
                <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                  Os Berries serão adicionados imediatamente ao saldo da sua tripulação.
                </p>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={() => setItemToSell(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSell}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow transition active:scale-95 cursor-pointer border border-amber-300/40"
              >
                {itemToSell.valueInBerries > 0 ? 'Confirmar Venda' : 'Confirmar e Liberar Espaço'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
