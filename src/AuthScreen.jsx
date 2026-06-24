import { useState } from 'react';

export default function AuthScreen({ onActivate }) {
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onActivate(trimmed);
  }

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#1e293b]">
      {/* Background image - industrial warehouse, blurred */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=60')",
          filter: 'blur(8px) brightness(0.55)',
          transform: 'scale(1.1)',
        }}
      />
      <div className="absolute inset-0 bg-[#0b1320]/60" />

      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-white text-xl font-bold tracking-tight">Industrial Match</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-[var(--surface-container-low)]/95 rounded-md shadow-2xl border border-white/10 animate-slide-up"
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--outline-variant)]">
          <span className="text-base">▦</span>
          <h2 className="font-mono-label text-sm font-semibold tracking-wider text-[var(--on-surface)]">
            OPERATOR AUTHENTICATION
          </h2>
        </div>

        <div className="px-6 py-6">
          <p className="font-mono-label text-xs text-[var(--success-dark)] mb-4">
            // ENTER OPERATOR ID TO ACTIVATE SCANNING BAY
          </p>

          <label className="block font-mono-label text-xs font-semibold tracking-wider text-[var(--on-surface)] mb-2">
            OPERATOR ID / NAME
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. OP-001 or JOHN SMITH"
            className="w-full h-14 px-4 bg-white border-2 border-[var(--primary)] rounded text-base font-mono-label text-[var(--on-surface)] outline-none focus:border-[var(--success)] transition-colors"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-5 w-full h-14 bg-[var(--primary)] text-white rounded font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-[#1e293b] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>👤</span> ACTIVATE SCANNING BAY
          </button>
        </div>

        <div className="px-6 py-3 bg-[var(--surface-container)] border-t border-[var(--outline-variant)] rounded-b-md">
          <p className="font-mono-label text-[11px] text-[var(--on-surface-variant)]">
            SYS: All scan events will be logged under this operator ID.
          </p>
        </div>
      </form>
    </div>
  );
}
