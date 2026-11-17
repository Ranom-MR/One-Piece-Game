'use client';

import React from 'react';

export interface DevilFruitFxLayerProps {
  fruitId?: string | null;
  isAttacking?: boolean;
  isHit?: boolean;
  isMirrored?: boolean;
  className?: string;
}

/**
 * Camada dedicada de Efeitos Visuais (VFX) de Akuma no Mi (`devil-fruit-fx-layer`)
 * Renderização refinada em CSS puro, gradientes orgânicos e formas vetoriais SVG
 * estritamente alinhada com as 13 Frutas Oficiais das 4 Categorias:
 *
 * COMUM:
 * - Suke Suke: Personagem translúcido (efeito fantasma limpo com opacidade reduzida no sprite, sem efeitos secundários)
 * - Bane Bane: Molas metálicas grossas vetoriais nas canelas (efeito mecânico de alta compressão)
 * - Noro Noro: Anéis roxos suaves ao redor
 *
 * RARA:
 * - Doru Doru: Brilho de cera endurecida e blindagem protetora tão resistente quanto aço (+10% Resistência)
 * - Neko Neko: Pintura/estampa de leopardo orgânica no sprite
 * - Ushi Ushi: Aura terrosa robusta de vigor e contorno sutil de chifres
 *
 * ÉPICA:
 * - Gomu Gomu: Efeito visual fluído de estiramento nos braços ao atacar
 * - Moku Moku: Fumaça suave contornando o corpo
 * - Suna Suna: Vórtice suave de areia dourada fluindo ao redor
 * - Bari Bari: Barreira redonda roxa translúcida em volta
 *
 * LENDÁRIA:
 * - Mera Mera: Partículas e chamas laranjas fluidas contornando o corpo
 * - Goro Goro: Raios e relâmpagos fluidos ao redor
 * - Pika Pika: Brilho de reflexo de luz e feixes luminosos ao atacar
 */

/**
 * Lista de Frutas com Efeitos Visuais (VFX) de Combate Ativos.
 * Temporariamente, todas as demais frutas do sistema tiveram seus efeitos visuais desativados,
 * mantendo estritamente ativas apenas:
 * - 'suke-suke' (Efeito de translucidez / fantasma no sprite do personagem)
 * - 'bari-bari' (Barreira redonda roxa translúcida com brilho protetor)
 */
export const ACTIVE_VFX_FRUITS: readonly string[] = ['suke-suke', 'bari-bari'];

