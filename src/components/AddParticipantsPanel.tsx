import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, PlusCircle, Sparkles, UserPlus, UsersRound } from 'lucide-react';
import { Person } from '../types';

interface AddParticipantsPanelProps {
  participants: Person[];
  roulettePoolIds: string[];
  onAddSelectedToRoulette: (ids: string[]) => Promise<void>;
  onAddMultiple: (names: string[], addToRoulette: boolean) => Promise<{ added: string[]; duplicates: string[] }>;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function AddParticipantsPanel({
  participants,
  roulettePoolIds,
  onAddSelectedToRoulette,
  onAddMultiple,
}: AddParticipantsPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const rouletteSet = useMemo(() => new Set(roulettePoolIds), [roulettePoolIds]);
  const availablePeople = useMemo(
    () => participants.filter(person => !rouletteSet.has(person.id)),
    [participants, rouletteSet],
  );
  const availableIds = useMemo(() => new Set(availablePeople.map(person => person.id)), [availablePeople]);

  useEffect(() => {
    setSelectedIds(current => current.filter(id => availableIds.has(id)));
  }, [availableIds]);

  const toggleSelection = (id: string) => {
    setSelectedIds(current => current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id]
    );
  };

  const handleAddSelected = async () => {
    if (!selectedIds.length || isAdding) return;
    setIsAdding(true);
    await onAddSelectedToRoulette(selectedIds);
    setFeedback(`${selectedIds.length} participante${selectedIds.length !== 1 ? 's' : ''} adicionado${selectedIds.length !== 1 ? 's' : ''} à roleta.`);
    setSelectedIds([]);
    setIsAdding(false);
    window.setTimeout(() => setFeedback(null), 2800);
  };

  const handleAddNew = async () => {
    const name = newName.trim();
    if (!name || isAdding) return;

    setIsAdding(true);
    const result = await onAddMultiple([name], true);
    setNewName('');
    setFeedback(result.added.length
      ? `${result.added[0]} entrou na roleta.`
      : 'Este participante já está cadastrado.'
    );
    setIsAdding(false);
    window.setTimeout(() => setFeedback(null), 2800);
  };

  return (
    <section className="participants-panel" aria-labelledby="participants-panel-title">
      <div className="panel-marquee-heading">
        <span className="heading-bulb" aria-hidden="true" />
        <div>
          <h2 id="participants-panel-title">Adicionar participantes</h2>
        </div>
        <Sparkles className="heading-sparkles" size={24} aria-hidden="true" />
      </div>

      <div className="registered-card">
        <div className="registered-card-head">
          <div>
            <h3>Selecionar cadastrados</h3>
          </div>
          <span className="count-pill">{availablePeople.length}</span>
        </div>

        {participants.length === 0 ? (
          <div className="registered-empty">
            <PlusCircle size={22} />
            <span>Nenhum participante cadastrado.</span>
          </div>
        ) : (
          <div className="participant-chips" aria-label="Selecionar participantes cadastrados">
            {participants.map((person, index) => {
              const isOnWheel = rouletteSet.has(person.id);
              const isSelected = selectedIds.includes(person.id);
              return (
                <button
                  type="button"
                  key={person.id}
                  disabled={isOnWheel}
                  onClick={() => toggleSelection(person.id)}
                  className={`participant-chip ${isSelected ? 'is-selected' : ''} ${isOnWheel ? 'is-on-wheel' : ''}`}
                  style={{ '--chip-index': index } as React.CSSProperties}
                  aria-pressed={isSelected}
                >
                  <span className="participant-avatar">{initials(person.name)}</span>
                  <span className="participant-name">{person.name}</span>
                  <span className="chip-check" aria-hidden="true">
                    {isOnWheel || isSelected ? <Check size={13} /> : <ChevronRight size={13} />}
                  </span>
                  {isOnWheel && <span className="chip-status">na roleta</span>}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddSelected}
          disabled={selectedIds.length === 0 || isAdding}
          className="roulette-add-button"
        >
          <UsersRound size={21} />
          <span>{isAdding ? 'ADICIONANDO...' : 'ADICIONAR À ROLETA'}</span>
          {selectedIds.length > 0 && <strong>{selectedIds.length}</strong>}
        </button>
      </div>

      <div className="new-participant-card">
        <div className="new-participant-copy">
          <h3>Novo participante</h3>
        </div>
        <div className="new-participant-form">
          <label className="sr-only" htmlFor="new-participant-name">Nome do novo participante</label>
          <input
            id="new-participant-name"
            type="text"
            value={newName}
            onChange={event => setNewName(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && handleAddNew()}
            placeholder="Digite o nome"
            maxLength={80}
          />
          <button
            type="button"
            onClick={handleAddNew}
            disabled={!newName.trim() || isAdding}
            className="new-participant-button"
          >
            <UserPlus size={19} />
            <span>ADICIONAR</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div role="status" className="panel-feedback animate-slide-up">
          <Check size={17} /> {feedback}
        </div>
      )}
    </section>
  );
}
