import { useState } from 'react';
import { User, Edit2, Trash2, PlusCircle, MinusCircle, Check, X } from 'lucide-react';
import { Person } from '../types';

interface ParticipantListProps {
  participants: Person[];
  roulettePoolIds: string[];
  onAddToRoulette: (id: string) => void;
  onRemoveFromRoulette: (id: string) => void;
  onEditName: (id: string, newName: string) => Promise<{ duplicate: boolean } | false>;
  onDelete: (id: string) => void;
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

export function ParticipantList({
  participants,
  roulettePoolIds,
  onAddToRoulette,
  onRemoveFromRoulette,
  onEditName,
  onDelete,
}: ParticipantListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDuplicateError, setShowDuplicateError] = useState(false);

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

    const result = await onEditName(id, editName.trim());
    if (result && 'duplicate' in result && result.duplicate) {
      setShowDuplicateError(true);
      setTimeout(() => setShowDuplicateError(false), 2000);
      return;
    }
    handleCancelEdit();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-casino-bg-card flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 font-medium mb-1">Nenhum participante</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map(person => {
        const isInRoulette = roulettePoolIds.includes(person.id);
        const isEditing = editingId === person.id;

        return (
          <div
            key={person.id}
            className="bg-casino-bg-card rounded-xl p-3.5 flex items-center gap-3 border border-casino-border hover:border-casino-border-strong transition-colors"
          >
            {/* Avatar */}
            <div className={`
              w-11 h-11 rounded-full flex items-center justify-center shrink-0
              ${isInRoulette
                ? 'bg-gradient-gold text-casino-bg'
                : 'bg-casino-bg-light text-gray-400'
              }
            `}>
              <User className="w-5 h-5" />
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
                <span className="text-white font-medium truncate block">
                  {person.name}
                </span>
              )}
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-1">
                {/* Roulette toggle */}
                <button
                  onClick={() => isInRoulette
                    ? onRemoveFromRoulette(person.id)
                    : onAddToRoulette(person.id)
                  }
                  className={`p-2.5 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isInRoulette
                      ? 'bg-casino-emerald/20 text-casino-emerald hover:bg-casino-emerald/30'
                      : 'bg-casino-bg text-gray-400 hover:bg-casino-gold/20 hover:text-casino-gold'
                  }`}
                  title={isInRoulette ? 'Remover da roleta' : 'Adicionar a roleta'}
                >
                  {isInRoulette ? (
                    <MinusCircle className="w-5 h-5" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
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
                  onClick={() => handleDeleteClick(person.id)}
                  className="p-2.5 rounded-lg text-gray-400 hover:text-casino-red hover:bg-casino-red/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Duplicate name error */}
      {showDuplicateError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-casino-red text-white px-4 py-3 rounded-lg shadow-lg animate-slide-up z-40">
          Nome ja existe
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Excluir participante?"
        message="Esta acao nao pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
