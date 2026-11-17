'use client';

import React from 'react';
import { PirateAppearance } from '@/types/player';
import { DEFAULT_APPEARANCE } from '@/data/appearanceOptions';
import { DevilFruitFxLayer } from './combat/DevilFruitFxLayer';

export interface PirateAvatarProps {
  appearance?: Partial<PirateAppearance>;
  bustOnly?: boolean;
  overrideHat?: string;
  overrideOutfit?: string;
  overridePants?: string;
  overrideShoes?: string;
  overrideOutfitColor?: string;
  fruitId?: string | null;
  className?: string;
  size?: number | string;
  showBackground?: boolean;
}

/**
 * Retorna o caminho do sprite PNG real para a cabeça (cabelos, bandanas ou chapéus)
 */
function getHatSpritePath(hatId?: string): string | null {
  switch (hatId) {
    case 'cabelo_curto_baguncado':
      return '/sprites/chapeus/cabelo_curto_baguncado.png';
    case 'cabelo_curto_espetado_zoro':
    case 'cabelo_curto_espetado': // Fallback alias
      return '/sprites/chapeus/cabelo_curto_espetado_zoro.png';
    case 'bandana_preta':
      return '/sprites/chapeus/bandana_preta.png';
    case 'bandana_vermelha':
    case 'bandana': // Fallback para compatibilidade com saves legados
      return '/sprites/chapeus/bandana_vermelha.png';
    case 'bandana_listrada':
      return '/sprites/chapeus/bandana_listrada.png';
    case 'none':
    default:
      return null;
  }
}

/**
 * Retorna o caminho do sprite PNG real para a blusa/colete selecionado
 */
function getOutfitSpritePath(outfitId?: string): string | null {
  switch (outfitId) {
    case 'colete_vermelho':
    case 'vest': // Fallback para compatibilidade com saves legados
      return '/sprites/blusas/colete_vermelho.png';
    case 'camisa_linho':
    case 'camisa_pirata_linho':
      return '/sprites/blusas/camisa_pirata_linho.png';
    case 'camisa_listrada':
    case 'striped': // Fallback para compatibilidade com saves legados
      return '/sprites/blusas/camisa_listrada.png';
    case 'none':
    default:
      return null;
  }
}

/**
 * Retorna o caminho do sprite PNG real para a calça/bermuda selecionada
 */
function getPantsSpritePath(pantsId?: string): string | null {
  switch (pantsId) {
    case 'bermuda_preta':
      return '/sprites/calcas/bermuda_preta.png';
    case 'bermuda_jeans':
      return '/sprites/calcas/bermuda_jeans.png';
    case 'calca_preta':
      return '/sprites/calcas/calca_preta.png';
    case 'none':
    default:
      return null;
  }
}

/**
 * Retorna o caminho do sprite PNG real para o calçado selecionado
 */
function getShoesSpritePath(shoesId?: string): string | null {
  switch (shoesId) {
    case 'sandalias_simples':
      return '/sprites/calcados/sandalias_simples.png';
    case 'botas_zoro':
    case 'botas_pretas':
      return '/sprites/calcados/botas_zoro.png';
    case 'none':
    default:
      return null;
  }
}

