import { CombatFighter, CombatResult, CombatTurnAction } from '../types/combat';

/**
 * Calcula a chance de esquiva (em %) entre atacante e defensor com base na Agilidade
 */
export function calculateDodgeChance(attackerAgility: number, defenderAgility: number): number {
  const diff = defenderAgility - attackerAgility;
  const chance = 5 + diff * 0.45;
  return Math.min(Math.max(chance, 4), 30); // Entre 4% e 30%
}

/**
 * Calcula a chance de acerto crítico (em %) com base na Inteligência do atacante
 * Quanto maior a inteligência tática, maior a probabilidade de acertar pontos vitais.
 */
export function calculateCritChance(intelligence: number): number {
  const chance = 5 + intelligence * 0.55;
  return Math.min(Math.max(chance, 5), 50); // Entre 5% e 50%
}

/**
 * Simula um combate em turnos completo de forma determinística e balanceada
 */
export function simulateCombat(fighter1: CombatFighter, fighter2: CombatFighter): CombatResult {
  const turns: CombatTurnAction[] = [];
  let turnCount = 1;

  // Clone para mutação durante a simulação
  const p1 = { ...fighter1, currentHp: fighter1.currentHp };
  const p2 = { ...fighter2, currentHp: fighter2.currentHp };

  // Ordem de iniciativa baseada na Agilidade
  let attacker = p1.attributes.agility >= p2.attributes.agility ? p1 : p2;
  let defender = attacker === p1 ? p2 : p1;

  while (p1.currentHp > 0 && p2.currentHp > 0 && turnCount <= 40) {
    const dodgeChance = calculateDodgeChance(attacker.attributes.agility, defender.attributes.agility);
    const isDodged = Math.random() * 100 < dodgeChance;

    if (isDodged) {
      turns.push({
        turnNumber: turnCount,
        attackerId: attacker.id,
        defenderId: defender.id,
        actionType: 'DODGE',
        damageDealt: 0,
        isCritical: false,
        isDodged: true,
        logMessage: `${defender.name} esquivou com reflexos rápidos do golpe de ${attacker.name}!`,
        defenderRemainingHp: defender.currentHp,
      });
    } else {
      const attackerIntelligence = attacker.attributes.intelligence ?? attacker.attributes.fruitPower ?? 5;
      const critChance = calculateCritChance(attackerIntelligence);
      const isCritical = Math.random() * 100 < critChance;

      // Base de ataque derivada da Força (escala equilibrada para HP 120-220)
      const baseDamage = 10 + attacker.attributes.strength * 2.0;

      // Redução de dano calculada com a Resistência do defensor
      const defenseMitigation = defender.attributes.resistance * 0.55;

      // Variação orgânica de ±10%
      const variation = 0.9 + Math.random() * 0.2;
      let calculatedDamage = (baseDamage - defenseMitigation) * variation;

      // Dano mínimo garantido proporcional para que a luta nunca estagne
      const minDamage = Math.max(8, Math.floor(attacker.attributes.strength * 0.8));
      let finalDamage = Math.max(minDamage, Math.round(calculatedDamage));

      if (isCritical) {
        // Multiplicador de crítico escalando com a Inteligência (1.5x base até 1.75x)
        const critMultiplier = 1.5 + Math.min(0.25, Math.max(0, (attackerIntelligence - 5) * 0.008));
        finalDamage = Math.round(finalDamage * critMultiplier);
      }

      defender.currentHp = Math.max(0, defender.currentHp - finalDamage);

      turns.push({
        turnNumber: turnCount,
        attackerId: attacker.id,
        defenderId: defender.id,
        actionType: isCritical ? 'CRITICAL' : 'NORMAL_ATTACK',
        damageDealt: finalDamage,
        isCritical,
        isDodged: false,
        logMessage: isCritical
          ? `💥 GOLPE CRÍTICO! ${attacker.name} acertou em cheio ${defender.name} causando ${finalDamage} de dano!`
          : `${attacker.name} atacou ${defender.name} causando ${finalDamage} de dano.`,
        defenderRemainingHp: defender.currentHp,
      });
    }

    if (defender.currentHp <= 0) break;

    // Troca de turno
    const temp = attacker;
    attacker = defender;
    defender = temp;
    turnCount++;
  }

  const winner = p1.currentHp > 0 ? p1 : p2;
  const loser = winner === p1 ? p2 : p1;

  return {
    winnerId: winner.id,
    loserId: loser.id,
    turns,
  };
}
