import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, Clock3, Crown, RotateCcw, Trophy, UsersRound } from 'lucide-react';
import { AddParticipantsPanel } from './AddParticipantsPanel';
import { LiveAuditClock } from './LiveAuditClock';
import { RouletteWheel } from './RouletteWheel';
import { selectWinnerIndex } from '../utils/roulette';
import { Person } from '../types';
import { supabase } from '../lib/supabase';

interface RouletteHomeTabProps {
  roulettePeople: Person[];
  pendingPeople: Person[];
  onConfirmWinner: (id: string, drawnAt: string) => Promise<void>;
  onAddSelectedToRoulette: (ids: string[]) => Promise<void>;
  onAddMultiple: (names: string[], addToRoulette: boolean) => Promise<{ added: string[]; duplicates: string[] }>;
}

const CONFETTI_COLORS = ['#ffdd1c', '#ff382d', '#28a9ff', '#85d929', '#a537da', '#ffffff', '#ff9a1f'];
const CELEBRATION_EMOJIS = ['🎉', '✨', '🏆', '🍀', '💰', '🎊'];

// A partir de 07/07/2026, Dariel é o primeiro contemplado uma única vez.
// Depois disso, os próximos giros voltam a usar o sorteio aleatório normal.
const DARIEL_PRIORITY_START = '2026-07-07T00:00:00-03:00';
const DARIEL_PRIORITY_STORAGE_KEY = 'lulucap:dariel-priority-used:2026-07-07';

function normalizedFirstName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR')
    .split(' ')[0];
}

async function getPriorityDarielIndex(people: Person[]): Promise<number | null> {
  const darielIndex = people.findIndex(person => normalizedFirstName(person.name) === 'dariel');
  if (darielIndex < 0) return null;

  // Marca localmente já no primeiro giro para que, nesta rodada/dispositivo,
  // Dariel não volte a ser forçado caso o usuário escolha girar novamente.
  if (window.localStorage.getItem(DARIEL_PRIORITY_STORAGE_KEY)) return null;

  // Confirma no Supabase se o sorteio prioritário já ocorreu em outro acesso.
  // Um histórico existente também encerra a regra de prioridade neste dispositivo.
  const { count, error } = await supabase
    .from('lulucap_draws')
    .select('id', { count: 'exact', head: true })
    .eq('person_id', people[darielIndex].id)
    .gte('drawn_at', DARIEL_PRIORITY_START);

  if (!error && (count ?? 0) > 0) {
    window.localStorage.setItem(DARIEL_PRIORITY_STORAGE_KEY, 'supabase-history');
    return null;
  }

  // Caso a conexão esteja temporariamente indisponível, a prioridade continua
  // válida no primeiro uso local em vez de liberar o sorteio aleatório.
  return darielIndex;
}

function getWheelSize() {
  if (typeof window === 'undefined') return 332;
  return Math.max(288, Math.min(400, window.innerWidth - 54));
}

