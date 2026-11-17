import React, { useState } from 'react';
import { Player, ActiveTraining } from '@/types/player';
import { PirateAvatar } from '@/components/PirateAvatar';
import { TrainingDummy } from './TrainingDummy';
import { Dumbbell, Zap, Swords, Shield, Sparkles } from 'lucide-react';

interface DojoArenaProps {
  player: Player;
  activeTraining: ActiveTraining;
  remainingSeconds: number;
  progressPercentage: number;
  onCompleteDev?: () => void;
  formatTime: (totalSeconds: number) => string;
}

export function DojoArena({
  player,
  activeTraining,
  remainingSeconds,
  progressPercentage,
  onCompleteDev,
  formatTime,
}: DojoArenaProps) {
  const [dummyLoaded, setDummyLoaded] = useState(false);
  const [dummyImgFailed, setDummyImgFailed] = useState(false);

  // Configurações temáticas de cada tipo de treinamento
  const getTrainingMeta = () => {
    switch (activeTraining.attribute) {
      case 'strength':
        return {
          icon: <Swords className="w-4 h-4 text-amber-400" />,
          title: 'Treino de Força Física',
          actionText: 'Desferindo sequências de socos pesados e golpes no tronco de carvalho!',
          impactColor: 'text-amber-400',
          badgeBg: 'bg-amber-950/60 border-amber-800/70 text-amber-300',
          sparkEmoji: '💥',
        };
      case 'fruitPower':
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          title: 'Treino de Poder de Akuma no Mi',
          actionText: 'Canalizando energia sobrenatural e dominando as técnicas da fruta!',
          impactColor: 'text-purple-400',
          badgeBg: 'bg-purple-950/60 border-purple-800/70 text-purple-300',
          sparkEmoji: '✨',
        };
      case 'agility':
        return {
          icon: <Zap className="w-4 h-4 text-emerald-400" />,
          title: 'Treino de Agilidade & Reflexos',
          actionText: 'Esquivando dos braços de madeira e aprimorando velocidade de reação!',
          impactColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-950/60 border-emerald-800/70 text-emerald-300',
          sparkEmoji: '⚡',
        };
      case 'resistance':
      default:
        return {
          icon: <Shield className="w-4 h-4 text-rose-400" />,
          title: 'Treino de Resistência & Vigor',
          actionText: 'Calejando os punhos e absorvendo impactos contínuos para elevar o HP!',
          impactColor: 'text-rose-400',
          badgeBg: 'bg-rose-950/60 border-rose-800/70 text-rose-300',
          sparkEmoji: '🛡️',
        };
    }
  };

  const meta = getTrainingMeta();

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* ========================================================= */}
      {/* 1. CAIXA DE CONTROLE: TIMER REGRESSIVO & PROGRESSO        */}
      {/* ========================================================= */}
      <div className="p-5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 rounded-3xl border-2 border-amber-500/50 shadow-2xl space-y-3.5 relative overflow-hidden">
        {/* Efeito de luz dourada de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Treinamento em Andamento
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border flex items-center space-x-1 ${meta.badgeBg}`}>
                  {meta.icon}
                  <span>{activeTraining.attributeName}</span>
                </span>
              </div>
              <p className="text-base font-black text-amber-200 mt-0.5">
                Ganho garantido: <span className="text-emerald-400">+1 Ponto</span> ao término da contagem
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-amber-800/80 shadow-inner">
              <span className="text-xs text-slate-400 font-semibold">Tempo Restante:</span>
              <span className="text-base font-mono font-black text-amber-400">
                ⏱️ {formatTime(remainingSeconds)}
              </span>
            </div>

            {onCompleteDev && (
              <button
                type="button"
                onClick={onCompleteDev}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow"
                title="Acelerar e concluir treino imediatamente (Modo Dev)"
              >
                ⏩ Concluir (Dev)
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progresso com Brilho */}
        <div className="space-y-1.5 relative z-10">
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-amber-900/60 p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-300 shadow-lg relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20" />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
            <span>Custo: <strong className="text-amber-400">5 Energia</strong> (Consumidos)</span>
            <span className="text-amber-300 font-bold">{progressPercentage.toFixed(1)}% concluído</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ARENA DE TREINAMENTO: CONVÉS DE TREINO DO NAVIO (RPG 2D) */}
      {/* ========================================================= */}
      <div
        className="w-full p-6 sm:p-8 rounded-3xl border-2 border-amber-600/40 shadow-2xl relative overflow-hidden flex flex-col items-center bg-slate-950 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cenario/conves_treino_vazio.png')" }}
      >
        {/* Camada escura translúcida para garantir contraste e destaque máximo dos sprites */}
        <div className="absolute inset-0 bg-black/30 backdrop-brightness-95 pointer-events-none" />

        {/* Gradiente sutil de vinheta superior e inferior para profundidade cinematográfica */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        {/* Banner Central com a Ação Atual do Treino */}
        <div className="w-full max-w-xl mx-auto mb-6 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-600/50 shadow-lg">
            <span className="text-sm">{meta.sparkEmoji}</span>
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif">
              {meta.title}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-200 mt-2 font-medium leading-relaxed italic drop-shadow-md">
            "{meta.actionText}"
          </p>
        </div>

        {/* Palco do Confronto de Treino: Pirata (Esquerda) vs Boneco (Direita) */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-6 items-center justify-items-center relative z-10 my-2">
          
          {/* LADO ESQUERDO: PIRATA EM POSE DE AÇÃO / ATAQUE (5 colunas) */}
          <div className="sm:col-span-5 w-full flex flex-col items-center justify-center">
            {/* Componente PirateAvatar com animação rítmica de ataque em direção ao boneco */}
            <div className="relative w-56 h-72 sm:w-60 sm:h-80 md:w-64 md:h-88 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center animate-dojo-pirate">
                <PirateAvatar
                  appearance={player.appearance}
                  bustOnly={false}
                  className="w-full h-full drop-shadow-xl"
                />
              </div>
              {/* Sombra de contato no piso */}
              <div className="absolute bottom-1 w-36 h-4 bg-black/60 rounded-full blur-sm -z-10" />
            </div>

            {/* Identificação do Pirata */}
            <div className="mt-2 text-center px-4 py-1 bg-slate-950/80 rounded-xl border border-amber-900/50 shadow">
              <span className="text-xs font-black text-amber-300 font-serif uppercase tracking-wide block truncate max-w-[180px]">
                {player.name}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block">
                Nível {player.level} • {player.title}
              </span>
            </div>
          </div>

          {/* CENTRO: EFEITO DE IMPACTO / FLASH SINCRONIZADO COM O ATAQUE (2 colunas) */}
          <div className="sm:col-span-2 w-full flex items-center justify-center my-2 sm:my-0 select-none pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Partícula de impacto animada: flash no ápice do golpe */}
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-lg animate-dojo-impact">
                <span className="text-xl select-none filter drop-shadow">
                  {meta.sparkEmoji}
                </span>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: BONECO DE TREINO / DUMMY COM REAÇÃO DE IMPACTO (5 colunas) */}
          <div className="sm:col-span-5 w-full flex flex-col items-center justify-center">
            {/* Sprite ou Componente do Boneco de Treino com oscilação e tremor sincronizados */}
            <div className="relative w-56 h-72 sm:w-60 sm:h-80 md:w-64 md:h-88 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center animate-dojo-dummy">
                {/* Fallback visual: exibido enquanto a imagem carrega ou em caso de falha de carregamento */}
                {(!dummyLoaded || dummyImgFailed) && (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      !dummyImgFailed ? 'absolute inset-0 opacity-80 animate-pulse' : ''
                    }`}
                  >
                    <TrainingDummy
                      isHit={true}
                      className="w-full h-full select-none"
                    />
                  </div>
                )}

                {/* Sprite real do Boneco de Treino em /cenario/boneco_treino.png */}
                {!dummyImgFailed && (
                  <img
                    src="/cenario/boneco_treino.png"
                    alt="Boneco de Treino"
                    loading="eager"
                    draggable={false}
                    onLoad={() => setDummyLoaded(true)}
                    onError={() => {
                      setDummyImgFailed(true);
                      setDummyLoaded(true);
                    }}
                    className={`w-full h-full object-contain object-bottom select-none transition-opacity duration-200 ${
                      dummyLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Identificação do Dummy */}
            <div className="mt-2 text-center px-4 py-1 bg-slate-950/80 rounded-xl border border-amber-900/50 shadow">
              <span className="text-xs font-black text-amber-400 font-serif uppercase tracking-wide block">
                Boneco de Carvalho Reforçado
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block">
                Alvo de Sparring do East Blue
              </span>
            </div>
          </div>

        </div>

        {/* Rodapé Orientativo */}
        <div className="w-full text-center pt-3.5 mt-4 border-t border-amber-900/40 relative z-10 bg-slate-950/60 backdrop-blur-sm rounded-2xl py-2 px-4 shadow">
          <p className="text-[11px] text-slate-300 flex items-center justify-center space-x-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
            <span>
              O Dojo permanece em sessão dedicada até o término do temporizador. Ao concluir, o atributo receberá o ponto permanente e os novos treinos serão liberados.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
