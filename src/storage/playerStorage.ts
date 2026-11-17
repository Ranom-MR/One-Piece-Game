import { Player, PlayerAttributes, PirateAppearance, EquippedGear } from '../types/player';
import { DEFAULT_APPEARANCE } from '../data/appearanceOptions';
import { getGearItemBySpriteId, generateStarterInventory, GEAR_ITEMS } from '../data/equipmentItems';

const STORAGE_KEY = 'OP_RPG_PLAYER_SAVE_V1';

export const INITIAL_BASE_ATTRIBUTES: PlayerAttributes = {
  strength: 5,
  intelligence: 5,
  agility: 5,
  resistance: 5,
};

export const INITIAL_AVAILABLE_POINTS = 5;

export const DEFAULT_PLAYER: Player = {
  id: 'pirate-1',
  name: 'Monkey D. Luffy',
  title: 'Aspirante a Pirata',
  avatar: 'luffy',
  appearance: DEFAULT_APPEARANCE,
  equippedGear: {
    head: getGearItemBySpriteId('head', DEFAULT_APPEARANCE.hat)
      ? { ...getGearItemBySpriteId('head', DEFAULT_APPEARANCE.hat)!, statBonus: {} }
      : null,
    torso: getGearItemBySpriteId('torso', DEFAULT_APPEARANCE.outfit)
      ? { ...getGearItemBySpriteId('torso', DEFAULT_APPEARANCE.outfit)!, statBonus: {} }
      : null,
    legs: getGearItemBySpriteId('legs', DEFAULT_APPEARANCE.pants)
      ? { ...getGearItemBySpriteId('legs', DEFAULT_APPEARANCE.pants)!, statBonus: {} }
      : null,
    shoes: getGearItemBySpriteId('shoes', DEFAULT_APPEARANCE.shoes)
      ? { ...getGearItemBySpriteId('shoes', DEFAULT_APPEARANCE.shoes)!, statBonus: {} }
      : null,
  },
  bounty: 0,
  berries: 150,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  energy: {
    current: 100,
    max: 100,
    lastRechargeTimestamp: Date.now(),
  },
  attributes: { ...INITIAL_BASE_ATTRIBUTES },
  availableAttributePoints: INITIAL_AVAILABLE_POINTS,
  equippedFruitId: null,
  currentIslandId: 'windmill-village',
  clearedIslandIds: [],
  completedQuestIds: [],
  inventory: generateStarterInventory(DEFAULT_APPEARANCE),
  activeTraining: null,
};

/**
 * Verifica se já existe um jogador salvo no LocalStorage
 */
export function hasSavedPlayer(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Carrega os dados salvos do jogador ou retorna null se não houver save
 * Também calcula a regeneração de energia offline (1 energia a cada 60s)
 */
export function loadSavedPlayer(): Player | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const player: Player = JSON.parse(raw);

    // Garantir que campos novos existam
    if (!player.avatar) player.avatar = 'luffy';
    if (!player.appearance) player.appearance = DEFAULT_APPEARANCE;
    if (!player.completedQuestIds) player.completedQuestIds = [];
    if (!player.clearedIslandIds) player.clearedIslandIds = [];

    // Sincroniza e garante equippedGear se não existir no save antigo
    if (!player.equippedGear) {
      player.equippedGear = {
        head: getGearItemBySpriteId('head', player.appearance.hat),
        torso: getGearItemBySpriteId('torso', player.appearance.outfit),
        legs: getGearItemBySpriteId('legs', player.appearance.pants),
        shoes: getGearItemBySpriteId('shoes', player.appearance.shoes),
      };
    }

    // Se o inventário estiver vazio de equipamentos para teste, adiciona peças extras
    const hasEquipmentInInventory = player.inventory.some((i) => i.type === 'EQUIPMENT');
    if (!hasEquipmentInInventory) {
      const extraItems = generateStarterInventory(player.appearance);
      player.inventory = [
        ...player.inventory,
        ...extraItems.filter((i) => i.type === 'EQUIPMENT'),
      ];
    }

    // Sanitização de itens iniciais de criação (valor 0 Berries e raridade comum)
    if (player.inventory) {
      player.inventory = player.inventory.map((item) => {
        if (item.type === 'EQUIPMENT' && (item.id.startsWith('gear-') || (item.spriteId && GEAR_ITEMS[item.spriteId]))) {
          return { ...item, valueInBerries: 0, rarity: 'common' };
        }
        return item;
      });
    }
    if (player.equippedGear) {
      (Object.keys(player.equippedGear) as (keyof EquippedGear)[]).forEach((slot) => {
        const item = player.equippedGear![slot];
        if (item && item.type === 'EQUIPMENT' && (item.id.startsWith('gear-') || (item.spriteId && GEAR_ITEMS[item.spriteId]))) {
          player.equippedGear![slot] = { ...item, valueInBerries: 0, rarity: 'common' };
        }
      });
    }

    // Migração de Atributos: garante a presença de Inteligência caso o save seja legado
    if (player.attributes) {
      if (player.attributes.intelligence === undefined) {
        player.attributes.intelligence = player.attributes.fruitPower ?? 5;
      }
    } else {
      player.attributes = { ...INITIAL_BASE_ATTRIBUTES };
    }

    // Sanitização e migração para Nível 1:
    // Garante que o jogador de Nível 1 possua atributos base 5 e 5 pontos livres (eliminando resíduos legados)
    if (player.level === 1) {
      const attrs = player.attributes;
      const totalPoints =
        (attrs?.strength ?? 0) +
        (attrs?.intelligence ?? 0) +
        (attrs?.agility ?? 0) +
        (attrs?.resistance ?? 0) +
        (player.availableAttributePoints ?? 0);

      // Em nível 1: 4 * 5 base + 5 pontos livres = 25 pontos totais.
      // Se não somar 25 ou se qualquer atributo base for inferior a 5, restaura o padrão de início
      if (
        !attrs ||
        totalPoints !== 25 ||
        attrs.strength < 5 ||
        attrs.intelligence < 5 ||
        attrs.agility < 5 ||
        attrs.resistance < 5
      ) {
        player.attributes = { ...INITIAL_BASE_ATTRIBUTES };
        player.availableAttributePoints = INITIAL_AVAILABLE_POINTS;
        savePlayer(player);
      }
    }

    // Migração de Energia Máxima para 100
    if (!player.energy || player.energy.max !== 100) {
      player.energy = {
        current: player.energy ? Math.min(100, Math.max(player.energy.current, 100)) : 100,
        max: 100,
        lastRechargeTimestamp: player.energy?.lastRechargeTimestamp || Date.now(),
      };
      savePlayer(player);
    }

    // Verificar se o treinamento offline foi concluído enquanto o jogo estava fechado
    if (player.activeTraining) {
      const now = Date.now();
      if (now >= player.activeTraining.endsAt) {
        const attr = player.activeTraining.attribute;
        player.attributes[attr] = (player.attributes[attr] || 5) + 1;
        player.activeTraining = null;
        savePlayer(player);
      }
    }

    // Calcular regeneração de energia com o tempo decorrido
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - (player.energy.lastRechargeTimestamp || now)) / 1000);
    const energyToAdd = Math.floor(elapsedSeconds / 60);

    if (energyToAdd > 0 && player.energy.current < player.energy.max) {
      player.energy.current = Math.min(player.energy.max, player.energy.current + energyToAdd);
      player.energy.lastRechargeTimestamp = now;
      savePlayer(player);
    }

    return player;
  } catch (err) {
    console.error('Erro ao carregar dados do jogador:', err);
    return null;
  }
}