function formatWinnerAuditStamp(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function ConfettiBurst() {
  const pieces = useMemo(() => Array.from({ length: 96 }, (_, index) => ({
    id: index,
    left: 2 + Math.random() * 96,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    delay: Math.random() * .55,
    duration: 2.2 + Math.random() * 1.4,
    rotation: Math.round(Math.random() * 360),
    size: 8 + Math.round(Math.random() * 12),
    sway: -40 + Math.round(Math.random() * 80),
    shape: index % 4 === 0 ? 'circle' : index % 5 === 0 ? 'triangle' : 'rect',
  })), []);

  const emojis = useMemo(() => Array.from({ length: 16 }, (_, index) => ({
    id: index,
    left: 5 + Math.random() * 90,
    delay: .18 + Math.random() * .85,
    duration: 2.8 + Math.random() * 1.5,
    size: 18 + Math.round(Math.random() * 14),
    emoji: CELEBRATION_EMOJIS[index % CELEBRATION_EMOJIS.length],
    drift: -28 + Math.round(Math.random() * 56),
  })), []);

  return (
    <>
      <div className="confetti-layer" aria-hidden="true">
        {pieces.map(piece => (
          <i
            key={piece.id}
            className={`confetti-piece confetti-${piece.shape}`}
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              color: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              width: `${piece.size}px`,
              height: piece.shape === 'rect' ? `${Math.round(piece.size * 1.65)}px` : `${piece.size}px`,
              '--confetti-rotation': `${piece.rotation}deg`,
              '--confetti-drift': `${piece.sway}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="emoji-burst-layer" aria-hidden="true">
        {emojis.map(piece => (
          <span
            key={piece.id}
            className="emoji-burst"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              fontSize: `${piece.size}px`,
              '--emoji-drift': `${piece.drift}px`,
            } as React.CSSProperties}
          >
            {piece.emoji}
          </span>
        ))}
      </div>
    </>
  );
}

export function RouletteHomeTab({
  roulettePeople,
  pendingPeople,
  onConfirmWinner,
  onAddSelectedToRoulette,
  onAddMultiple,
}: RouletteHomeTabProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Person | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [winnerTimestamp, setWinnerTimestamp] = useState<Date | null>(null);
  const animationRef = useRef<number | null>(null);
  const spinLockRef = useRef(false);
  const wheelSize = getWheelSize();

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const spin = useCallback(async () => {
    if (!roulettePeople.length || isSpinning || spinLockRef.current) return;

    spinLockRef.current = true;

    try {
      const priorityDarielIndex = await getPriorityDarielIndex(roulettePeople);
      const isPriorityDarielDraw = priorityDarielIndex !== null;
      const winnerIndex = isPriorityDarielDraw
        ? priorityDarielIndex
        : selectWinnerIndex(roulettePeople.length);

      if (isPriorityDarielDraw) {
        // A prioridade é consumida no primeiro giro iniciado a partir de hoje.
        window.localStorage.setItem(DARIEL_PRIORITY_STORAGE_KEY, new Date().toISOString());
      }

      const segmentAngle = 360 / roulettePeople.length;
    const winnerMidpoint = (winnerIndex + .5) * segmentAngle;
    const desiredRotation = (360 - winnerMidpoint) % 360;
    const currentNormalizedRotation = ((rotation % 360) + 360) % 360;
    const adjustment = (desiredRotation - currentNormalizedRotation + 360) % 360;
    const fullTurns = 6 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + fullTurns * 360 + adjustment;
    const duration = 5200 + Math.random() * 700;
    const startedAt = performance.now();

    setIsSpinning(true);
    setShowWinner(false);
    setWinner(null);
    setWinnerTimestamp(null);

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setRotation(rotation + (finalRotation - rotation) * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        const drawnWinner = roulettePeople[winnerIndex];
        const drawnAt = new Date();
        setRotation(finalRotation);
        setIsSpinning(false);
        spinLockRef.current = false;
        setWinner(drawnWinner);
        setWinnerTimestamp(drawnAt);
        window.setTimeout(() => setShowWinner(true), 130);
      }
    };

      animationRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error('Não foi possível preparar o sorteio prioritário.', error);
      spinLockRef.current = false;
    }
  }, [roulettePeople, rotation, isSpinning]);

  const confirmWinner = async () => {
    if (!winner) return;
    await onConfirmWinner(winner.id, (winnerTimestamp ?? new Date()).toISOString());
    setShowWinner(false);
    setWinner(null);
    setWinnerTimestamp(null);
  };

  const spinAgain = () => {
    setShowWinner(false);
    setWinner(null);
    setWinnerTimestamp(null);
    window.setTimeout(spin, 80);
  };

  const bulbs = useMemo(() => Array.from({ length: 32 }, (_, index) => {
    const angle = (index / 32) * 360 - 90;
    return {
      id: index,
      left: 50 + Math.cos(angle * Math.PI / 180) * 48,
      top: 50 + Math.sin(angle * Math.PI / 180) * 48,
      delay: (index % 6) * .12,
    };
  }), []);

  return (
    <div className="roulette-home">
      <section className="wheel-section" aria-labelledby="roulette-title">
        <div className="wheel-section-intro">
          <LiveAuditClock />
          <h1 id="roulette-title">A sorte está na roda!</h1>
        </div>

        <div className={`wheel-stage ${isSpinning ? 'is-spinning' : ''} ${showWinner ? 'has-winner' : ''}`}>
          <div className="wheel-floor-glow" aria-hidden="true" />
          <div className="wheel-bulbs" aria-hidden="true">
            {bulbs.map(bulb => (
              <span
                key={bulb.id}
                className="wheel-bulb"
                style={{ left: `${bulb.left}%`, top: `${bulb.top}%`, animationDelay: `${bulb.delay}s` }}
              />
            ))}
          </div>
          <div className="wheel-pointer" aria-hidden="true">
            <span className="pointer-gem" />
          </div>
          <RouletteWheel
            participants={roulettePeople}
            rotation={rotation}
            isSpinning={isSpinning}
            size={wheelSize}
          />
          <button
            type="button"
            onClick={spin}
            disabled={!roulettePeople.length || isSpinning}
            className="spin-button"
            aria-label={roulettePeople.length ? 'Girar a roleta' : 'Adicione participantes para girar'}
          >
            <span className="spin-button-glint" aria-hidden="true" />
            <span>{isSpinning ? 'GIRANDO' : 'GIRAR'}</span>
          </button>
        </div>

        <div className="wheel-status-row">
          <span className="wheel-status-pill"><UsersRound size={16} /> {roulettePeople.length} na roleta</span>
          <span className="wheel-prize-pill"><Crown size={16} /> valendo R$ 2.800,00</span>
        </div>

        {showWinner && winner && (
          <div className="winner-modal-shell animate-winner-reveal" role="dialog" aria-modal="true" aria-labelledby="winner-modal-title">
            <div className="winner-modal-backdrop" />
            <div className="winner-modal-card">
              <ConfettiBurst />
              <div className="winner-modal-glow" aria-hidden="true" />
              <div className="winner-card-inner">
                <div className="winner-emoji-row" aria-hidden="true">
                  <span>🎉</span><span>🏆</span><span>✨</span><span>🍀</span><span>🎊</span>
                </div>
                <span className="winner-crown"><Trophy size={22} /></span>
                <span className="winner-label">CONTEMPLADO DA VEZ</span>
                <h2 id="winner-modal-title">{winner.name}</h2>
                <div className="winner-prize">R$ 2.800,00</div>
                {winnerTimestamp && (
                  <div className="winner-audit-stamp">
                    <div><CalendarDays size={15} /> <strong>{formatWinnerAuditStamp(winnerTimestamp)}</strong></div>
                    <div><Clock3 size={15} /> <span>Sorteio autenticado no momento da contemplação</span></div>
                  </div>
                )}
                <div className="winner-actions">
                  <button type="button" className="winner-secondary" onClick={spinAgain}>
                    <RotateCcw size={17} /> GIRAR DE NOVO
                  </button>
                  <button type="button" className="winner-primary" onClick={confirmWinner}>
                    <Check size={17} /> REGISTRAR CONTEMPLADO
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <AddParticipantsPanel
        participants={pendingPeople}
        roulettePoolIds={roulettePeople.map(person => person.id)}
        onAddSelectedToRoulette={onAddSelectedToRoulette}
        onAddMultiple={onAddMultiple}
      />
    </div>
  );
}
