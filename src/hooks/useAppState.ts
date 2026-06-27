import { useCallback, useEffect, useMemo, useState } from 'react';
import { PersistedLuluCapState, Person } from '../types';
import { lulucapRepository } from '../services/lulucapRepository';

const INITIAL_STATE: PersistedLuluCapState = {
  people: [],
  roulettePoolIds: [],
};

function toMessage(error: unknown) {
  const message = error && typeof error === 'object' && 'message' in error
    ? String(error.message)
    : '';

  if (/Could not find the function|function .* does not exist/i.test(message)) {
    return 'A configuração do banco ainda não foi concluída. Execute o SQL da pasta supabase/migrations e atualize a página.';
  }
  if (/permission denied|row-level security/i.test(message)) {
    return 'O Supabase bloqueou esta ação. Execute a migração de configuração e tente novamente.';
  }
  return message || 'Não foi possível concluir a alteração no Supabase.';
}

export function useAppState() {
  const [state, setState] = useState<PersistedLuluCapState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const people = await lulucapRepository.listActivePeople();
    const roulettePoolIds = people
      .filter(person => person.status === 'pending' && person.inRoulette)
      .map(person => person.id);
    setState({
      people,
      roulettePoolIds,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        await refresh();
      } catch (error) {
        if (isMounted) setSyncError(toMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const runMutation = useCallback(async (operation: () => Promise<void>) => {
    setSyncError(null);

    try {
      await operation();
      await refresh();
      return true;
    } catch (error) {
      setSyncError(toMessage(error));
      return false;
    }
  }, [refresh]);

  const addMultiplePeople = useCallback(async (
    names: string[],
    addToRoulette = true,
  ): Promise<{ added: string[]; duplicates: string[] }> => {
    const cleanNames = names
      .map(name => name.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
    const normalizedInput = [...new Set(cleanNames.map(name => name.toLocaleLowerCase('pt-BR')))];
    const existingNames = new Set(state.people.map(person => person.name.toLocaleLowerCase('pt-BR')));
    const candidateNames = normalizedInput.filter(name => !existingNames.has(name));

    if (!candidateNames.length) {
      return { added: [], duplicates: cleanNames };
    }

    let inserted: Person[] = [];
    const success = await runMutation(async () => {
      inserted = await lulucapRepository.addPeople(cleanNames, addToRoulette);
    });

    if (!success) return { added: [], duplicates: [] };

    const addedNames = inserted.map(person => person.name);
    const addedSet = new Set(addedNames.map(name => name.toLocaleLowerCase('pt-BR')));
    const duplicates = cleanNames.filter(name => !addedSet.has(name.toLocaleLowerCase('pt-BR')));
    return { added: addedNames, duplicates };
  }, [runMutation, state.people]);

  const updatePersonName = useCallback(async (id: string, newName: string) => {
    const cleanName = newName.trim().replace(/\s+/g, ' ');
    if (!cleanName) return false;

    const alreadyExists = state.people.some(person => (
      person.id !== id && person.name.toLocaleLowerCase('pt-BR') === cleanName.toLocaleLowerCase('pt-BR')
    ));
    if (alreadyExists) return { duplicate: true };

    const success = await runMutation(() => lulucapRepository.renamePerson(id, cleanName));
    return success ? { duplicate: false } : false;
  }, [runMutation, state.people]);

  const deletePerson = useCallback(async (id: string) => {
    await runMutation(() => lulucapRepository.removeParticipant(id));
  }, [runMutation]);

  const addToRoulette = useCallback(async (id: string) => {
    if (state.roulettePoolIds.includes(id)) return;
    await runMutation(() => lulucapRepository.setRouletteMembership(id, true));
  }, [runMutation, state.roulettePoolIds]);

  const removeFromRoulette = useCallback(async (id: string) => {
    await runMutation(() => lulucapRepository.setRouletteMembership(id, false));
  }, [runMutation]);

  const addManyToRoulette = useCallback(async (ids: string[]) => {
    const pendingIds = new Set(state.people
      .filter(person => person.status === 'pending')
      .map(person => person.id));
    const idsToAdd = [...new Set(ids.filter(id => pendingIds.has(id) && !state.roulettePoolIds.includes(id)))];
    if (!idsToAdd.length) return;

    await runMutation(async () => {
      await Promise.all(idsToAdd.map(id => lulucapRepository.setRouletteMembership(id, true)));
    });
  }, [runMutation, state.people, state.roulettePoolIds]);

  const clearRoulette = useCallback(async () => {
    await runMutation(() => lulucapRepository.clearRoulette());
  }, [runMutation]);

  const confirmWinner = useCallback(async (id: string, drawnAt: string) => {
    await runMutation(() => lulucapRepository.registerWinner(id, drawnAt));
  }, [runMutation]);

  const removeWinner = useCallback(async (id: string) => {
    await runMutation(() => lulucapRepository.removeWinner(id, false));
  }, [runMutation]);

  const returnWinnerToRoulette = useCallback(async (id: string) => {
    await runMutation(() => lulucapRepository.removeWinner(id, true));
  }, [runMutation]);

  const roulettePeople = useMemo(() => state.roulettePoolIds
    .map(id => state.people.find(person => person.id === id))
    .filter((person): person is Person => person !== undefined), [state.people, state.roulettePoolIds]);

  const pendingPeople = useMemo(
    () => state.people.filter(person => person.status === 'pending'),
    [state.people],
  );

  const winnerPeople = useMemo(
    () => state.people.filter(person => person.status === 'winner'),
    [state.people],
  );

  return {
    isLoading,
    syncError,
    roulettePeople,
    pendingPeople,
    winnerPeople,
    addMultiplePeople,
    updatePersonName,
    deletePerson,
    addToRoulette,
    addManyToRoulette,
    removeFromRoulette,
    clearRoulette,
    confirmWinner,
    removeWinner,
    returnWinnerToRoulette,
  };
}
