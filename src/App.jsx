import { useState, useMemo } from 'react';

const CRITERIA = [
  { key: 'length', label: 'Lunghezza', icon: '📏', desc: 'Almeno 10 caratteri' },
  { key: 'uppercase', label: 'Maiuscole', icon: '🔠', desc: 'Lettere A–Z' },
  { key: 'lowercase', label: 'Minuscole', icon: '🔡', desc: 'Lettere a–z' },
  { key: 'numbers', label: 'Numeri', icon: '🔢', desc: 'Cifre 0–9' },
  { key: 'symbols', label: 'Simboli', icon: '🔣', desc: 'Caratteri speciali' },
];

const BLOCKS = 5;

function computeStrength(pwd) {
  if (!pwd) return { criteria: {}, totalScore: 0, level: 'empty' };

  const checks = {
    length: Math.min(pwd.length, 10),
    uppercase: (pwd.match(/[A-Z]/g) || []).length,
    lowercase: (pwd.match(/[a-z]/g) || []).length,
    numbers: (pwd.match(/[0-9]/g) || []).length,
    symbols: (pwd.match(/[^A-Za-z0-9]/g) || []).length,
  };

  const criteria = {};
  let totalBlocks = 0;
  let filledBlocks = 0;

  for (const { key } of CRITERIA) {
    const raw = checks[key];
    const filled = Math.min(raw, BLOCKS);
    criteria[key] = { raw, filled, max: BLOCKS };
    filledBlocks += filled;
    totalBlocks += BLOCKS;
  }

  const totalScore = totalBlocks > 0 ? Math.round((filledBlocks / totalBlocks) * 100) : 0;

  let level;
  if (totalScore === 0) level = 'empty';
  else if (totalScore <= 30) level = 'weak';
  else if (totalScore <= 60) level = 'medium';
  else if (totalScore <= 85) level = 'strong';
  else level = 'very-strong';

  return { criteria, totalScore, level };
}

function getLevelLabel(level) {
  switch (level) {
    case 'empty': return 'Inserisci una password';
    case 'weak': return 'Debole';
    case 'medium': return 'Nella media';
    case 'strong': return 'Forte';
    case 'very-strong': return 'Molto forte';
    default: return '';
  }
}

function PasswordInput({ id, value, onChange, label }) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">{label}</label>
      <div className="field__input-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="field__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Scrivi o incolla la password…"
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Nascondi password' : 'Mostra password'}
          title={show ? 'Nascondi password' : 'Mostra password'}
        >
          {show ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function StrengthRow({ criterion, data }) {
  const { raw, filled, max } = data;
  const pct = max > 0 ? Math.round((filled / max) * 100) : 0;

  return (
    <div className="strength-row">
      <div className="strength-row__head">
        <span className="strength-row__label">{criterion.label}</span>
        <span className="strength-row__desc">{criterion.desc}</span>
        <span className="strength-row__count">{raw} rilevati</span>
      </div>
      <div className="strength-row__blocks" role="meter" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={max} aria-label={`${criterion.label}: ${filled} su ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`block block--${i < filled ? 'filled' : 'empty'}`}
          />
        ))}
      </div>
      <span className="strength-row__pct">{pct}%</span>
    </div>
  );
}

function StrengthGauge({ score, level }) {
  return (
    <div className="gauge" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`Punteggio sicurezza: ${score}%`}>
      <div className="gauge__bar">
        <div
          className={`gauge__fill gauge__fill--${level}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="gauge__info">
        <span className={`gauge__badge badge badge--${level}`}>{getLevelLabel(level)}</span>
        <span className="gauge__score">{score}/100</span>
      </div>
    </div>
  );
}

function WinnerBanner({ left, right }) {
  const ls = left.totalScore;
  const rs = right.totalScore;

  if (ls === 0 && rs === 0) {
    return (
      <div className="winner winner--neutral">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="15" x2="16" y2="15" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <span>Inserisci entrambe le password per il confronto</span>
      </div>
    );
  }

  if (ls === rs) {
    return (
      <div className="winner winner--tie">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="20" y2="12" />
          <polyline points="8 8 4 12 8 16" />
          <polyline points="16 8 20 12 16 16" />
        </svg>
        <span>Pareggio — entrambe le password hanno lo stesso livello di sicurezza ({ls}/100)</span>
      </div>
    );
  }

  const winner = ls > rs ? 'sinistra' : 'destra';
  const diff = Math.abs(ls - rs);

  return (
    <div className={`winner winner--${winner === 'sinistra' ? 'left' : 'right'}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s8-4 8-10V5l-8-3-8 3v5c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
      <span>
        La password di <strong>{winner}</strong> è più sicura di <strong>{diff} punti</strong>
      </span>
    </div>
  );
}

export default function App() {
  const [leftPwd, setLeftPwd] = useState('');
  const [rightPwd, setRightPwd] = useState('');

  const leftStrength = useMemo(() => computeStrength(leftPwd), [leftPwd]);
  const rightStrength = useMemo(() => computeStrength(rightPwd), [rightPwd]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Confronto sicurezza password</h1>
        <p className="app-subtitle">
          Inserisci due password e scopri qual è la più robusta. Cinque criteri a blocchi analizzano in tempo reale lunghezza, maiuscole, minuscole, numeri e simboli.
        </p>
      </header>

      <main className="arena">
        <section className="arena__col" aria-labelledby="left-heading">
          <h2 id="left-heading" className="arena__heading">Password A</h2>
          <PasswordInput
            id="pwd-left"
            value={leftPwd}
            onChange={setLeftPwd}
            label="Prima password"
          />
          <div className="arena__strength">
            <StrengthGauge score={leftStrength.totalScore} level={leftStrength.level} />
            <div className="criteria-list">
              {CRITERIA.map((c) => (
                <StrengthRow key={c.key} criterion={c} data={leftStrength.criteria[c.key]} />
              ))}
            </div>
          </div>
        </section>

        <div className="arena__divider" aria-hidden="true">
          <span className="arena__vs">VS</span>
        </div>

        <section className="arena__col" aria-labelledby="right-heading">
          <h2 id="right-heading" className="arena__heading">Password B</h2>
          <PasswordInput
            id="pwd-right"
            value={rightPwd}
            onChange={setRightPwd}
            label="Seconda password"
          />
          <div className="arena__strength">
            <StrengthGauge score={rightStrength.totalScore} level={rightStrength.level} />
            <div className="criteria-list">
              {CRITERIA.map((c) => (
                <StrengthRow key={c.key} criterion={c} data={rightStrength.criteria[c.key]} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <WinnerBanner left={leftStrength} right={rightStrength} />
      </footer>
    </div>
  );
}