/**
 * Cria um novo pirata do zero a partir do fluxo de criação
 * Força rigorosamente atributos 5 em tudo e 5 pontos livres no Nível 1
 */
export function createNewPlayer(
  name: string,
  avatar: string,
  _attributes?: PlayerAttributes,
  appearance?: PirateAppearance,
  _availableAttributePoints: number = INITIAL_AVAILABLE_POINTS
): Player {
  const finalAppearance = appearance || DEFAULT_APPEARANCE;

  // Sincroniza as roupas iniciais da Criação sem bônus adicionais de combate para manter a base limpa
  const equippedGear: EquippedGear = {
    head: getGearItemBySpriteId('head', finalAppearance.hat)
      ? { ...getGearItemBySpriteId('head', finalAppearance.hat)!, statBonus: {} }
      : null,
    torso: getGearItemBySpriteId('torso', finalAppearance.outfit)
      ? { ...getGearItemBySpriteId('torso', finalAppearance.outfit)!, statBonus: {} }
      : null,
    legs: getGearItemBySpriteId('legs', finalAppearance.pants)
      ? { ...getGearItemBySpriteId('legs', finalAppearance.pants)!, statBonus: {} }
      : null,
    shoes: getGearItemBySpriteId('shoes', finalAppearance.shoes)
      ? { ...getGearItemBySpriteId('shoes', finalAppearance.shoes)!, statBonus: {} }
      : null,
  };

  const inventory = generateStarterInventory(finalAppearance);

  const newPlayer: Player = {
    ...DEFAULT_PLAYER,
    id: `pirate-${Date.now()}`,
    name: name.trim() || 'Aspirante Sem Nome',
    avatar,
    appearance: finalAppearance,
    equippedGear,
    inventory,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    // Forçar rigorosamente os atributos iniciais no Nível 1: exatamente 5 em tudo
    attributes: { ...INITIAL_BASE_ATTRIBUTES },
    // Painel de evolução inicializa com exatamente 5 pontos livres
    availableAttributePoints: INITIAL_AVAILABLE_POINTS,
    energy: {
      current: 100,
      max: 100,
      lastRechargeTimestamp: Date.now(),
    },
    bounty: 0,
    berries: 150,
    equippedFruitId: null,
    currentIslandId: 'windmill-village',
    clearedIslandIds: [],
    activeTraining: null,
  };

  savePlayer(newPlayer);
  return newPlayer;
}

/**
 * Salva os dados do jogador no LocalStorage
 */
export function savePlayer(player: Player): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch (err) {
    console.error('Erro ao salvar dados do jogador:', err);
  }
}

/**
 * Remove o save atual para permitir criar um novo pirata
 */
export function deletePlayerSave(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
