import { Gift, Menu, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface BrandHeaderProps {
  onClearRoulette: () => void;
}

export function BrandHeader({ onClearRoulette }: BrandHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

  return (
    <header className="brand-header">
      <div className="brand-top-actions" aria-label="Ações rápidas">
        <div className="prize-ticker" aria-label="Prêmio atual: dois mil e oitocentos reais">
          <span className="currency-orb" aria-hidden="true">R$</span>
          <span className="prize-label">PRÊMIO ATUAL</span>
          <span className="prize-value">2.800,00</span>
          <span className="prize-spark" aria-hidden="true">✦</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            onClick={() => setGiftOpen(value => !value)}
            className="header-round-button"
            aria-label="Ver detalhes do prêmio"
            aria-expanded={giftOpen}
          >
            <Gift size={20} />
            <span className="header-dot" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(value => !value)}
            className="header-round-button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className="brand-logo-stage">
        <span className="light-streak light-streak-left" />
        <img src="/lulucap-logo.png" className="brand-logo" alt="LuluCap" />
        <span className="light-streak light-streak-right" />
      </div>

      <div className="brand-copy">
        <span className="brand-copy-star" aria-hidden="true">✦</span>
        <span>SORTEIO PREMIADO</span>
        <span className="brand-copy-star" aria-hidden="true">✦</span>
      </div>

      {giftOpen && (
        <div className="header-popover header-popover-gift animate-slide-up">
          <div className="popover-title"><Gift size={16} /> Prêmio da rodada</div>
          <strong>R$ 2.800,00</strong>
        </div>
      )}

      {menuOpen && (
        <div className="header-popover header-popover-menu animate-slide-up">
          <div className="popover-title"><Menu size={16} /> Controle rápido</div>
          <button
            type="button"
            className="menu-action"
            onClick={() => {
              if (window.confirm('Deseja esvaziar a roleta?')) {
                onClearRoulette();
                setMenuOpen(false);
              }
            }}
          >
            <Trash2 size={15} /> Limpar roleta
          </button>
        </div>
      )}
    </header>
  );
}
