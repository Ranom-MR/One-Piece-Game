export interface PirateAppearance {
  gender?: 'male' | 'female'; // Gênero
  skinColor: string;       // Tom de pele em hexadecimal
  hairStyle: string;       // messy, spiky, short, long, slick, buzz, ponytail
  hairColor: string;       // Cor do cabelo em hexadecimal
  eyes: string;            // determined, fierce, confident, calm
  mouth?: string;          // grin, smile, smirk, serious
  scar: string;            // none, eye_cut, cheek_cut, cross, beard
  hat: string;             // none, straw_hat, bandana, captain, goggles
  outfit: string;          // vest, coat, gi, striped, colete_vermelho, etc.
  pants?: string;          // none, bermuda_preta, bermuda_jeans, calca_preta
  shoes?: string;          // none, sandalias_simples
  outfitColor: string;     // Cor do traje principal em hexadecimal
}

export interface PlayerAttributes {
  strength: number;      // Força Física (Dano Físico Base)
  intelligence: number;  // Inteligência (Porcentagem de Acerto Crítico)
  agility: number;       // Agilidade (Iniciativa e Esquiva)
  resistance: number;    // Resistência (Vida Máxima e Defesa)
  fruitPower?: number;   // Legado / compatibilidade com saves antigos
}

export type EquipmentSlot = 'head' | 'torso' | 'legs' | 'shoes';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'EQUIPMENT' | 'DEVIL_FRUIT' | 'CONSUMABLE' | 'MATERIAL';
  description: string;
  valueInBerries: number;
  icon?: string;
  iconPath?: string;
  spriteUrl?: string;
  statBonus?: Partial<PlayerAttributes>;
  fruitId?: string;
  slot?: EquipmentSlot;
  spriteId?: string;       // ID correspondente no PirateAppearance (ex: 'bandana_preta', 'colete_vermelho')
  energyRestore?: number;  // Quantidade de energia restaurada ao consumir
  rarity?: ItemRarity;     // 'common' | 'rare' | 'epic' | 'legendary'
  quantity?: number;       // Para itens empilháveis (ex: carnes, consumíveis, materiais)
}

export interface EquippedGear {
  head: InventoryItem | null;
  torso: InventoryItem | null;
  legs: InventoryItem | null;
  shoes: InventoryItem | null;
}

export interface PlayerEnergy {
  current: number;
  max: number;
  lastRechargeTimestamp: number;
}

export interface ActiveTraining {
  attribute: keyof PlayerAttributes;
  attributeName: string;
  startedAt: number;        // Timestamp Date.now() em ms
  durationSeconds: number;  // Duração total em segundos (ex: 1800 para 30 minutos)
  endsAt: number;           // Timestamp Date.now() + durationSeconds * 1000
}

export interface ActiveQuest {
  questId: string;
  questName: string;
  islandId: string;
  islandName: string;
  startedAt: number;        // Timestamp Date.now() em ms
  durationSeconds: number;  // Duração total em segundos (ex: 3600 para 1 hora)
  endsAt: number;           // Timestamp Date.now() + durationSeconds * 1000
  rewards: {
    berriesMin: number;
    berriesMax: number;
    experience: number;
    possibleFruitDropId?: string;
    fruitDropChance?: number;
  };
}

export interface Player {
  id: string;
  name: string;
  title: string;
  avatar: string;               // ID do arquétipo/avatar de referência
  appearance?: PirateAppearance; // Customização estética modular em camadas SVG
  equippedGear?: EquippedGear;  // Peças de vestuário/equipamento atualmente equipadas
  bounty: number;               // Recompensa da Marinha em Berries
  berries: number;              // Moeda corrente do jogador
  level: number;
  experience: number;
  experienceToNextLevel: number;
  energy: PlayerEnergy;
  attributes: PlayerAttributes;
  availableAttributePoints: number;
  equippedFruitId: string | null; // ID da Akuma no Mi consumida
  currentIslandId: string;
  clearedIslandIds: string[];
  completedQuestIds: string[]; // IDs de missões já concluídas pelo jogador
  inventory: InventoryItem[];
  activeTraining?: ActiveTraining | null; // Treinamento em andamento no Dojo
  activeQuest?: ActiveQuest | null;       // Missão de exploração ativa em andamento (1h)
}
