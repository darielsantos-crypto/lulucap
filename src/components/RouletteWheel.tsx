import { useCallback, useEffect, useRef } from 'react';

interface RouletteWheelProps {
  participants: { id: string; name: string }[];
  /** Rotation in degrees. */
  rotation: number;
  isSpinning: boolean;
  size?: number;
}

const COLORS = ['#ef2b27', '#ffce19', '#138cf0', '#78c925', '#8e28c9', '#ff8b1a', '#0fa6a1', '#f04f91'];

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function cleanLabel(name: string) {
  return name.replace(/\s+/g, ' ').trim();
}

function shortenToWidth(context: CanvasRenderingContext2D, label: string, maxWidth: number) {
  if (context.measureText(label).width <= maxWidth) return label;

  const suffix = '…';
  let end = label.length;
  while (end > 1) {
    const candidate = `${label.slice(0, end).trimEnd()}${suffix}`;
    if (context.measureText(candidate).width <= maxWidth) return candidate;
    end -= 1;
  }

  return suffix;
}

/**
 * Fits each name inside its own segment. The available width is based on the
 * segment arc, so adding people automatically opens/recalculates the label area
 * instead of allowing adjacent labels to cross into one another.
 */
function fitWheelLabel(
  context: CanvasRenderingContext2D,
  participantName: string,
  maxWidth: number,
  participantCount: number,
) {
  const label = cleanLabel(participantName) || 'Participante';
  const preferredSize = participantCount <= 4 ? 17 : participantCount <= 7 ? 16 : participantCount <= 11 ? 14 : participantCount <= 16 ? 12 : 10;
  const minimumSize = participantCount >= 20 ? 7 : participantCount >= 12 ? 8 : 9;

  for (let fontSize = preferredSize; fontSize >= minimumSize; fontSize -= .5) {
    context.font = `900 ${fontSize}px Poppins, system-ui, sans-serif`;
    if (context.measureText(label).width <= maxWidth) {
      return { label, fontSize };
    }
  }

  context.font = `900 ${minimumSize}px Poppins, system-ui, sans-serif`;
  return {
    label: shortenToWidth(context, label, maxWidth),
    fontSize: minimumSize,
  };
}

