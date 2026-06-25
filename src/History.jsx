import { useState, useMemo } from 'react';
import { getHistory, exportHistoryToCSV, deleteHistoryEntry } from './storage';

const DELETE_PASSWORD = 'as12345678';

const PAGE_SIZE = 8;

export default function History() {
  const [all, setAll] = useState(() => getHistory());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null); // row being considered for deletion
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  function requestDelete(row) {
    setDeleteTarget(row);
    setPasswordInput('');
    setPasswordError(false);
  }

  function cancelDelete() {
    setDeleteTarget(null);
    setPasswordInput('');
    setPasswordError(false);
  }

  function confirmDelete() {
    if (passwordInput !== DELETE_PASSWORD) {
      setPasswordError(true);
      return;
    }
    const updated = deleteHistoryEntry(deleteTarget);
    setAll(updated);
    setDeleteTarget(null);
    setPasswordInput('');
    setPasswordError(false);
  }

  const operators = useMemo(() => {
    const set = new Set(all.map((h) => h.operator));
    return ['ALL', ...Array.from(set)];
  }, [all]);

  function parseEntryDate(h) {
    if (h.timestampISO) return new Date(h.timestampISO);
    // Legacy entries only have a locale string like "24/06/2026, 12:58:56"
    // which Date() cannot parse natively (DD/MM/YYYY). Parse manually.
    const m = h.timestamp.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})/);
    if (!m) return new Date(NaN);
    const [, day, month, year, hh, mm, ss] = m;
    return new Date(+year, +month - 1, +day, +hh, +mm, +ss);
  }

  const filtered = useMemo(() => {
    return all.filter((h) => {
      if (operatorFilter !== 'ALL' && h.operator !== operatorFilter) return false;
      const ts = parseEntryDate(h);
      if (dateFrom && ts < new Date(dateFrom + 'T00:00:00')) return false;
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

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[var(--surface)]">
      <div className="px-10 py-8 max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--on-surface)]">Scan Log Archive</h2>
          <button
            onClick={() => exportHistoryToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded font-semibold text-sm hover:bg-[#1e293b] disabled:opacity-40 transition"
          >
            ↓ EXPORT CSV
          </button>
        </div>

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
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">PART BARCODE</th>
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">LABEL BARCODE</th>
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">RESULT</th>
                <th className="text-left px-5 py-3 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--on-surface-variant)]">
                    No scan records found.
                  </td>
                </tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr
                    key={r.id || i}
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
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => requestDelete(r)}
                        title="Delete entry"
                        className="w-7 h-7 inline-flex items-center justify-center rounded text-[var(--on-surface-variant)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] transition text-sm"
                      >
                        🗑
                      </button>
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-sm border border-[var(--outline-variant)] animate-slide-up">
            <div className="px-5 py-4 border-b border-[var(--outline-variant)]">
              <h3 className="font-semibold text-[var(--on-surface)]">Delete scan record?</h3>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1 font-mono-label">
                {deleteTarget.timestamp} — {deleteTarget.labelBarcode}
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="block font-mono-label text-xs font-semibold text-[var(--on-surface-variant)] mb-2">
                ENTER PASSWORD TO CONFIRM
              </label>
              <input
                type="password"
                autoFocus
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
                className={`w-full h-11 px-3 border rounded text-sm outline-none font-mono-label ${
                  passwordError
                    ? 'border-[var(--error)] focus:border-[var(--error)]'
                    : 'border-[var(--outline-variant)] focus:border-[var(--primary)]'
                }`}
              />
              {passwordError && (
                <p className="text-xs text-[var(--error)] mt-1.5">Incorrect password.</p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-[var(--outline-variant)] flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-semibold rounded border border-[var(--outline-variant)] hover:bg-[var(--surface-container)] transition"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold rounded bg-[var(--error)] text-white hover:bg-[#a31616] transition"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
