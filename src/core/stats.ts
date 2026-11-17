import { Player, PlayerAttributes } from '../types/player';
import { DevilFruit } from '../types/fruit';

/**
 * Calcula a vida máxima (HP) com base na Resistência e no Nível do jogador
 */
export function calculateMaxHp(resistance: number, level: number = 1): number {
  return 100 + (level - 1) * 20 + resistance * 12;
}

/**
 * Calcula o custo em Berries para treinar um atributo
 * Custo progressivo: quanto maior o atributo, mais caro o treino
 */
export function calculateTrainingCost(currentValue: number): number {
  return Math.floor(25 * Math.pow(1.15, currentValue - 5));
}

/**
 * Retorna os atributos efetivos do jogador considerando os equipamentos e a Akuma no Mi ativa
 */
export function getEffectiveAttributes(
  baseAttributes: PlayerAttributes,
  fruit?: DevilFruit | null,
  gearBonus?: Partial<PlayerAttributes> | null
): PlayerAttributes {
  const bonus = gearBonus || {};
  const strWithGear = baseAttributes.strength + (bonus.strength || 0);
  const intWithGear = (baseAttributes.intelligence ?? baseAttributes.fruitPower ?? 5) + (bonus.intelligence ?? bonus.fruitPower ?? 0);
  const agiWithGear = baseAttributes.agility + (bonus.agility || 0);
  const resWithGear = baseAttributes.resistance + (bonus.resistance || 0);

  if (!fruit) {
    return {
      strength: strWithGear,
      intelligence: intWithGear,
      agility: agiWithGear,
      resistance: resWithGear,
      fruitPower: intWithGear,
    };
  }

  const mult = fruit.statMultipliers;
  const calcStat = (val: number, multiplier?: number) => {
    if (!multiplier || multiplier === 1) return val;
    const computed = Math.round(val * multiplier);
    return multiplier > 1 ? Math.max(val + 1, computed) : computed;
  };

  const intMult = mult.intelligenceMultiplier ?? mult.fruitPowerMultiplier;

  return {
    strength: calcStat(strWithGear, mult.strengthMultiplier),
    intelligence: calcStat(intWithGear, intMult),
    agility: calcStat(agiWithGear, mult.agilityMultiplier),
    resistance: calcStat(resWithGear, mult.resistanceMultiplier),
    fruitPower: calcStat(intWithGear, intMult),
  };
}

/**
 * Calcula a experiência necessária para o próximo nível
 */
export function calculateExpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

/**
 * Adiciona experiência ao jogador e processa subidas de nível cumulativas
 * A cada nível ganho: +5 Pontos Livres para distribuir e recálculo da meta de EXP.
 */
export function addExperience(
  player: Player,
  expGained: number
): {
  updatedPlayer: Player;
  levelsGained: number;
  pointsGained: number;
} {
  let currentExp = player.experience + expGained;
  let currentLevel = player.level;
  let expRequired = player.experienceToNextLevel || calculateExpForNextLevel(currentLevel);
  let points = player.availableAttributePoints;
  let levelsGained = 0;

  while (currentExp >= expRequired) {
    currentExp -= expRequired;
    currentLevel += 1;
    levelsGained += 1;
    points += 5; // +5 Pontos Livres por nível
    expRequired = calculateExpForNextLevel(currentLevel);
  }

  const updatedPlayer: Player = {
    ...player,
    level: currentLevel,
    experience: currentExp,
    experienceToNextLevel: expRequired,
    availableAttributePoints: points,
  };

  return { updatedPlayer, levelsGained, pointsGained: levelsGained * 5 };
}
