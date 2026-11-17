import { InventoryItem, EquipmentSlot, EquippedGear, PlayerAttributes, PirateAppearance } from '../types/player';

/**
 * Catálogo completo de itens de vestuário/equipamento com seus respectivos sprites e atributos
 */
export const GEAR_ITEMS: Record<string, InventoryItem> = {
  // ==========================================
  // CABEÇA (Cabelos e Bandanas)
  // ==========================================
  'cabelo_curto_baguncado': {
    id: 'gear-cabelo-curto-baguncado',
    name: 'Cabelo Curto Bagunçado',
    type: 'EQUIPMENT',
    slot: 'head',
    spriteId: 'cabelo_curto_baguncado',
    description: 'Estilo rebelde que não se curva a ninguém nos mares.',
    valueInBerries: 0,
    icon: '💇',
    statBonus: {},
    rarity: 'common',
  },
  'cabelo_curto_espetado_zoro': {
    id: 'gear-cabelo-curto-espetado',
    name: 'Cabelo Curto Espetado',
    type: 'EQUIPMENT',
    slot: 'head',
    spriteId: 'cabelo_curto_espetado_zoro',
    description: 'Corte intimidador com a determinação feroz de um espadachim.',
    valueInBerries: 0,
    icon: '⚔️',
    statBonus: {},
    rarity: 'common',
  },
  'bandana_preta': {
    id: 'gear-bandana-preta',
    name: 'Bandana Preta',
    type: 'EQUIPMENT',
    slot: 'head',
    spriteId: 'bandana_preta',
    description: 'Quando amarrada na cabeça, o pirata entra em foco mortal de combate.',
    valueInBerries: 0,
    icon: '🏴‍☠️',
    statBonus: { strength: 2, agility: 1 },
    rarity: 'common',
  },
  'bandana_vermelha': {
    id: 'gear-bandana-vermelha',
    name: 'Bandana Vermelha',
    type: 'EQUIPMENT',
    slot: 'head',
    spriteId: 'bandana_vermelha',
    description: 'Símbolo clássico de coragem dos marinheiros destemidos do East Blue.',
    valueInBerries: 0,
    icon: '🔴',
    statBonus: { strength: 1, resistance: 1 },
    rarity: 'common',
  },
  'bandana_listrada': {
    id: 'gear-bandana-listrada',
    name: 'Bandana Listrada',
    type: 'EQUIPMENT',
    slot: 'head',
    spriteId: 'bandana_listrada',
    description: 'Padrão tradicional de marinheiro atrevido e veloz.',
    valueInBerries: 0,
    icon: '🏁',
    statBonus: { agility: 2 },
    rarity: 'common',
  },

  // ==========================================
  // TORSO (Blusas e Coletes)
  // ==========================================
  'colete_vermelho': {
    id: 'gear-colete-vermelho',
    name: 'Colete Vermelho',
    type: 'EQUIPMENT',
    slot: 'torso',
    spriteId: 'colete_vermelho',
    description: 'Colete aberto clássico, flexível e resistente para socos devastadores.',
    valueInBerries: 0,
    icon: '🦺',
    statBonus: { strength: 2, resistance: 1 },
    rarity: 'common',
  },
  'camisa_linho': {
    id: 'gear-camisa-linho',
    name: 'Camisa de Linho',
    type: 'EQUIPMENT',
    slot: 'torso',
    spriteId: 'camisa_linho',
    description: 'Camisa pirata de tecido nobre e leve com cadarços frontais.',
    valueInBerries: 0,
    icon: '👔',
    statBonus: { resistance: 2, agility: 1 },
    rarity: 'common',
  },
  'camisa_listrada': {
    id: 'gear-camisa-listrada',
    name: 'Camisa Listrada',
    type: 'EQUIPMENT',
    slot: 'torso',
    spriteId: 'camisa_listrada',
    description: 'Malha marítima resistente ao salitre e intempéries da Grand Line.',
    valueInBerries: 0,
    icon: '👕',
    statBonus: { resistance: 1, agility: 2 },
    rarity: 'common',
  },

  // ==========================================
  // PERNAS (Calças e Bermudas)
  // ==========================================
  'bermuda_jeans': {
    id: 'gear-bermuda-jeans',
    name: 'Bermuda Jeans',
    type: 'EQUIPMENT',
    slot: 'legs',
    spriteId: 'bermuda_jeans',
    description: 'Bermuda desfiada nos joelhos com bolsos fundos para tesouros.',
    valueInBerries: 0,
    icon: '👖',
    statBonus: { resistance: 2 },
    rarity: 'common',
  },
  'bermuda_preta': {
    id: 'gear-bermuda-preta',
    name: 'Bermuda Preta',
    type: 'EQUIPMENT',
    slot: 'legs',
    spriteId: 'bermuda_preta',
    description: 'Tecido escuro reforçado que confere grande agilidade em combate.',
    valueInBerries: 0,
    icon: '🩳',
    statBonus: { agility: 2 },
    rarity: 'common',
  },
  'calca_preta': {
    id: 'gear-calca-preta',
    name: 'Calça Preta',
    type: 'EQUIPMENT',
    slot: 'legs',
    spriteId: 'calca_preta',
    description: 'Calça comprida justa com caimento perfeito que cobre o cano das botas.',
    valueInBerries: 0,
    icon: '👖',
    statBonus: { resistance: 2, strength: 1 },
    rarity: 'common',
  },

  // ==========================================
  // CALÇADOS (Sandálias e Botas)
  // ==========================================
  'sandalias_simples': {
    id: 'gear-sandalias-simples',
    name: 'Sandálias Simples',
    type: 'EQUIPMENT',
    slot: 'shoes',
    spriteId: 'sandalias_simples',
    description: 'Sandálias rústicas de palha que nunca se soltam dos pés do aventureiro.',
    valueInBerries: 0,
    icon: '🩴',
    statBonus: { agility: 1 },
    rarity: 'common',
  },
  'botas_zoro': {
    id: 'gear-botas-pretas',
    name: 'Botas Pretas',
    type: 'EQUIPMENT',
    slot: 'shoes',
    spriteId: 'botas_zoro',
    description: 'Botas de cano alto em couro negro com sola aderente para duelos intensos.',
    valueInBerries: 0,
    icon: '👢',
    statBonus: { strength: 2, resistance: 1 },
    rarity: 'common',
  },
};

