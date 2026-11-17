'use client';

import React from 'react';
import { Player } from '@/types/player';
import { PirateAvatar } from '@/components/PirateAvatar';

export interface WantedPosterProps {
  player: Player;
  className?: string;
}

/**
 * Retorna as propriedades tipográficas dinâmicas para o Nome do Pirata
 * baseadas no comprimento do texto para garantir máximo impacto visual,
 * comprimindo horizontalmente via scaleX para nomes longos (estilo condensado anime)
 * sem cortes por reticências ou quebra de linha.
 */
function getNameTypography(name: string) {
  const len = name.trim().length;

  if (len <= 6) {
    // Nomes curtos (ex: LUFFY, ZORO, NAMI, USOPP) -> Máximo impacto visual, sem compressão
    return {
      fontSize: 'clamp(28px, 11.5cqw, 54px)',
      scaleX: 1.0,
      letterSpacing: '0.10em',
    };
  }
  if (len <= 10) {
    // Nomes médios-curtos (ex: SANJI, ROBIN, FRANKY, SHANKS)
    return {
      fontSize: 'clamp(26px, 10.2cqw, 48px)',
      scaleX: 0.95,
      letterSpacing: '0.07em',
    };
  }
  if (len <= 14) {
    // Nomes médios (ex: RORONOA ZORO, PORTGAS D. ACE)
    return {
      fontSize: 'clamp(24px, 9.2cqw, 42px)',
      scaleX: 0.88,
      letterSpacing: '0.04em',
    };
  }
  if (len <= 18) {
    // Nomes longos (ex: Benjamin D. Ahola, MONKEY D. LUFFY, TRAFALGAR LAW)
    // Mantém altura generosa (8.4cqw) com compressão horizontal suave (0.78),
    // produzindo o estilo condensado clássico dos cartazes originais de One Piece.
    return {
      fontSize: 'clamp(22px, 8.4cqw, 38px)',
      scaleX: 0.78,
      letterSpacing: '0.02em',
    };
  }
  if (len <= 23) {
    // Nomes muito longos (ex: DONQUIXOTE DOFLAMINGO, CHARLOTTE KATAKURI)
    return {
      fontSize: 'clamp(20px, 7.6cqw, 34px)',
      scaleX: 0.68,
      letterSpacing: '0.01em',
    };
  }
  if (len <= 28) {
    // Nomes hiperlongos (ex: EDWARD NEWGATE WHITEBEARD)
    return {
      fontSize: 'clamp(18px, 6.8cqw, 30px)',
      scaleX: 0.60,
      letterSpacing: '0em',
    };
  }
  // Excepcionais (> 28 caracteres)
  return {
    fontSize: 'clamp(16px, 6.0cqw, 26px)',
    scaleX: Math.max(0.48, 0.60 * (28 / len)),
    letterSpacing: '-0.01em',
  };
}

/**
 * Retorna as propriedades tipográficas dinâmicas para o Valor da Recompensa (Bounty)
 * alinhado após o símbolo de Berries (฿), mantendo escala imponente e compressão horizontal
 * para acomodar valores elevados e bilionários sem quebras ou truncamento.
 */
function getBountyTypography(bountyFormatted: string) {
  const len = bountyFormatted.trim().length;

  if (len <= 8) {
    // Bounties curtos (ex: 0 -, 30.000 -, 9.700.000 -)
    return {
      fontSize: 'clamp(24px, 8.8cqw, 42px)',
      scaleX: 1.0,
      letterSpacing: '0.12em',
    };
  }
  if (len <= 12) {
    // Bounties médios (ex: 30.000.000 -, 99.000.000 -)
    return {
      fontSize: 'clamp(23px, 8.4cqw, 40px)',
      scaleX: 0.94,
      letterSpacing: '0.08em',
    };
  }
  if (len <= 15) {
    // Bounties altos / 9-10 dígitos (ex: 100.000.000 -, 1.500.000.000 -)
    return {
      fontSize: 'clamp(21px, 7.8cqw, 36px)',
      scaleX: 0.85,
      letterSpacing: '0.05em',
    };
  }
  if (len <= 18) {
    // Bounties lendários (ex: 4.048.900.000 -, 10.000.000.000 -)
    return {
      fontSize: 'clamp(19px, 7.2cqw, 32px)',
      scaleX: 0.78,
      letterSpacing: '0.03em',
    };
  }
  // Bounties hiper-lendários / ilimitados (> 100 bilhões)
  return {
    fontSize: 'clamp(17px, 6.4cqw, 28px)',
    scaleX: 0.70,
    letterSpacing: '0.02em',
  };
}

