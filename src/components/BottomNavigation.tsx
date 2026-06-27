import { CircleDot, Trophy, Users } from 'lucide-react';
import { TabId } from '../types';

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  rouletteCount: number;
  pendingCount: number;
  winnerCount: number;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  rouletteCount,
  pendingCount,
  winnerCount,
}: BottomNavigationProps) {
  const tabs: { id: TabId; icon: typeof CircleDot; label: string; count: number }[] = [
    { id: 'roulette', icon: CircleDot, label: 'Roleta', count: rouletteCount },
    { id: 'participants', icon: Users, label: 'Participantes', count: pendingCount },
    { id: 'winners', icon: Trophy, label: 'Ganhadores', count: winnerCount },
  ];

  return (
    <nav className="bottom-navigation" aria-label="Navegação principal">
      <div className="bottom-navigation-inner">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`nav-item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon-wrap">
                <Icon size={22} />
                {tab.count > 0 && <em>{tab.count}</em>}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
