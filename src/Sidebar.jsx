export default function Sidebar({ view, setView, operator, onLogout }) {
  return (
    <div className="w-60 bg-[var(--surface-container-low)] border-r border-[var(--outline-variant)] flex flex-col h-screen shrink-0">
      <div className="px-5 py-5">
        <h1 className="font-bold text-lg text-[var(--on-surface)] leading-tight">Label Match</h1>
        <p className="font-mono-label text-[11px] text-[var(--on-surface-variant)] mt-0.5">V1</p>
      </div>

      <nav className="px-3 flex flex-col gap-1">
        <button
          onClick={() => setView('scanner')}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded text-sm font-medium transition ${
            view === 'scanner'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--on-surface)] hover:bg-[var(--surface-container)]'
          }`}
        >
          <span className="text-base leading-none">▦</span> Scanner
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded text-sm font-medium transition ${
            view === 'history'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--on-surface)] hover:bg-[var(--surface-container)]'
          }`}
        >
          <span className="text-base leading-none">↺</span> History
        </button>
      </nav>

      <div className="mt-auto px-3 py-4 border-t border-[var(--outline-variant)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-[var(--primary-container)] text-white flex items-center justify-center text-xs font-semibold">
            {operator.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono-label text-[11px] text-[var(--on-surface-variant)] leading-none">OPERATOR</p>
            <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{operator}</p>
          </div>
          <button
            onClick={onLogout}
            title="Switch operator"
            className="text-[var(--on-surface-variant)] hover:text-[var(--error)] text-sm px-1"
          >
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}