/**
 * Componente oficial do Cartaz de Procurado (Wanted Poster)
 * Renderiza o template de alta definição oficial de One Piece (public/assets/wanted_template.png)
 * com posicionamento absoluto para o retrato do pirata, nome e recompensa em Berries,
 * com tipografia de alto impacto, compressão horizontal dinâmica e sem corte por reticências.
 */
export const WantedPoster: React.FC<WantedPosterProps> = ({ player, className = '' }) => {
  const bountyFormatted = `${player.bounty > 0 ? player.bounty.toLocaleString('pt-BR') : '0'} -`;
  const nameTypography = getNameTypography(player.name || 'PIRATA');
  const bountyTypography = getBountyTypography(bountyFormatted);

  return (
    <div
      className={`relative w-full max-w-[460px] mx-auto aspect-[540/779] select-none rounded-2xl shadow-2xl overflow-hidden bg-contain bg-no-repeat bg-center ${className}`}
      style={{
        backgroundImage: "url('/assets/wanted_template.png')",
        backgroundSize: '100% 100%',
        containerType: 'inline-size' as any,
      }}
    >
      {/* 1. MOLDURA RETANGULAR PRETA: SPRITE DO PERSONAGEM (LUFFY / PLAYER) */}
      <div
        className="absolute overflow-hidden bg-[#1b1008] flex items-center justify-center shadow-inner"
        style={{
          left: '8.15%',
          top: '19.51%',
          width: '82.78%',
          height: '42.75%',
        }}
      >
        {/* Cenário de Fundo: Praia Inicial com acabamento vintage sépia */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src="/cenarios/praia_inicio.jpg"
            alt="Cenário Praia"
            className="w-full h-full object-cover object-center filter sepia-[0.4] brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-[#3b220e]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1008] via-transparent to-[#1b1008]/40" />
        </div>

        {/* Sprite do Pirata (Retrato / Busto) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <PirateAvatar
            appearance={player.appearance}
            bustOnly={true}
            fruitId={player.equippedFruitId}
            className="w-full h-full object-cover transform scale-105"
          />
        </div>

        {/* Vinheta interna de borda escura para integração perfeita com o template */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.85)] z-20" />
      </div>

      {/* Camada de sobreposição do template para corte exato das bordas do papel envelhecido */}
      <div
        className="absolute inset-0 pointer-events-none z-10 bg-contain bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/assets/wanted_template.png')",
          backgroundSize: '100% 100%',
        }}
      />

      {/* 2. NOME DO JOGADOR (CENTRALIZADO NA ÁREA EM BRANCO ABAIXO DE DEAD OR ALIVE) */}
      <div
        className="absolute z-20 flex items-center justify-center text-center"
        style={{
          left: '5.5%',
          top: '70.60%',
          width: '89%',
          height: '12.84%',
        }}
      >
        <h3
          className="font-black font-serif text-[#140b05] uppercase select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] whitespace-nowrap leading-none inline-block origin-center"
          style={{
            fontSize: nameTypography.fontSize,
            letterSpacing: nameTypography.letterSpacing,
            transform: `scaleX(${nameTypography.scaleX})`,
          }}
        >
          {player.name}
        </h3>
      </div>

      {/* 3. VALOR DA RECOMPENSA FORMATADO (LOGO APÓS O SÍMBOLO DE BERRIES ฿ NA LINHA INFERIOR) */}
      <div
        className="absolute z-20 flex items-center select-none"
        style={{
          left: '15.56%',
          top: '83.57%',
          width: '78.5%',
          height: '6.80%',
        }}
      >
        <span
          className="font-black font-serif text-[#140b05] drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)] whitespace-nowrap leading-none inline-block origin-left"
          style={{
            fontSize: bountyTypography.fontSize,
            letterSpacing: bountyTypography.letterSpacing,
            transform: `scaleX(${bountyTypography.scaleX})`,
          }}
        >
          {bountyFormatted}
        </span>
      </div>
    </div>
  );
};

export default WantedPoster;