export function PirateAvatar({
  appearance,
  bustOnly = false,
  overrideHat,
  overrideOutfit,
  overridePants,
  overrideShoes,
  fruitId,
  className = '',
  size,
  showBackground = false,
}: PirateAvatarProps) {
  const merged: PirateAppearance = {
    ...DEFAULT_APPEARANCE,
    ...(appearance || {}),
  };

  const isFemale = merged.gender === 'female';
  const isSukeSuke = fruitId === 'suke-suke';
  const hat = overrideHat ?? merged.hat ?? 'bandana_vermelha';
  const outfit = overrideOutfit ?? merged.outfit ?? 'colete_vermelho';
  const pants = overridePants ?? merged.pants ?? 'bermuda_jeans';
  const shoes = overrideShoes ?? merged.shoes ?? 'sandalias_simples';

  // Camada 0: Corpo Base (Male ou Female com fallback seguro)
  const baseSpriteSrc = isFemale
    ? '/sprites/base/pirata_base_f.png'
    : '/sprites/base/pirata_base_m.png';

  // Camada 1: Calçados Real em PNG (z-[5], acima da base, abaixo das calças)
  const shoesSpriteSrc = getShoesSpritePath(shoes);

  // Camada 2: Calça / Bermuda Real em PNG (z-10, acima dos calçados, abaixo da blusa)
  const pantsSpriteSrc = getPantsSpritePath(pants);

  // Camada 3: Blusa / Colete Real em PNG (z-20, cobre o cós da calça)
  const outfitSpriteSrc = getOutfitSpritePath(outfit);

  // Camada 4: Chapéu / Bandana Real em PNG (z-30)
  const hatSpriteSrc = getHatSpritePath(hat);

  const handleBaseError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target.src.endsWith('pirata_base_m.png')) {
      target.src = '/sprites/base/pirata_base_m.png';
    }
  };

  const dimensionStyles = size
    ? {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }
    : undefined;

  return (
    <div
      className={`relative select-none ${bustOnly ? 'overflow-hidden' : ''} ${className}`}
      style={dimensionStyles}
    >
      {/* Fundo opcional */}
      {showBackground && !bustOnly && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-slate-800/40 via-slate-900/60 to-slate-950/80 -z-10 pointer-events-none border border-slate-700/30" />
      )}

      {/* Sombra suave no solo para o corpo inteiro */}
      {!bustOnly && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/5 h-3 bg-black/40 rounded-full blur-[3px] pointer-events-none z-0" />
      )}

      {/* Container das Camadas (Paper-Doll Stack) com zoom focado no busto quando bustOnly=true */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          bustOnly ? 'transform scale-[1.7] origin-[50%_14%]' : ''
        } ${isSukeSuke ? 'opacity-40 transition-opacity duration-300' : ''}`}
      >
        {/* Camada 0: Imagem do Corpo Base */}
        <img
          src={baseSpriteSrc}
          alt="Corpo Base"
          onError={handleBaseError}
          draggable={false}
          className={`${
            bustOnly
              ? 'w-full h-full object-cover object-top'
              : 'w-full h-full object-contain object-center'
          } pointer-events-none select-none relative z-0 [filter:drop-shadow(0px_0px_1.5px_rgba(20,20,20,0.85))]`}
        />

        {/* Camada 1: Calçados em PNG Real Transparente (z-[5], acima da base z-0, abaixo das calças z-10) */}
        {shoesSpriteSrc && (
          <img
            src={shoesSpriteSrc}
            alt="Calçados"
            draggable={false}
            className={`absolute inset-0 w-full h-full pointer-events-none select-none z-[5] ${
              bustOnly
                ? 'object-cover object-top'
                : 'object-contain object-center'
            } [filter:drop-shadow(0px_0px_1.5px_rgba(20,20,20,0.85))]`}
          />
        )}

        {/* Camada 2: Calça / Bermuda em PNG Real Transparente (z-10, acima dos calçados para cobrir o cano das botas e abaixo da blusa z-20) */}
        {pantsSpriteSrc && (
          <img
            src={pantsSpriteSrc}
            alt="Calça / Bermuda"
            draggable={false}
            className={`absolute inset-0 w-full h-full pointer-events-none select-none z-10 ${
              bustOnly
                ? 'object-cover object-top'
                : 'object-contain object-center'
            } [filter:drop-shadow(0px_0px_1.5px_rgba(20,20,20,0.85))]`}
          />
        )}

        {/* Camada 3: Blusa / Colete em PNG Real Transparente (z-20, cobre o cós da calça) */}
        {outfitSpriteSrc && (
          <img
            src={outfitSpriteSrc}
            alt="Blusa / Colete"
            draggable={false}
            className={`absolute inset-0 w-full h-full pointer-events-none select-none z-20 ${
              bustOnly
                ? 'object-cover object-top'
                : 'object-contain object-center'
            } [filter:drop-shadow(0px_0px_1.5px_rgba(20,20,20,0.85))]`}
          />
        )}

        {/* Camada 4: Cabeça (Cabelos, Chapéus e Bandanas) em PNG Real Transparente (z-30) */}
        {hatSpriteSrc && (
          <img
            src={hatSpriteSrc}
            alt="Cabeça"
            draggable={false}
            className={`absolute inset-0 w-full h-full pointer-events-none select-none z-30 ${
              bustOnly
                ? 'object-cover object-top'
                : 'object-contain object-center'
            } [filter:drop-shadow(0px_0px_1.5px_rgba(20,20,20,0.85))]`}
          />
        )}

        {/* Camada 5: Efeitos Visuais de Akuma no Mi (VFX) */}
        {fruitId && <DevilFruitFxLayer fruitId={fruitId} />}
      </div>
    </div>
  );
}
