import { useState } from 'react';
import { Trophy, RotateCcw, Edit2, Trash2, Check, X } from 'lucide-react';
import { Person } from '../types';

interface WinnersListProps {
  winners: Person[];
  onReturnToRoulette: (id: string) => Promise<void>;
  onRemoveWinner: (id: string) => Promise<void>;
  onEditName: (id: string, newName: string) => Promise<{ duplicate: boolean } | false>;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-casino-bg-light rounded-xl border border-casino-border-strong p-5 max-w-sm w-full animate-bounce-in">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-300 bg-casino-bg-card border border-gray-600"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-casino-red text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WinnersList({
  winners,
  onReturnToRoulette,
  onRemoveWinner,
  onEditName,
}: WinnersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleStartEdit = (person: Person) => {
    setEditingId(person.id);
    setEditName(person.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      handleCancelEdit();
      return;
    }

    await onEditName(id, editName.trim());
    handleCancelEdit();
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      void onRemoveWinner(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (winners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-casino-bg-card flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 font-medium mb-1">Nenhum ganhador ainda</p>
        <p className="text-gray-500 text-sm">
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {winners.map((person, index) => {
        const isEditing = editingId === person.id;

        return (
          <div
            key={person.id}
            className="bg-casino-bg-card rounded-xl p-3.5 flex items-center gap-3 border border-casino-gold/30 hover:border-casino-gold/50 transition-colors"
          >
            {/* Medal */}
            <div className="w-11 h-11 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 shadow-glow-gold-sm">
              <span className="text-casino-bg font-bold text-lg">
                {index + 1}
              </span>
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveEdit(person.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="flex-1 bg-casino-bg border border-casino-border-strong rounded-lg px-3 py-2 text-white focus:outline-none focus:border-casino-gold"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(person.id)}
                    className="p-2 text-casino-emerald hover:bg-casino-emerald/20 rounded-lg"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <span className="text-white font-medium truncate block">
                    {person.name}
                  </span>
                  {person.wonAt && (
                    <span className="text-gray-500 text-xs">
                      {new Date(person.wonAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-1">
                {/* Return to roulette */}
                <button
                  onClick={() => void onReturnToRoulette(person.id)}
                  className="p-2.5 rounded-lg text-casino-gold hover:bg-casino-gold/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Voltar para a roleta"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleStartEdit(person)}
                  className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-casino-bg-light transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteConfirmId(person.id)}
                  className="p-2.5 rounded-lg text-gray-400 hover:text-casino-red hover:bg-casino-red/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Remover ganhador?"
        message="O nome volta para os participantes. O sorteio continua registrado no histórico de auditoria."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </div>
  );
}
