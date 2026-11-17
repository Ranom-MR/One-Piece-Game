'use client';

import React, { useState } from 'react';
import { Player, PirateAppearance } from '@/types/player';
import {
  GENDER_OPTIONS,
  SKIN_COLORS,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_STYLES,
  MOUTH_STYLES,
  SCAR_STYLES,
  HAT_STYLES,
  OUTFIT_STYLES,
  PANTS_STYLES,
  SHOES_STYLES,
  OUTFIT_COLORS,
  DEFAULT_APPEARANCE,
  getRandomAppearance,
} from '@/data/appearanceOptions';
import { PirateAvatar } from '@/components/PirateAvatar';
import { createNewPlayer } from '@/storage/playerStorage';
import {
  ChevronLeft,
  ChevronRight,
  Dices,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CharacterCreationFlowProps {
  onCharacterCreated: (player: Player) => void;
}

export function CharacterCreationFlow({ onCharacterCreated }: CharacterCreationFlowProps) {
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState<PirateAppearance>(DEFAULT_APPEARANCE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auxiliar para ciclar opções (setas ◀ e ▶)
  function cycleOption<T>(
    currentVal: string,
    list: { id: string; hex?: string }[],
    direction: -1 | 1,
    key: keyof PirateAppearance,
    useHex = false
  ) {
    const currentIndex = list.findIndex((item) => (useHex ? item.hex === currentVal : item.id === currentVal));
    const nextIndex = (currentIndex + direction + list.length) % list.length;
    const nextItem = list[nextIndex];
    setAppearance((prev) => ({
      ...prev,
      [key]: useHex && nextItem.hex ? nextItem.hex : nextItem.id,
    }));
  }

  // Sorteio Aleatório (Dado) - Sorteia entre os chapéus, blusas, calças e calçados reais disponíveis
  function handleRandomize() {
    const randomHat = HAT_STYLES[Math.floor(Math.random() * HAT_STYLES.length)];
    const randomOutfit = OUTFIT_STYLES[Math.floor(Math.random() * OUTFIT_STYLES.length)];
    const randomPants = PANTS_STYLES[Math.floor(Math.random() * PANTS_STYLES.length)];
    const randomShoes = SHOES_STYLES[Math.floor(Math.random() * SHOES_STYLES.length)];
    setAppearance((prev) => ({
      ...prev,
      hat: randomHat.id,
      outfit: randomOutfit.id,
      pants: randomPants.id,
      shoes: randomShoes.id,
    }));
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErrorMsg('Por favor, escolha um nome com pelo menos 2 caracteres.');
      return;
    }
    if (trimmed.length > 20) {
      setErrorMsg('O nome do pirata não pode ultrapassar 20 caracteres.');
      return;
    }

    // Inicialização fixa e balanceada: exatamente 5 em todos os atributos e 5 pontos livres
    const avatarId = appearance.gender === 'female' ? 'nami' : 'luffy';
    const newPlayer = createNewPlayer(trimmed, avatarId, undefined, appearance);
    onCharacterCreated(newPlayer);
  }

  // Obter nomes amigáveis para exibição
  const currentSkin = SKIN_COLORS.find((s) => s.hex === appearance.skinColor) || SKIN_COLORS[1];
  const currentHair = HAIR_STYLES.find((h) => h.id === appearance.hairStyle) || HAIR_STYLES[0];
  const currentHairColor = HAIR_COLORS.find((c) => c.hex === appearance.hairColor) || HAIR_COLORS[0];
  const currentEye = EYE_STYLES.find((e) => e.id === appearance.eyes) || EYE_STYLES[0];
  const currentMouth = MOUTH_STYLES.find((m) => m.id === appearance.mouth) || MOUTH_STYLES[0];
  const currentScar = SCAR_STYLES.find((s) => s.id === appearance.scar) || SCAR_STYLES[0];
  const currentHat = HAT_STYLES.find((h) => h.id === appearance.hat) || HAT_STYLES[0];
  const currentOutfit = OUTFIT_STYLES.find((o) => o.id === appearance.outfit) || OUTFIT_STYLES[0];
  const currentPants = PANTS_STYLES.find((p) => p.id === (appearance.pants ?? 'bermuda_jeans')) || PANTS_STYLES[1];
  const currentShoes = SHOES_STYLES.find((s) => s.id === (appearance.shoes ?? 'sandalias_simples')) || SHOES_STYLES[1];
  const currentOutfitColor = OUTFIT_COLORS.find((c) => c.hex === appearance.outfitColor) || OUTFIT_COLORS[0];

  return (
    <div className="w-full max-w-6xl mx-auto my-auto p-4 md:p-6 lg:p-8 animate-fade-in space-y-6">
      
      {/* Cabeçalho */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl md:text-4xl font-black text-amber-200 uppercase font-serif tracking-wide">
          Criação de Pirata
        </h1>
        <p className="text-xs md:text-sm text-slate-300">
          Personalize a aparência do seu capitão e parta para os mares do East Blue.
        </p>
      </div>

      {/* Grid Principal: Corpo Inteiro (Esquerda) + Painel de Seleção (Direita) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch w-full mx-auto">
        
        {/* ========================================================= */}
        {/* COLUNA ESQUERDA: CARD DO PERSONAGEM EM CORPO INTEIRO      */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col h-full">
          <div className="w-full flex-1 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 p-4 md:p-5 rounded-3xl border-2 border-amber-900/60 shadow-2xl relative flex flex-col justify-between">
            
            {/* Barra Superior do Card com Título e Botão Aleatório */}
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 z-20">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest font-serif">
                  Prévia do Pirata
                </span>
              </div>
              <button
                type="button"
                onClick={handleRandomize}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 flex items-center space-x-1.5 cursor-pointer border border-amber-300/40"
                title="Sortear Visual Aleatório"
              >
                <Dices className="w-4 h-4" />
                <span>Aleatório</span>
              </button>
            </div>

            {/* Cenário da Praia Inicial & Pirata em Escala Imponente */}
            <div className="relative w-full flex-1 min-h-[460px] md:min-h-[520px] lg:min-h-[560px] rounded-2xl overflow-hidden flex items-center justify-center border border-amber-950/60 shadow-inner group">
              
              {/* Cenário de Fundo: Praia Inicial do East Blue */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src="/cenarios/praia_inicio.jpg"
                  alt="Cenário Praia Inicial"
                  className="w-full h-full object-cover object-center transform scale-105"
                />
                {/* Vinheta suave de integração */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/30 pointer-events-none" />
              </div>

              {/* Componente PirateAvatar em Escala Imponente */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-2 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
                <PirateAvatar
                  appearance={appearance}
                  bustOnly={false}
                  className="w-full h-full max-h-[550px] object-contain transition-all duration-150"
                />
              </div>
            </div>

            {/* Pedestal / Legenda do Personagem */}
            <div className="w-full text-center py-2.5 mt-2 bg-slate-950/90 border border-slate-800/80 rounded-2xl shadow">
              <p className="text-base font-black text-amber-300 font-serif tracking-wide truncate px-3">
                {name.trim() || 'Aspirante a Pirata'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                Nível 1 • East Blue
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUNA DIREITA: PAINEL DE PERSONALIZAÇÃO REAL             */}
        {/* ========================================================= */}
        <div className="w-full h-full bg-slate-950/90 border-2 border-amber-900/60 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-amber-200 uppercase font-serif tracking-wide flex items-center space-x-2">
                <span>Personalização do Pirata</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Escolha o acessório inicial da sua tripulação e defina o nome do seu capitão.
              </p>
            </div>

            {/* Customizações Ativas: Cabeça, Blusa / Colete, Calça e Calçados */}
            <div className="space-y-3">
              {/* 1. Cabeça (Cabelos, Chapéus e Bandanas) */}
              <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-md">
                <span className="text-slate-200 font-bold text-sm">Cabeça</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.hat, HAT_STYLES, -1, 'hat')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="w-44 text-center font-bold text-amber-300 text-sm truncate">
                    {currentHat.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.hat, HAT_STYLES, 1, 'hat')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Próximo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Blusa / Colete */}
              <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-md">
                <span className="text-slate-200 font-bold text-sm">Blusa / Colete</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.outfit, OUTFIT_STYLES, -1, 'outfit')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="w-44 text-center font-bold text-amber-300 text-sm truncate">
                    {currentOutfit.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.outfit, OUTFIT_STYLES, 1, 'outfit')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Próximo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3. Calça / Bermuda */}
              <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-md">
                <span className="text-slate-200 font-bold text-sm">Calça / Bermuda</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.pants ?? 'bermuda_jeans', PANTS_STYLES, -1, 'pants')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="w-44 text-center font-bold text-amber-300 text-sm truncate">
                    {currentPants.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.pants ?? 'bermuda_jeans', PANTS_STYLES, 1, 'pants')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Próximo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4. Calçados */}
              <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-md">
                <span className="text-slate-200 font-bold text-sm">Calçados</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.shoes ?? 'sandalias_simples', SHOES_STYLES, -1, 'shoes')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="w-44 text-center font-bold text-amber-300 text-sm truncate">
                    {currentShoes.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => cycleOption(appearance.shoes ?? 'sandalias_simples', SHOES_STYLES, 1, 'shoes')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition active:scale-95 cursor-pointer shadow"
                    title="Próximo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informação sobre os próximos sprites em produção */}
              <div className="p-3.5 bg-amber-950/20 border border-amber-900/30 rounded-2xl flex items-start space-x-3 text-amber-200/80">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  <span className="font-bold text-amber-300">Mais personalizações em breve:</span> Conforme você explorar as ilhas do East Blue, novos chapéus lendários, casacos e cicatrizes de combate serão forjados para a sua tripulação!
                </p>
              </div>
            </div>
          </div>

          {/* 3. Campo de Nome do Pirata & Botão Zarpar */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Nome do Pirata
              </label>
              <input
                type="text"
                placeholder="Digite o nome do seu capitão (ex: Monkey D. Luffy)"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                maxLength={20}
                className="w-full px-3.5 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-bold text-sm shadow-inner"
              />
              {errorMsg && <p className="text-xs text-red-400 font-bold">{errorMsg}</p>}
            </div>

            <div>
              <button
                type="button"
                onClick={handleCreate}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 border-2 border-amber-300 cursor-pointer"
              >
                <span>⚓ AVANÇAR & ZARPAR</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                💡 Você receberá <span className="text-amber-400 font-bold">5 pontos livres</span> para distribuir no painel de Status.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
