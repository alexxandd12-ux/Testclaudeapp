import { useState, useMemo } from 'react';
import { getHistory, exportHistoryToCSV, clearHistory } from './storage';

const PAGE_SIZE = 8;

export default function History() {
  const [all, setAll] = useState(() => getHistory());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  const operators = useMemo(() => {
    const set = new Set(all.map((h) => h.operator));
    return ['ALL', ...Array.from(set)];
  }, [all]);

  const filtered = useMemo(() => {
    return all.filter((h) => {
      if (operatorFilter !== 'ALL' && h.operator !== operatorFilter) return false;
      const ts = new Date(h.timestamp);
      if (dateFrom && ts < new Date(dateFrom)) return false;
      if (dateTo && ts > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [all, dateFrom, dateTo, operatorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function resetFilters() {
    setDateFrom('');
    setDateTo('');
    setOperatorFilter('ALL');
    setPage(0);
  }

  function handleClear() {
    if (confirm('Clear all scan history? This cannot be undone.')) {
      clearHistory();
      setAll([]);
    }
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[var(--surface)]">
      <div className="px-10 py-8 max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--on-surface)]">Scan Log Archive</h2>
          <div className="flex gap-2">
            <button
              onClick={() => exportHistoryToCSV(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded font-semibold text-sm hover:bg-[#1e293b] disabled:opacity-40 transition"
            >
              ↓ EXPORT CSV
            </button>
            <button
              onClick={handleClear}
              disabled={all.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-[var(--outline-variant)] text-[var(--on-surface)] rounded font-semibold text-sm hover:bg-[var(--surface-container)] disabled:opacity-40 transition"
            >
              CLEAR LOG
            </button>
          </div>
        </div>
        <p className="text-[var(--on-surface-variant)] mb-6">Review validation history across all scanner nodes.</p>

        {/* Filters */}
        <div className="bg-white border border-[var(--outline-variant)] rounded-md p-4 mb-6 flex gap-4 items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="font-mono-label text-[11px] font-semibold text-[var(--on-surface-variant)]">
              DATE FROM
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              className="h-11 px-3 border border-[var(--outline-variant)] rounded text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono-label text-[11px] font-semibold text-[var(--on-surface-variant)]">
              DATE TO
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              className="h-11 px-3 border border-[var(--outline-variant)] rounded text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono-label text-[11px] font-semibold text-[var(--on-surface-variant)]">
              OPERATOR
            </label>
            <select
              value={operatorFilter}
              onChange={(e) => { setOperatorFilter(e.target.value); setPage(0); }}
              className="h-11 px-3 border border-[var(--outline-variant)] rounded text-sm outline-none focus:border-[var(--primary)] bg-white min-w-[160px]"
            >
              {operators.map((op) => (
                <option key={op} value={op}>
                  {op === 'ALL' ? 'All Operators' : op}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={resetFilters}
            className="h-11 px-4 border border-[var(--outline-variant)] rounded text-sm font-semibold hover:bg-[var(--surface-container)] transition"
          >
            RESET
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-[var(--outline-variant)] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)]">
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">TIMESTAMP</th>
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">OPERATOR</th>
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">PART BARCODE (EXPECTED)</th>
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">LABEL BARCODE (SCANNED)</th>
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">RESULT</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[var(--on-surface-variant)]">
                    No scan records found.
                  </td>
                </tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b last:border-b-0 border-[var(--outline-variant)] ${
                      r.result === 'MISMATCH' ? 'bg-[var(--error-bg)]' : ''
                    }`}
                  >
                    <td className="px-5 py-3 font-mono-label">{r.timestamp}</td>
                    <td className="px-5 py-3 font-mono-label font-semibold">{r.operator}</td>
                    <td className="px-5 py-3 font-mono-label text-[var(--on-surface-variant)]">{r.partBarcode}</td>
                    <td
                      className={`px-5 py-3 font-mono-label ${
                        r.result === 'MISMATCH' ? 'text-[var(--error)] font-semibold' : 'text-[var(--on-surface-variant)]'
                      }`}
                    >
                      {r.result === 'MISMATCH' && '⚠ '}
                      {r.labelBarcode}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-label font-semibold ${
                          r.result === 'MATCH'
                            ? 'bg-[var(--success)] text-white'
                            : 'bg-[var(--error)] text-white'
                        }`}
                      >
                        {r.result === 'MATCH' ? '✓ MATCH' : '✕ MISMATCH'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-5 py-3 bg-[var(--surface-container-low)] border-t border-[var(--outline-variant)]">
            <span className="font-mono-label text-xs text-[var(--on-surface-variant)]">
              SHOWING {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}-
              {Math.min((page + 1) * PAGE_SIZE, filtered.length)} OF {filtered.length} RECORDS
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center border border-[var(--outline-variant)] rounded bg-white disabled:opacity-40 hover:bg-[var(--surface-container)] transition"
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center border border-[var(--outline-variant)] rounded bg-white disabled:opacity-40 hover:bg-[var(--surface-container)] transition"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
