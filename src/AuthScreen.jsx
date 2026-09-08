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
    <div
      className="h-screen w-screen overflow-hidden flex items-center justify-center p-8 relative"
      style={{
        backgroundImage: "url('/auth-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <div className="fixed inset-0 bg-[var(--primary)] opacity-60 z-0 pointer-events-none" />

      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-20 font-mono-label text-3xl md:text-[48px] text-[var(--on-surface)] uppercase tracking-widest bg-[var(--surface-container-lowest)]/80 px-8 py-4 border-2 border-[var(--primary)] shadow-lg whitespace-nowrap font-bold">
        Label Matching - Tool
      </div>

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] shadow-lg flex flex-col relative z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[var(--primary-container)] p-6 flex items-center justify-between border-b-4 border-[var(--primary-container)]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--primary-fixed-dim)]" style={{ fontSize: 32 }}>
              qr_code_scanner
            </span>
            <h2 className="text-2xl font-semibold text-white m-0 uppercase tracking-wide">
              Operator Authentication
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-8 bg-[var(--surface-container-lowest)] relative">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 10px)',
            }}
          />
          <div className="relative z-10">
            <p className="font-mono-label text-sm mb-6 tracking-widest uppercase text-[var(--primary)]">
              // ENTER OPERATOR NAME
            </p>
            <div className="flex flex-col gap-3">
              <label className="text-sm uppercase tracking-wide font-bold text-[var(--on-surface)]" htmlFor="operator-id">
                Operator Name
              </label>
              <div className="relative">
                <input
                  id="operator-id"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="w-full h-16 bg-[var(--surface)] border-2 border-[var(--outline-variant)] px-4 py-2 font-mono-label text-lg text-[var(--on-surface)] focus:outline-none focus:ring-1 transition-colors focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--outline)]">
                  badge
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="relative z-10 pt-4">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full h-16 bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white flex items-center justify-center gap-3 transition-colors uppercase tracking-wider text-lg border-b-4 border-black/30 hover:border-black/50 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">login</span>
              <span>SIGN IN</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--surface-container)] p-4 border-t border-[var(--outline-variant)] flex justify-between items-center text-[var(--on-surface-variant)] font-mono-label text-xs uppercase">
          <span>all scans will be lodged under this name.</span>
          <span className="material-symbols-outlined text-base">verified_user</span>
        </div>
      </form>
    </div>
  );
}
