export type PersonStatus = 'pending' | 'winner' | 'removed';

export interface Person {
  id: string;
  name: string;
  status: PersonStatus;
  createdAt: string;
  wonAt?: string;
  removedAt?: string;
  inRoulette: boolean;
}

export interface PersistedLuluCapState {
  people: Person[];
  roulettePoolIds: string[];
}

export type TabId = 'roulette' | 'participants' | 'winners';
