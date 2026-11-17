import { PlayerAttributes } from './player';

export interface CombatFighter {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  attributes: PlayerAttributes;
  currentHp: number;
  maxHp: number;
  isPlayer: boolean;
  equippedFruitId?: string | null;
}

export interface CombatTurnAction {
  turnNumber: number;
  attackerId: string;
  defenderId: string;
  actionType: 'NORMAL_ATTACK' | 'FRUIT_SKILL' | 'DODGE' | 'CRITICAL';
  damageDealt: number;
  isCritical: boolean;
  isDodged: boolean;
  logMessage: string;
  defenderRemainingHp: number;
}

export interface CombatResult {
  winnerId: string;
  loserId: string;
  turns: CombatTurnAction[];
  rewards?: {
    berries: number;
    experience: number;
    bountyIncrease: number;
  };
}
