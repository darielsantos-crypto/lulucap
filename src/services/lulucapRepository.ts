import { PostgrestError } from '@supabase/supabase-js';
import { Person, PersonStatus } from '../types';
import { supabase } from '../lib/supabase';

type LuluCapPersonRow = {
  id: string;
  name: string;
  status: PersonStatus;
  created_at: string;
  winner_at: string | null;
  removed_at: string | null;
  in_roulette: boolean | null;
};

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function toPerson(row: LuluCapPersonRow): Person {
  return {
    id: String(row.id),
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    wonAt: row.winner_at ?? undefined,
    removedAt: row.removed_at ?? undefined,
    inRoulette: Boolean(row.in_roulette),
  };
}

function ensureData<T>(data: T | null, error: PostgrestError | null): T {
  if (error) throw error;
  if (data === null) throw new Error('O Supabase não retornou os dados esperados.');
  return data;
}

export const lulucapRepository = {
  async listActivePeople(): Promise<Person[]> {
    const { data, error } = await supabase
      .from('lulucap_people')
      .select('id, name, status, created_at, winner_at, removed_at, in_roulette')
      .neq('status', 'removed')
      .order('created_at', { ascending: true });

    return ensureData(data as LuluCapPersonRow[] | null, error).map(toPerson);
  },

  async addPeople(rawNames: string[], addToRoulette: boolean): Promise<Person[]> {
    const seen = new Set<string>();
    const names = rawNames.reduce<string[]>((result, rawName) => {
      const name = normalizeName(rawName);
      const key = name.toLocaleLowerCase('pt-BR');
      if (name && !seen.has(key)) {
        seen.add(key);
        result.push(name);
      }
      return result;
    }, []);

    if (!names.length) return [];

    const { data, error } = await supabase.rpc('lulucap_add_participants', {
      p_names: names,
      p_add_to_roulette: addToRoulette,
    });

    return ensureData(data as LuluCapPersonRow[] | null, error).map(toPerson);
  },

  async renamePerson(personId: string, nextName: string): Promise<void> {
    const { error } = await supabase.rpc('lulucap_rename_participant', {
      p_person_id: personId,
      p_name: normalizeName(nextName),
    });
    if (error) throw error;
  },

  async removeParticipant(personId: string): Promise<void> {
    const { error } = await supabase.rpc('lulucap_remove_participant', {
      p_person_id: personId,
    });
    if (error) throw error;
  },

  async setRouletteMembership(personId: string, inRoulette: boolean): Promise<void> {
    const { error } = await supabase.rpc('lulucap_set_roulette_membership', {
      p_person_id: personId,
      p_in_roulette: inRoulette,
    });
    if (error) throw error;
  },

  async clearRoulette(): Promise<void> {
    const { error } = await supabase.rpc('lulucap_clear_roulette');
    if (error) throw error;
  },

  async registerWinner(personId: string, drawnAt: string): Promise<void> {
    const { error } = await supabase.rpc('lulucap_register_winner', {
      p_person_id: personId,
      p_drawn_at: drawnAt,
      p_prize_amount: 2800,
    });
    if (error) throw error;
  },

  async removeWinner(personId: string, returnToRoulette: boolean): Promise<void> {
    const { error } = await supabase.rpc('lulucap_remove_winner', {
      p_person_id: personId,
      p_return_to_roulette: returnToRoulette,
    });
    if (error) throw error;
  },
};