export function DevilFruitFxLayer({
  fruitId,
  isAttacking = false,
  isHit = false,
  isMirrored = false,
  className = '',
}: DevilFruitFxLayerProps) {
  // Desativação global temporária: apenas as exceções ativas ('suke-suke' e 'bari-bari') são renderizadas
  if (!fruitId || !ACTIVE_VFX_FRUITS.includes(fruitId)) return null;

  return (
    <div
      className={`devil-fruit-fx-layer absolute inset-0 pointer-events-none select-none z-30 overflow-visible flex items-center justify-center ${className}`}
      data-fruit-id={fruitId}
      data-testid="devil-fruit-fx-layer"
    >
      {/* =================================================================== */}
      {/* 1. SUKE SUKE NO MI (COMUM: Efeito Limpo de Translucidez no Sprite)  */}
      {/* =================================================================== */}
      {/* A Suke Suke no Mi opera exclusivamente com o efeito visual limpo de */}
      {/* translucidez (opacidade reduzida/fantasma) no sprite do personagem, */}
      {/* sem auras, caustics, anéis ou efeitos secundários sobrepostos.     */}
      {fruitId === 'suke-suke' && null}

      {/* =================================================================== */}
      {/* 2. BANE BANE NO MI (COMUM: Molas Metálicas Grossas nas Canelas)    */}
      {/* =================================================================== */}
      {fruitId === 'bane-bane' && (
        <div className="absolute bottom-[14px] sm:bottom-[18px] inset-x-0 flex items-center justify-center pointer-events-none z-20">
          {/* Definições Compartilhadas de Gradientes Metálicos para Molas Grossas */}
          <svg width="0" height="0" className="absolute">
            <defs>
              {/* Gradiente Metálico com Iluminação Cilíndrica e Brilho Dourado/Aço */}
              <linearGradient id="baneMetallicCoil" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#52525b" />
                <stop offset="18%" stopColor="#f4f4f5" />
                <stop offset="42%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="88%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>

              {/* Destaque Especular Superior para Efeito 3D Tubular */}
              <linearGradient id="baneCoilShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fef08a" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Par de Molas Metálicas Estilizadas posicionadas exatamente nas Canelas/Pernas */}
          <div
            className={`relative flex items-center justify-center gap-7 sm:gap-9 transition-transform duration-150 origin-bottom ${
              isAttacking
                ? 'scale-y-[0.38] scale-x-120 duration-100'
                : 'animate-pulse'
            }`}
            style={{ animationDuration: '2.4s' }}
          >
            {/* Mola Canela Esquerda (Tubo Metálico Grosso de Compressão) */}
            <div className="relative transform rotate-[-2deg]">
              <svg
                width="32"
                height="62"
                viewBox="0 0 32 62"
                className="overflow-visible filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] drop-shadow-[0_0_8px_rgba(245,158,11,0.55)]"
              >
                {/* Anel de Fixação Superior no Joelho */}
                <ellipse
                  cx="16"
                  cy="6"
                  rx="13"
                  ry="4"
                  fill="none"
                  stroke="url(#baneMetallicCoil)"
                  strokeWidth="3.2"
                />

                {/* Corpo Helicoidal Grosso da Mola (Canela Esquerda) */}
                <path
                  d="M 4,7 C 4,1 28,1 28,7 C 28,13 4,13 4,19 C 4,25 28,25 28,31 C 28,37 4,37 4,43 C 4,49 28,49 28,55 C 28,60 16,61 10,60"
                  fill="none"
                  stroke="url(#baneMetallicCoil)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Filete de Destaque Tubular Especular */}
                <path
                  d="M 4,7 C 4,1 28,1 28,7 C 28,13 4,13 4,19 C 4,25 28,25 28,31 C 28,37 4,37 4,43 C 4,49 28,49 28,55"
                  fill="none"
                  stroke="url(#baneCoilShine)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="opacity-75"
                />

                {/* Anel de Fixação Inferior no Tornozelo */}
                <ellipse
                  cx="16"
                  cy="56"
                  rx="13"
                  ry="4"
                  fill="none"
                  stroke="url(#baneMetallicCoil)"
                  strokeWidth="3.2"
                />
              </svg>
            </div>

            {/* Mola Canela Direita (Tubo Metálico Grosso de Compressão Espelhado) */}
            <div className="relative transform rotate-[2deg]">
              <svg
                width="32"
                height="62"
                viewBox="0 0 32 62"
                className="overflow-visible filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] drop-shadow-[0_0_8px_rgba(245,158,11,0.55)]"
              >
                {/* Anel de Fixação Superior no Joelho */}
                <ellipse
                  cx="16"
                  cy="6"
                  rx="13"
                  ry="4"
                  fill="none"
                  stroke="url(#baneMetallicCoil)"
                  strokeWidth="3.2"
                />

                {/* Corpo Helicoidal Grosso da Mola (Canela Direita) */}
                <path
                  d="M 28,7 C 28,1 4,1 4,7 C 4,13 28,13 28,19 C 28,25 4,25 4,31 C 4,37 28,37 28,43 C 28,49 4,49 4,55 C 4,60 16,61 22,60"
                  fill="none"
                  stroke="url(#baneMetallicCoil)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Filete de Destaque Tubular Especular */}
                <path
                  d="M 28,7 C 28,1 4,1 4,7 C 4,13 28,13 28,19 C 28,25 4,25 4,31 C 4,37 28,37 28,43 C 28,49 4,49 4,55"
                  fill="none"
                  stroke="url(#baneCoilShine)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="opacity-75"
                />

                {/* Anel de Fixação Inferior no Tornozelo */}
                <ellipse
                  cx="16"
                  cy="56"
                  rx="13"
                  ry="4"
                  fill="none"
                  stroke="url(#baneMetallicCoil)"
                  strokeWidth="3.2"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. NORO NORO NO MI (COMUM: Anéis Roxos Suaves ao Redor)             */}
      {/* =================================================================== */}
      {fruitId === 'noro-noro' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Campo difuso suave em roxo/fuchsia */}
          <div
            className="absolute inset-[-6px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(192,132,252,0.25)_0%,_rgba(168,85,247,0.12)_50%,_transparent_75%)] blur-[7px] animate-pulse"
            style={{ animationDuration: '2.8s' }}
          />

          {/* Anéis roxos suaves concêntricos ao redor do corpo */}
          <div
            className="absolute w-36 h-36 border border-purple-400/50 rounded-full animate-ping opacity-35"
            style={{ animationDuration: '2.5s' }}
          />
          <div
            className="absolute w-28 h-28 border border-fuchsia-400/45 rounded-full animate-pulse opacity-45"
            style={{ animationDuration: '1.8s' }}
          />
          <div
            className="absolute w-20 h-20 border border-purple-300/30 rounded-full animate-ping opacity-25"
            style={{ animationDuration: '3.2s' }}
          />

          {/* Pequenas esferas de fótons suaves */}
          <div className="absolute top-10 right-6 w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc] animate-pulse" />
          <div
            className="absolute bottom-12 left-6 w-2 h-2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#e879f9] animate-pulse"
            style={{ animationDelay: '0.8s' }}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. DORU DORU NO MI (RARA: Blindagem e Brilho de Cera Tão Dura Quanto Aço) */}
      {/* =================================================================== */}
      {(fruitId === 'doru-doru' || fruitId === 'jiki-jiki') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
          {/* Varredura translúcida e suave de brilho de cera vitrificada/endurecida */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-50/25 to-transparent skew-x-[-22deg] animate-pulse opacity-70"
            style={{ animationDuration: '2.4s' }}
          />

          {/* Placas/camadas de cera branca endurecida protetora em curvas vetoriais SVG */}
          <svg
            className="absolute inset-0 w-full h-full text-amber-100/40 filter drop-shadow-[0_0_8px_rgba(254,243,199,0.7)]"
            viewBox="0 0 100 140"
            fill="none"
          >
            {/* Contornos defensivos de blindagem de cera (Candle Wall / Armor) */}
            <path
              d="M18,30 C30,22 70,22 82,30 C88,48 88,92 82,110 C70,118 30,118 18,110 C12,92 12,48 18,30 Z"
              stroke="#fef3c7"
              strokeWidth="1.8"
              strokeDasharray="6 3"
              className="opacity-50"
            />
            {/* Escudos de cera sobre os ombros e antebraços */}
            <path
              d="M14,45 C20,42 26,45 28,52 C26,62 18,65 14,58 Z"
              fill="#fffbeb"
              fillOpacity="0.25"
              stroke="#fef08a"
              strokeWidth="1.4"
            />
            <path
              d="M86,45 C80,42 74,45 72,52 C74,62 82,65 86,58 Z"
              fill="#fffbeb"
              fillOpacity="0.25"
              stroke="#fef08a"
              strokeWidth="1.4"
            />
          </svg>

          {/* Centelhas suaves de cera vitrificada / reflexos de blindagem */}
          <div className="absolute top-7 left-5 w-1.5 h-1.5 rounded-full bg-amber-100 shadow-[0_0_8px_#fef3c7] animate-pulse" />
          <div
            className="absolute bottom-9 right-5 w-1.5 h-1.5 rounded-full bg-yellow-50 shadow-[0_0_8px_#fef9c3] animate-pulse"
            style={{ animationDelay: '0.7s' }}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. NEKO NEKO NO MI (RARA: Estampa Orgânica de Leopardo no Sprite)   */}
      {/* =================================================================== */}
      {fruitId === 'neko-neko' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Padrão orgânico de rosetas/manchas de leopardo sobre o torso e membros */}
          <svg className="absolute inset-0 w-full h-full opacity-65 filter drop-shadow-[0_0_4px_rgba(180,83,9,0.5)]" viewBox="0 0 100 140" fill="none">
            {/* Rosetas de Leopardo Estilizadas (Anéis orgânicos com núcleo âmbar) */}
            <circle cx="34" cy="52" r="3.5" stroke="#78350f" strokeWidth="1.6" fill="#d97706" fillOpacity="0.4" />
            <circle cx="66" cy="56" r="3" stroke="#78350f" strokeWidth="1.5" fill="#d97706" fillOpacity="0.4" />
            <circle cx="48" cy="68" r="4" stroke="#78350f" strokeWidth="1.8" fill="#d97706" fillOpacity="0.45" />
            <circle cx="32" cy="85" r="3" stroke="#78350f" strokeWidth="1.5" fill="#d97706" fillOpacity="0.4" />
            <circle cx="64" cy="88" r="3.5" stroke="#78350f" strokeWidth="1.6" fill="#d97706" fillOpacity="0.4" />
            <circle cx="46" cy="102" r="2.8" stroke="#78350f" strokeWidth="1.4" fill="#d97706" fillOpacity="0.35" />
          </svg>

          {/* Aura felina suave dourada */}
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%)] blur-[4px]" />
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. USHI USHI NO MI (RARA: Aura Terrosa Robusta de Força Bruta)     */}
      {/* =================================================================== */}
      {fruitId === 'ushi-ushi' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Resplendor terroso de musculatura e couro pesado */}
          <div className="absolute inset-[-6px] rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(180,83,9,0.3)_0%,_rgba(120,53,15,0.15)_50%,_transparent_75%)] blur-[7px] animate-pulse" />

          {/* Contorno sutil de chifres de bisão/energia robusta em SVG */}
          <svg className="absolute -top-3 w-36 h-18 text-amber-500/50 filter drop-shadow-[0_0_8px_rgba(217,119,6,0.7)]" viewBox="0 0 100 50" fill="none">
            <path d="M15,35 Q25,8 42,16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M85,35 Q75,8 58,16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. GOMU GOMU NO MI (ÉPICA: Estiramento Fluído nos Braços ao Atacar) */}
      {/* =================================================================== */}
      {fruitId === 'gomu-gomu' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Efeito dinâmico de estiramento elástico projetado nos braços durante o ataque */}
          {isAttacking && (
            <svg
              className={`absolute top-1/3 w-36 h-14 ${isMirrored ? '-left-16 rotate-[-15deg]' : '-right-16 rotate-[15deg]'} text-rose-400 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.85)] animate-pulse`}
              viewBox="0 0 120 40"
              fill="none"
            >
              <defs>
                <linearGradient id="stretchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                  <stop offset="70%" stopColor="#fb7185" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffe4e6" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <path d="M5,20 C40,12 80,14 115,20" stroke="url(#stretchGrad)" strokeWidth="6" strokeLinecap="round" />
              <path d="M10,26 C45,20 75,22 110,26" stroke="url(#stretchGrad)" strokeWidth="3" strokeLinecap="round" className="opacity-70" />
            </svg>
          )}

          {/* Pluma de vapor leve estilo Gear e elasticidade */}
          <div className="absolute -top-4 left-6 w-6 h-16 bg-gradient-to-t from-rose-200/25 via-white/15 to-transparent rounded-full blur-[3px] animate-pulse" />
          <div className="absolute -top-5 right-6 w-6 h-16 bg-gradient-to-t from-rose-200/25 via-white/15 to-transparent rounded-full blur-[3px] animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. MOKU MOKU NO MI (ÉPICA: Fumaça Suave Contornando o Corpo)        */}
      {/* =================================================================== */}
      {fruitId === 'moku-moku' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Nuvens orgânicas de fumaça translúcida contornando o corpo */}
          <div className="absolute inset-[-8px] rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(241,245,249,0.3)_0%,_rgba(203,213,225,0.15)_50%,_transparent_75%)] blur-[9px] animate-pulse" style={{ animationDuration: '2.5s' }} />

          {/* Plumas fluidas de fumaça em SVG contornando as laterais */}
          <svg className="absolute inset-0 w-full h-full text-slate-100/40 filter drop-shadow-[0_0_8px_rgba(248,250,252,0.6)] animate-pulse" viewBox="0 0 100 140" fill="none">
            <path d="M18,120 C8,90 12,60 25,40 C18,30 22,15 35,10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-40" />
            <path d="M82,120 C92,90 88,60 75,40 C82,30 78,15 65,10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-40" />
          </svg>

          {/* Pequenos nós de fumaça ascendente suave */}
          <div className="absolute -top-6 left-1/3 w-8 h-8 rounded-full bg-white/20 blur-[5px] animate-pulse" />
          <div className="absolute -top-4 right-1/3 w-9 h-9 rounded-full bg-slate-100/20 blur-[5px] animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. SUNA SUNA NO MI (ÉPICA: Areia Dourada Fluindo ao Redor)          */}
      {/* =================================================================== */}
      {fruitId === 'suna-suna' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Vórtice suave de poeira e areia dourada */}
          <div className="absolute inset-[-6px] rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(217,119,6,0.3)_0%,_rgba(180,83,9,0.12)_50%,_transparent_75%)] blur-[7px] animate-pulse" />

          {/* Linhas de fluxo de areia árida em SVG */}
          <svg className="absolute inset-0 w-full h-full text-amber-400/50 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]" viewBox="0 0 100 140" fill="none">
            <path d="M15,90 Q50,75 85,90" stroke="currentColor" strokeWidth="2.2" strokeDasharray="5 3" />
            <path d="M20,110 Q50,125 80,110" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 4" />
          </svg>

          {/* Grãos de areia cintilantes puramente CSS */}
          <div className="absolute bottom-6 left-5 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fbbf24] animate-pulse" />
          <div className="absolute bottom-8 right-6 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-3 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. BARI BARI NO MI (ÉPICA: Barreira Redonda Roxa Translúcida)      */}
      {/* =================================================================== */}
      {fruitId === 'bari-bari' && (
        <div className="absolute inset-[-12px] flex items-center justify-center pointer-events-none">
          {/* Cúpula / Barreira esférica protetora translúcida em volta do lutador */}
          <div className="w-full h-full rounded-full border-2 border-purple-400/70 bg-purple-600/10 shadow-[0_0_22px_rgba(168,85,247,0.5)] backdrop-blur-[0.5px] animate-pulse flex items-center justify-center">
            {/* Anel interno de reforço estrutural da barreira */}
            <div className="w-[85%] h-[85%] rounded-full border border-fuchsia-300/30 opacity-60" />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. MERA MERA NO MI (LENDÁRIA: Partículas e Chamas Laranjas Vivas)  */}
      {/* =================================================================== */}
      {fruitId === 'mera-mera' && (
        <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
          {/* Resplendor e calor térmico envolvente */}
          <div
            className="absolute inset-[-12px] rounded-3xl bg-[radial-gradient(ellipse_at_bottom,_rgba(249,115,22,0.4)_0%,_rgba(239,68,68,0.2)_45%,_transparent_75%)] blur-[9px] animate-pulse"
            style={{ animationDuration: '1.8s' }}
          />

          {/* Formas vetoriais orgânicas de línguas de fogo ascendentes (esquerda e direita) */}
          <svg
            className="absolute -bottom-3 -left-5 w-14 h-32 filter drop-shadow-[0_0_12px_rgba(249,115,22,0.95)] animate-pulse"
            viewBox="0 0 36 72"
            fill="none"
          >
            <defs>
              <linearGradient id="flameLeftGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.75" />
              </linearGradient>
            </defs>
            <path
              d="M18,72 C4,56 0,38 8,24 C10,32 14,35 12,20 C18,30 22,40 18,52 C22,44 26,38 24,28 C30,42 28,58 18,72 Z"
              fill="url(#flameLeftGrad)"
            />
          </svg>

          <svg
            className="absolute -bottom-3 -right-5 w-14 h-32 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.95)] animate-pulse"
            style={{ animationDelay: '0.45s' }}
            viewBox="0 0 36 72"
            fill="none"
          >
            <defs>
              <linearGradient id="flameRightGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#fde047" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M18,72 C32,56 36,38 28,24 C26,32 22,35 24,20 C18,30 14,40 18,52 C14,44 10,38 12,28 C6,42 8,58 18,72 Z"
              fill="url(#flameRightGrad)"
            />
          </svg>

          {/* Brasas e partículas térmicas incandescentes puramente CSS */}
          <div
            className="absolute top-2 left-6 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_#f59e0b] animate-bounce"
            style={{ animationDuration: '2s' }}
          />
          <div
            className="absolute -top-3 right-8 w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_12px_#ea580c] animate-bounce"
            style={{ animationDuration: '2.4s', animationDelay: '0.6s' }}
          />
          <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_8px_#fde047] animate-pulse" />
        </div>
      )}

      {/* =================================================================== */}
      {/* 12. GORO GORO NO MI (LENDÁRIA: Raios e Relâmpagos Fluidos)          */}
      {/* =================================================================== */}
      {fruitId === 'goro-goro' && (
        <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
          {/* Campo de plasma elétrico de alta voltagem */}
          <div
            className="absolute inset-[-12px] rounded-3xl bg-[radial-gradient(circle,_rgba(6,182,212,0.35)_0%,_rgba(56,189,248,0.18)_45%,_transparent_75%)] blur-[9px] animate-pulse"
            style={{ animationDuration: '1.2s' }}
          />

          {/* Arcos voltaicos de relâmpago em SVG (esquerda e direita) */}
          <svg
            className="absolute -top-5 -left-6 w-18 h-30 text-cyan-300 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.95)] animate-pulse"
            viewBox="0 0 36 68"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20,2 6,24 18,24 10,50 30,22 18,22 26,2" />
          </svg>

          <svg
            className="absolute -bottom-3 -right-6 w-18 h-30 text-sky-200 filter drop-shadow-[0_0_12px_rgba(56,189,248,0.95)] animate-pulse"
            style={{ animationDelay: '0.35s' }}
            viewBox="0 0 36 68"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16,2 30,24 18,24 26,50 6,22 18,22 10,2" />
          </svg>

          {/* Nódulos de descarga elétrica concentrada */}
          <div
            className="absolute -top-3 right-6 w-2.5 h-2.5 rounded-full bg-cyan-100 shadow-[0_0_14px_#38bdf8] animate-ping"
            style={{ animationDuration: '1s' }}
          />
          <div
            className="absolute bottom-3 left-5 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_#06b6d4] animate-ping"
            style={{ animationDuration: '1.4s', animationDelay: '0.5s' }}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 13. PIKA PIKA NO MI (LENDÁRIA: Brilho de Reflexo de Luz ao Atacar) */}
      {/* =================================================================== */}
      {fruitId === 'pika-pika' && (
        <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
          {/* Feixe e reflexo radiante de luz ótica (ampliado no ataque) */}
          <div
            className={`absolute inset-[-14px] rounded-full bg-[radial-gradient(circle,_rgba(253,224,71,0.45)_0%,_rgba(250,204,21,0.2)_45%,_transparent_75%)] blur-[9px] ${
              isAttacking ? 'scale-125 opacity-100' : 'opacity-60 animate-pulse'
            }`}
          />

          {/* Estrela de luz / flash óptico de feixes de laser em SVG */}
          <svg
            className={`absolute ${isAttacking ? 'scale-125' : 'scale-90 animate-pulse'} w-32 h-32 text-yellow-300 filter drop-shadow-[0_0_14px_rgba(250,204,21,0.95)] transition-transform duration-150`}
            viewBox="0 0 100 100"
            fill="none"
          >
            {/* Feixes cardeais principais */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* Feixes diagonais menores */}
            <line x1="20" y1="20" x2="80" y2="80" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
            {/* Núcleo de luz pura */}
            <circle cx="50" cy="50" r="6" fill="#ffffff" />
          </svg>

          {/* Partículas de fótons reflexivos de alta velocidade */}
          <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fde047] animate-ping" />
          <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_10px_#facc15] animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
      )}
    </div>
  );
}

export default DevilFruitFxLayer;