export function RouletteWheel({ participants, rotation, isSpinning, size = 350 }: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWheel = useCallback((rotationDegrees: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = size / 2;
    const radius = size / 2 - 18;
    const innerRadius = radius * 0.27;
    const rotationRadians = rotationDegrees * (Math.PI / 180);

    context.clearRect(0, 0, size, size);

    const outerGlow = context.createRadialGradient(center, center, radius - 22, center, center, radius + 16);
    outerGlow.addColorStop(0, 'rgba(255, 221, 85, 0)');
    outerGlow.addColorStop(0.72, isSpinning ? 'rgba(255, 202, 33, .55)' : 'rgba(255, 202, 33, .26)');
    outerGlow.addColorStop(1, 'rgba(255, 202, 33, 0)');
    context.beginPath();
    context.arc(center, center, radius + 16, 0, Math.PI * 2);
    context.fillStyle = outerGlow;
    context.fill();

    const rimGradient = context.createRadialGradient(center - radius * .32, center - radius * .32, radius * .08, center, center, radius);
    rimGradient.addColorStop(0, '#fff8b3');
    rimGradient.addColorStop(0.28, '#ffd929');
    rimGradient.addColorStop(0.62, '#be6700');
    rimGradient.addColorStop(0.82, '#6e2604');
    rimGradient.addColorStop(1, '#f5c342');
    context.beginPath();
    context.arc(center, center, radius + 8, 0, Math.PI * 2);
    context.fillStyle = rimGradient;
    context.fill();

    context.beginPath();
    context.arc(center, center, radius - 2, 0, Math.PI * 2);
    context.fillStyle = '#551d0a';
    context.fill();

    if (participants.length === 0) {
      const emptyWheel = context.createRadialGradient(center, center, 12, center, center, radius - 6);
      emptyWheel.addColorStop(0, '#153b84');
      emptyWheel.addColorStop(0.7, '#071c52');
      emptyWheel.addColorStop(1, '#020c2c');
      context.beginPath();
      context.arc(center, center, radius - 6, 0, Math.PI * 2);
      context.fillStyle = emptyWheel;
      context.fill();
      context.strokeStyle = 'rgba(255,255,255,.25)';
      context.lineWidth = 1.4;
      context.stroke();
      context.font = '800 16px Poppins, system-ui, sans-serif';
      context.fillStyle = '#f8dd4b';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('ADICIONE PARTICIPANTES', center, center);
    } else {
      const segmentAngle = (Math.PI * 2) / participants.length;
      const startRotation = -Math.PI / 2 + rotationRadians;
      // This is the point where each label has the greatest usable arc without
      // colliding with the centre button or a neighbouring segment.
      const textRadius = innerRadius + (radius - innerRadius) * (participants.length <= 6 ? .60 : participants.length <= 12 ? .56 : .52);
      const availableArcWidth = Math.max(20, textRadius * segmentAngle * .72);

      participants.forEach((participant, index) => {
        const startAngle = startRotation + index * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        const middleAngle = startAngle + segmentAngle / 2;
        const baseColor = COLORS[index % COLORS.length];

        const segmentGradient = context.createLinearGradient(
          center + Math.cos(middleAngle) * innerRadius,
          center + Math.sin(middleAngle) * innerRadius,
          center + Math.cos(middleAngle) * radius,
          center + Math.sin(middleAngle) * radius,
        );
        segmentGradient.addColorStop(0, adjustColor(baseColor, -28));
        segmentGradient.addColorStop(.55, baseColor);
        segmentGradient.addColorStop(1, adjustColor(baseColor, 16));

        context.beginPath();
        context.moveTo(center, center);
        context.arc(center, center, radius - 6, startAngle, endAngle);
        context.closePath();
        context.fillStyle = segmentGradient;
        context.fill();

        context.strokeStyle = 'rgba(11, 12, 31, .72)';
        context.lineWidth = 2;
        context.stroke();

        const highlightStart = startAngle + segmentAngle * .10;
        const highlightEnd = endAngle - segmentAngle * .10;
        context.beginPath();
        context.arc(center, center, radius - 13, highlightStart, highlightEnd);
        context.strokeStyle = 'rgba(255,255,255,.38)';
        context.lineWidth = 1.4;
        context.stroke();

        const { label, fontSize } = fitWheelLabel(context, participant.name, availableArcWidth, participants.length);

        context.save();
        context.translate(center, center);
        context.rotate(middleAngle);
        context.translate(textRadius, 0);
        const normalized = ((middleAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const isLeft = normalized > Math.PI / 2 && normalized < Math.PI * 1.5;
        if (isLeft) {
          context.rotate(Math.PI);
        }
        context.font = `900 ${fontSize}px Poppins, system-ui, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.lineWidth = Math.max(2, fontSize * .22);
        context.strokeStyle = 'rgba(8, 19, 56, .76)';
        context.lineJoin = 'round';
        context.shadowColor = 'rgba(0, 0, 0, .48)';
        context.shadowBlur = 2;
        context.shadowOffsetY = 2;
        // Keep each name anchored inside its own segment; only the text
        // orientation flips on the left side so labels do not migrate to the
        // opposite half of the wheel.
        context.strokeText(label, 0, 0);
        context.fillStyle = '#fffef6';
        context.fillText(label, 0, 0);
        context.restore();
      });
    }

    const hubShadow = context.createRadialGradient(center, center, 0, center, center, innerRadius + 11);
    hubShadow.addColorStop(0, 'rgba(255,255,255,.22)');
    hubShadow.addColorStop(.5, 'rgba(17,105,34,.7)');
    hubShadow.addColorStop(1, 'rgba(4,34,14,.98)');
    context.beginPath();
    context.arc(center, center, innerRadius + 11, 0, Math.PI * 2);
    context.fillStyle = hubShadow;
    context.fill();
    context.strokeStyle = '#ffe666';
    context.lineWidth = 4;
    context.stroke();
    context.beginPath();
    context.arc(center, center, innerRadius + 4, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(255,255,255,.72)';
    context.lineWidth = 1.2;
    context.stroke();
  }, [size, participants, isSpinning]);

  useEffect(() => {
    drawWheel(rotation);
  }, [drawWheel, rotation]);

  return (
    <canvas
      ref={canvasRef}
      className={`roulette-canvas ${isSpinning ? 'is-spinning' : ''}`}
      aria-label={participants.length ? `Roleta com ${participants.length} participantes` : 'Roleta vazia'}
    />
  );
}
