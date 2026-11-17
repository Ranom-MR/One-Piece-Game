import React from 'react';

interface TrainingDummyProps {
  className?: string;
  isHit?: boolean;
}

/**
 * Boneco de Treino (Dummy de Madeira) estilo anime com traços pretos marcantes de 2px,
 * cordas de cânhamo, alvo no peito e base de madeira reforçada para o Dojo.
 */
export function TrainingDummy({ className = '', isHit = false }: TrainingDummyProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 380"
        className={`w-full h-full transition-transform duration-150 ${
          isHit ? 'translate-x-1.5 rotate-1' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradientes da Madeira */}
          <linearGradient id="woodPost" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="35%" stopColor="#b45309" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="woodHead" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="60%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="ropeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>

          <linearGradient id="woodArm" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* BASE DE SUPORTE DE MADEIRA NO CHÃO                       */}
        {/* ========================================================= */}
        <ellipse cx="120" cy="355" rx="70" ry="16" fill="#1e130c" stroke="#0f0905" strokeWidth="2.5" />
        <ellipse cx="120" cy="350" rx="65" ry="14" fill="#78350f" stroke="#2c1407" strokeWidth="2.5" />
        <ellipse cx="120" cy="346" rx="55" ry="10" fill="#92400e" stroke="#2c1407" strokeWidth="2" />
        {/* Suportes diagonais de fixação */}
        <path d="M85 348 L110 310 L118 312 L95 352 Z" fill="#92400e" stroke="#2c1407" strokeWidth="2" />
        <path d="M155 348 L130 310 L122 312 L145 352 Z" fill="#78350f" stroke="#2c1407" strokeWidth="2" />

        {/* ========================================================= */}
        {/* POSTE PRINCIPAL DO CORPO (TRONCO)                         */}
        {/* ========================================================= */}
        <rect
          x="95"
          y="70"
          width="50"
          height="250"
          rx="12"
          fill="url(#woodPost)"
          stroke="#271306"
          strokeWidth="3"
        />

        {/* Veios da madeira e ranhuras de cortes de lâmina */}
        <path d="M106 85 C108 120 105 160 107 200" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        <path d="M132 95 C135 140 133 190 134 240" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        {/* Marcas de espadachim (cortes inclinados no tronco) */}
        <path d="M102 110 L125 125" stroke="#3b1d09" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M115 175 L138 190" stroke="#3b1d09" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M105 250 L130 268" stroke="#3b1d09" strokeWidth="2.5" strokeLinecap="round" />

        {/* ========================================================= */}
        {/* CABEÇA DE MADEIRA DO DUMMY                                */}
        {/* ========================================================= */}
        <ellipse cx="120" cy="55" rx="26" ry="32" fill="url(#woodHead)" stroke="#271306" strokeWidth="3" />
        {/* Faixa / Bandana amarrada na cabeça do boneco */}
        <path
          d="M96 52 C108 48 132 48 144 52 L143 64 C131 60 109 60 97 64 Z"
          fill="#dc2626"
          stroke="#271306"
          strokeWidth="2"
        />
        {/* Olhos de alvo em 'X' pintados no boneco */}
        <path d="M108 40 L116 48 M116 40 L108 48" stroke="#271306" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M124 40 L132 48 M132 40 L124 48" stroke="#271306" strokeWidth="2.5" strokeLinecap="round" />
        {/* Nó da bandana solto caindo para o lado */}
        <path d="M143 56 C152 58 158 68 155 76 C150 72 146 64 142 62 Z" fill="#b91c1c" stroke="#271306" strokeWidth="2" />

        {/* ========================================================= */}
        {/* BRAÇOS DE MADEIRA PROJETADOS (ESTILO WING CHUN / ANIME)   */}
        {/* ========================================================= */}
        {/* Braço Esquerdo (aponta em direção ao jogador) */}
        <path
          d="M96 140 L45 130 C40 129 38 135 42 139 L96 160 Z"
          fill="url(#woodArm)"
          stroke="#271306"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="44" cy="135" rx="5" ry="5" fill="#78350f" stroke="#271306" strokeWidth="2" />

        {/* Braço Central / Inferior (bloqueador frontal) */}
        <path
          d="M97 195 L50 205 C44 207 44 213 49 215 L98 215 Z"
          fill="url(#woodArm)"
          stroke="#271306"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="48" cy="210" rx="5" ry="5" fill="#78350f" stroke="#271306" strokeWidth="2" />

        {/* Braço Direito Superior (projetado para trás/diagonal) */}
        <path
          d="M144 142 L185 125 C190 123 192 129 188 133 L144 160 Z"
          fill="url(#woodArm)"
          stroke="#271306"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="187" cy="129" rx="5" ry="5" fill="#78350f" stroke="#271306" strokeWidth="2" />

        {/* ========================================================= */}
        {/* AMARRAÇÕES DE CORDA DE CÂNHAMO NO PEITO                   */}
        {/* ========================================================= */}
        {/* Faixa de Corda Superior */}
        <rect x="94" y="165" width="52" height="12" rx="4" fill="url(#ropeGrad)" stroke="#271306" strokeWidth="2" />
        <path d="M98 165 L104 177 M108 165 L114 177 M118 165 L124 177 M128 165 L134 177 M138 165 L144 177" stroke="#854d0e" strokeWidth="1.5" />

        {/* Alvo Redondo no Peito (Bullseye) */}
        <circle cx="120" cy="205" r="18" fill="#fef08a" stroke="#dc2626" strokeWidth="4" />
        <circle cx="120" cy="205" r="10" fill="#dc2626" stroke="#271306" strokeWidth="2" />
        <circle cx="120" cy="205" r="4" fill="#fef08a" />
        {/* Marcas de corte no alvo */}
        <path d="M110 198 L130 212" stroke="#271306" strokeWidth="2" strokeLinecap="round" />

        {/* Faixa de Corda Inferior */}
        <rect x="94" y="235" width="52" height="14" rx="4" fill="url(#ropeGrad)" stroke="#271306" strokeWidth="2" />
        <path d="M98 235 L104 249 M108 235 L114 249 M118 235 L124 249 M128 235 L134 249 M138 235 L144 249" stroke="#854d0e" strokeWidth="1.5" />

        {/* ========================================================= */}
        {/* PERNA / PILAR INFERIOR DO DUMMY                           */}
        {/* ========================================================= */}
        <path
          d="M96 285 L60 330 C56 334 62 338 66 334 L100 295 Z"
          fill="url(#woodArm)"
          stroke="#271306"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}
