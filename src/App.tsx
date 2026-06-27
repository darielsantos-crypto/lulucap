import { useState } from 'react';
import { Sparkles, Trophy, UsersRound } from 'lucide-react';
import { useAppState } from './hooks/useAppState';
import { BottomNavigation } from './components/BottomNavigation';
import { RouletteHomeTab } from './components/RouletteHomeTab';
import { ParticipantList } from './components/ParticipantList';
import { WinnersList } from './components/WinnersList';
import { BrandHeader } from './components/BrandHeader';
import { TabId } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('roulette');
  const {
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
  } = useAppState();

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-wheel" />
        <strong>Carregando sua rodada...</strong>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-frame">
        <BrandHeader onClearRoulette={clearRoulette} />

        {syncError && <div className="sync-error" role="alert">{syncError}</div>}

        <main className="app-main">
          {activeTab === 'roulette' && (
            <RouletteHomeTab
              roulettePeople={roulettePeople}
              pendingPeople={pendingPeople}
              onConfirmWinner={confirmWinner}
              onAddSelectedToRoulette={addManyToRoulette}
              onAddMultiple={addMultiplePeople}
            />
          )}

          {activeTab === 'participants' && (
            <section className="content-tab">
              <div className="tab-title-block">
                <span className="section-kicker"><UsersRound size={15} /> CONTROLE DA RODADA</span>
                <h1>Participantes</h1>
              </div>
              <div className="tab-stat-strip">
                <div><strong>{pendingPeople.length}</strong><span>cadastrados</span></div>
                <div><strong>{roulettePeople.length}</strong><span>na roleta</span></div>
                <div><strong>{winnerPeople.length}</strong><span>ganhadores</span></div>
              </div>
              <div className="tab-list-heading"><Sparkles size={17} /> Lista de participantes</div>
              <ParticipantList
                participants={pendingPeople}
                roulettePoolIds={roulettePeople.map(person => person.id)}
                onAddToRoulette={addToRoulette}
                onRemoveFromRoulette={removeFromRoulette}
                onEditName={updatePersonName}
                onDelete={deletePerson}
              />
            </section>
          )}

          {activeTab === 'winners' && (
            <section className="content-tab">
              <div className="tab-title-block">
                <span className="section-kicker"><Trophy size={15} /> HALL DA SORTE</span>
                <h1>Ganhadores</h1>
              </div>
              <div className="winners-hero-card">
                <Trophy size={32} />
                <div><span>PRÊMIO DA RODADA</span><strong>R$ 2.800,00</strong></div>
              </div>
              <WinnersList
                winners={winnerPeople}
                onReturnToRoulette={returnWinnerToRoulette}
                onRemoveWinner={removeWinner}
                onEditName={updatePersonName}
              />
            </section>
          )}
        </main>

        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rouletteCount={roulettePeople.length}
          pendingCount={pendingPeople.length}
          winnerCount={winnerPeople.length}
        />
      </div>
    </div>
  );
}

export default App;
