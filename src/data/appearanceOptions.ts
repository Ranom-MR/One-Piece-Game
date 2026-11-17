export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface ChoiceOption {
  id: string;
  name: string;
  icon?: string;
}

export const GENDER_OPTIONS = [
  { id: 'male', name: 'Masculino', symbol: '♂' },
  { id: 'female', name: 'Feminino', symbol: '♀' },
];

export const SKIN_COLORS: ColorOption[] = [
  { id: 'fair', name: 'Clara', hex: '#ffd8b3' },
  { id: 'tan', name: 'Bronzeada', hex: '#f0be8d' },
  { id: 'warm', name: 'Morena', hex: '#d99763' },
  { id: 'dark', name: 'Retinta', hex: '#8c5936' },
  { id: 'pale', name: 'Pálida', hex: '#ffe6d0' },
];

export const HAIR_STYLES: ChoiceOption[] = [
  { id: 'messy', name: 'Rebelde (Luffy)' },
  { id: 'spiky', name: 'Espetado (Zoro)' },
  { id: 'slick', name: 'Franja Longa (Sanji)' },
  { id: 'short', name: 'Curto Clássico' },
  { id: 'long', name: 'Longo Ondulado' },
  { id: 'ponytail', name: 'Rabo de Cavalo' },
  { id: 'buzz', name: 'Raspado Militar' },
];

export const HAIR_COLORS: ColorOption[] = [
  { id: 'black', name: 'Preto Ébano', hex: '#1c1917' },
  { id: 'green', name: 'Verde Musgo', hex: '#16a34a' },
  { id: 'yellow', name: 'Loiro Dourado', hex: '#eab308' },
  { id: 'orange', name: 'Ruivo Fogo', hex: '#ea580c' },
  { id: 'white', name: 'Branco Prata', hex: '#f1f5f9' },
  { id: 'blue', name: 'Azul Marinho', hex: '#2563eb' },
  { id: 'purple', name: 'Roxo Místico', hex: '#9333ea' },
];

export const EYE_STYLES: ChoiceOption[] = [
  { id: 'determined', name: 'Destemido (Luffy)' },
  { id: 'fierce', name: 'Feroz (Zoro)' },
  { id: 'confident', name: 'Confiante (Sanji)' },
  { id: 'calm', name: 'Calmo & Estrategista' },
];

export const MOUTH_STYLES: ChoiceOption[] = [
  { id: 'grin', name: 'Sorriso de Dentes' },
  { id: 'smirk', name: 'Sorriso de Canto' },
  { id: 'smile', name: 'Sorriso Confiante' },
  { id: 'serious', name: 'Firme / Sério' },
];

export const SCAR_STYLES: ChoiceOption[] = [
  { id: 'none', name: 'Nenhuma' },
  { id: 'eye_cut', name: 'Corte no Olho (Zoro)' },
  { id: 'cheek_cut', name: 'Cicatriz Bochecha (Luffy)' },
  { id: 'cross', name: 'Cruz no Rosto' },
  { id: 'beard', name: 'Cavanhaque Pirata' },
];

export const HAT_STYLES: ChoiceOption[] = [
  { id: 'none', name: 'Careca' },
  { id: 'cabelo_curto_baguncado', name: 'Cabelo Curto Bagunçado' },
  { id: 'cabelo_curto_espetado_zoro', name: 'Cabelo Curto Espetado' },
  { id: 'bandana_preta', name: 'Bandana Preta' },
  { id: 'bandana_vermelha', name: 'Bandana Vermelha' },
  { id: 'bandana_listrada', name: 'Bandana Listrada' },
];

export const OUTFIT_STYLES: ChoiceOption[] = [
  { id: 'none', name: 'Sem Blusa' },
  { id: 'colete_vermelho', name: 'Colete Vermelho' },
  { id: 'camisa_linho', name: 'Camisa de Linho' },
  { id: 'camisa_listrada', name: 'Camisa Listrada' },
];

export const PANTS_STYLES: ChoiceOption[] = [
  { id: 'none', name: 'Sem Calça' },
  { id: 'bermuda_preta', name: 'Bermuda Preta' },
  { id: 'bermuda_jeans', name: 'Bermuda Jeans' },
  { id: 'calca_preta', name: 'Calça Preta' },
];

export const SHOES_STYLES: ChoiceOption[] = [
  { id: 'none', name: 'Descalço' },
  { id: 'sandalias_simples', name: 'Sandálias Simples' },
  { id: 'botas_zoro', name: 'Botas Pretas' },
];

export const OUTFIT_COLORS: ColorOption[] = [
  { id: 'red', name: 'Vermelho Carmesim', hex: '#dc2626' },
  { id: 'green', name: 'Verde Esmeralda', hex: '#059669' },
  { id: 'blue', name: 'Azul Oceano', hex: '#2563eb' },
  { id: 'black', name: 'Preto Pirata', hex: '#18181b' },
  { id: 'gold', name: 'Ouro Real', hex: '#d97706' },
  { id: 'purple', name: 'Púrpura', hex: '#7c3aed' },
];

export const DEFAULT_APPEARANCE = {
  gender: 'male' as const,
  skinColor: '#f0be8d',
  hairStyle: 'messy',
  hairColor: '#1c1917',
  eyes: 'determined',
  mouth: 'grin',
  scar: 'none',
  hat: 'bandana_vermelha',
  outfit: 'colete_vermelho',
  pants: 'bermuda_jeans',
  shoes: 'sandalias_simples',
  outfitColor: '#dc2626',
};

/**
 * Sorteia uma aparência aleatória divertida para o botão de Dado (🎲)
 */
export function getRandomAppearance() {
  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    gender: Math.random() > 0.5 ? ('male' as const) : ('female' as const),
    skinColor: rand(SKIN_COLORS).hex,
    hairStyle: rand(HAIR_STYLES).id,
    hairColor: rand(HAIR_COLORS).hex,
    eyes: rand(EYE_STYLES).id,
    mouth: rand(MOUTH_STYLES).id,
    scar: rand(SCAR_STYLES).id,
    hat: rand(HAT_STYLES).id,
    outfit: rand(OUTFIT_STYLES).id,
    pants: rand(PANTS_STYLES).id,
    shoes: rand(SHOES_STYLES).id,
    outfitColor: rand(OUTFIT_COLORS).hex,
  };
}
