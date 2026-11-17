import { PlayerAttributes } from './player';

export interface Quest {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  durationSeconds: number;
  recommendedLevel: number;
  isBoss?: boolean;
  isMiniBoss?: boolean;
  bossAvatar?: string;
  rewards: {
    berriesMin: number;
    berriesMax: number;
    experience: number;
    possibleFruitDropId?: string;
    fruitDropChance?: number; // e.g., 0.05 (5%)
  };
  requiredAttributes?: Partial<PlayerAttributes>;
}

export interface IslandBoss {
  id: string;
  name: string;
  title: string;
  avatar: string;
  attributes: PlayerAttributes;
  maxHp: number;
  rewardBerries: number;
  rewardExperience: number;
  bountyIncrease: number;
}

export interface Island {
  id: string;
  name: string;
  chapterNumber: number;
  sea: string; // Ex: 'East Blue'
  description: string;
  recommendedLevel: number;
  icon?: string;
  themeColor?: string;
  mapCoordinates?: { x: number; y: number };
  quests: Quest[];
  boss: IslandBoss;
}