/**
 * Retorna o item de equipamento correspondente a um spriteId ou null se for 'none' / desequipado
 */
export function getGearItemBySpriteId(slot: EquipmentSlot, spriteId?: string): InventoryItem | null {
  if (!spriteId || spriteId === 'none') return null;

  // Normalização de aliases legados
  let normalizedId = spriteId;
  if (spriteId === 'bandana') normalizedId = 'bandana_vermelha';
  if (spriteId === 'vest') normalizedId = 'colete_vermelho';
  if (spriteId === 'striped') normalizedId = 'camisa_listrada';
  if (spriteId === 'botas_pretas') normalizedId = 'botas_zoro';
  if (spriteId === 'cabelo_curto_espetado') normalizedId = 'cabelo_curto_espetado_zoro';

  const found = GEAR_ITEMS[normalizedId];
  if (found) {
    return { ...found, slot };
  }

  // Fallback genérico caso exista um id novo não registrado
  return {
    id: `gear-${slot}-${normalizedId}`,
    name: normalizedId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    type: 'EQUIPMENT',
    slot,
    spriteId: normalizedId,
    description: 'Item de vestuário forjado nos mares.',
    valueInBerries: 0,
    icon: slot === 'head' ? '🧢' : slot === 'torso' ? '👕' : slot === 'legs' ? '👖' : '👢',
    rarity: 'common',
  };
}

/**
 * Calcula a soma total de bônus de atributos concedidos pelas peças equipadas
 */
export function calculateGearBonuses(equippedGear?: EquippedGear | null): PlayerAttributes {
  const total: PlayerAttributes = {
    strength: 0,
    intelligence: 0,
    agility: 0,
    resistance: 0,
    fruitPower: 0,
  };
  if (!equippedGear) return total;

  const slots: (keyof EquippedGear)[] = ['head', 'torso', 'legs', 'shoes'];
  for (const slot of slots) {
    const item = equippedGear[slot];
    if (item && item.statBonus) {
      total.strength += item.statBonus.strength || 0;
      const intBonus = item.statBonus.intelligence ?? item.statBonus.fruitPower ?? 0;
      total.intelligence += intBonus;
      total.fruitPower = (total.fruitPower || 0) + intBonus;
      total.agility += item.statBonus.agility || 0;
      total.resistance += item.statBonus.resistance || 0;
    }
  }

  return total;
}

/**
 * Cria a mochila inicial garantindo peças extras para o jogador poder testar equipamentos imediatamente
 */
export function generateStarterInventory(chosenAppearance: PirateAppearance): InventoryItem[] {
  const inventory: InventoryItem[] = [
    {
      id: 'wooden-meat-1',
      name: 'Pedaço de Carne Suculenta',
      type: 'CONSUMABLE',
      description: 'Carne suculenta e assada na brasa. Restaura 10 de Energia imediatamente.',
      valueInBerries: 50,
      icon: '🍖',
      energyRestore: 10,
      rarity: 'common',
    },
    {
      id: 'wooden-meat-2',
      name: 'Pedaço de Carne Suculenta',
      type: 'CONSUMABLE',
      description: 'Carne suculenta e assada na brasa. Restaura 10 de Energia imediatamente.',
      valueInBerries: 50,
      icon: '🍖',
      energyRestore: 10,
      rarity: 'common',
    },
  ];

  // Adiciona peças extras de teste na mochila que sejam diferentes das que foram equipadas
  const chosenHat = chosenAppearance.hat;
  if (chosenHat !== 'bandana_preta') {
    inventory.push({ ...GEAR_ITEMS['bandana_preta'] });
  } else {
    inventory.push({ ...GEAR_ITEMS['cabelo_curto_espetado_zoro'] });
  }

  const chosenOutfit = chosenAppearance.outfit;
  if (chosenOutfit !== 'camisa_linho') {
    inventory.push({ ...GEAR_ITEMS['camisa_linho'] });
  } else {
    inventory.push({ ...GEAR_ITEMS['camisa_listrada'] });
  }

  const chosenPants = chosenAppearance.pants;
  if (chosenPants !== 'calca_preta') {
    inventory.push({ ...GEAR_ITEMS['calca_preta'] });
  } else {
    inventory.push({ ...GEAR_ITEMS['bermuda_preta'] });
  }

  const chosenShoes = chosenAppearance.shoes;
  if (chosenShoes !== 'botas_zoro') {
    inventory.push({ ...GEAR_ITEMS['botas_zoro'] });
  } else {
    inventory.push({ ...GEAR_ITEMS['sandalias_simples'] });
  }

  return inventory;
}
