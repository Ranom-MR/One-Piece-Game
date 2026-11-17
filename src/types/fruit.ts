import { ItemRarity } from './player';

export type FruitCategory = 'PARAMECIA' | 'ZOAN' | 'LOGIA';

export interface FruitSkill {
  id: string;
  name: string;
  powerModifier: number;
  energyCost: number;
  description: string;
}

export interface DevilFruit {
  id: string;
  name: string;
  romajiName: string;
  englishMeaning: string;
  category: FruitCategory;
  rarity?: ItemRarity;
  description: string;
  sellValueInBerries: number;
  iconPath?: string;
  spriteUrl?: string;
  statMultipliers: {
    strengthMultiplier?: number;
    intelligenceMultiplier?: number;
    fruitPowerMultiplier?: number; // compatibilidade retroativa
    agilityMultiplier?: number;
    resistanceMultiplier?: number;
  };
  skills: FruitSkill[];
}
