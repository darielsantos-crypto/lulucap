import { useEffect, useState } from 'react';

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function capitalize(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

/**
 * Relógio que usa a hora do dispositivo de quem está transmitindo/gravando.
 * O `dateTime` preserva o ISO completo para leitura/auditoria no DOM.
 */
export function LiveAuditClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const weekday = capitalize(weekdayFormatter.format(now));
  const date = dateFormatter.format(now);
  const time = timeFormatter.format(now);

  return (
    <time className="live-audit-clock" dateTime={now.toISOString()} aria-label={`Registro ao vivo: ${weekday}, ${date}, ${time}`}>
      <span className="live-audit-dot" aria-hidden="true" />
      <span>{weekday}</span>
      <span className="live-audit-separator" aria-hidden="true">•</span>
      <span>{date}</span>
      <span className="live-audit-separator" aria-hidden="true">•</span>
      <strong>{time}</strong>
    </time>
  );
}
