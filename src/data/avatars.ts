export interface PirateAvatarOption {
  id: string;
  name: string;
  archetype: string;
  emoji: string;
  badge: string;
  description: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
}

export const PIRATE_AVATARS: PirateAvatarOption[] = [
  {
    id: 'luffy',
    name: 'O Chapéu de Palha',
    archetype: 'Lutador Destemido',
    emoji: '👒',
    badge: 'Espírito Livre & Punhos',
    description: 'Aventureiro incansável movido pela liberdade e carne suculenta.',
    bgGradient: 'from-amber-500 via-red-600 to-rose-900',
    borderColor: 'border-red-500',
    shadowColor: 'shadow-red-600/30',
  },
  {
    id: 'zoro',
    name: 'O Mestre das Lâminas',
    archetype: 'Espadachim Três Lâminas',
    emoji: '⚔️',
    badge: 'Crítico & Cortes Pesados',
    description: 'Guerreiro disciplinado cuja lâmina corta aço e pesadelos.',
    bgGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    borderColor: 'border-emerald-500',
    shadowColor: 'shadow-emerald-600/30',
  },
  {
    id: 'sanji',
    name: 'A Perna Flamejante',
    archetype: 'Cozinheiro Cavalheiro',
    emoji: '🔥',
    badge: 'Agilidade & Chutes Explosivos',
    description: 'Chutes acrobáticos devastadores e culinária de primeira classe.',
    bgGradient: 'from-orange-500 via-amber-600 to-yellow-800',
    borderColor: 'border-amber-500',
    shadowColor: 'shadow-orange-600/30',
  },
  {
    id: 'usopp',
    name: 'O Franco-Atirador',
    archetype: 'Atirador Astuto',
    emoji: '🎯',
    badge: 'Precisão & Armadilhas',
    description: 'Gênio das táticas, nunca erra o alvo mesmo à longa distância.',
    bgGradient: 'from-yellow-600 via-lime-700 to-slate-900',
    borderColor: 'border-yellow-500',
    shadowColor: 'shadow-yellow-600/30',
  },
  {
    id: 'nami',
    name: 'A Senhora do Clima',
    archetype: 'Navegadora Estrategista',
    emoji: '🧭',
    badge: 'Evasão & Feitiços de Vento',
    description: 'Controla tempestades marítimas e conhece todas as rotas do mar.',
    bgGradient: 'from-sky-500 via-blue-600 to-indigo-900',
    borderColor: 'border-sky-500',
    shadowColor: 'shadow-sky-600/30',
  },
  {
    id: 'law',
    name: 'O Cirurgião Tático',
    archetype: 'Capitão Estrategista',
    emoji: '⚖️',
    badge: 'Poder Místico & Controle',
    description: 'Cirurgião frio que dita as regras do campo de batalha com maestria.',
    bgGradient: 'from-purple-600 via-indigo-800 to-slate-950',
    borderColor: 'border-purple-500',
    shadowColor: 'shadow-purple-600/30',
  },
];

export function getAvatarById(id: string): PirateAvatarOption {
  return PIRATE_AVATARS.find((a) => a.id === id) || PIRATE_AVATARS[0];
}
