import { useState, useRef, useEffect } from 'react';
import { addHistoryEntry, getHistory } from './storage';

export default function Scanner({ operator }) {
  const [partScan, setPartScan] = useState('');
  const [labelScan, setLabelScan] = useState('');
  const [status, setStatus] = useState('idle'); // idle | match | mismatch
  const [recent, setRecent] = useState(() => getHistory().slice(0, 4));
  const partInputRef = useRef(null);
  const labelInputRef = useRef(null);

  useEffect(() => {
    partInputRef.current?.focus();
  }, []);

  function evaluate(part, label) {
    if (!part || !label) return;
    const isMatch = part.replace(/\s+/g, '').includes(label.replace(/\s+/g, ''));
    const now = new Date();
    const entry = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now.toLocaleString(),
      timestampISO: now.toISOString(),
      operator,
      partBarcode: part,
      labelBarcode: label,
      result: isMatch ? 'MATCH' : 'MISMATCH',
    };
    addHistoryEntry(entry);
    setRecent(getHistory().slice(0, 4));
    setStatus(isMatch ? 'match' : 'mismatch');
  }

  function handlePartKeyDown(e) {
    if (e.key === 'Enter') {
      labelInputRef.current?.focus();
    }
  }

  function handleLabelKeyDown(e) {
    if (e.key === 'Enter') {
      evaluate(partScan, labelScan);
    }
  }

  function handleLabelChange(value) {
    setLabelScan(value);
    // auto-evaluate once label has a reasonable length and part is present,
    // mirrors handheld scanners that submit on scan-complete (no Enter key)
  }

  function reset() {
    setPartScan('');
    setLabelScan('');
    setStatus('idle');
    setTimeout(() => partInputRef.current?.focus(), 0);
  }

  const borderClass = (field) => {
    if (status === 'idle') return 'border-[var(--outline-variant)] focus-within:border-[var(--primary)]';
    if (field === 'label') {
      return status === 'match' ? 'border-[var(--success)]' : 'border-[var(--error-bright)]';
    }
    return 'border-[var(--success)]';
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[var(--surface)]">
      <div className="px-10 py-8 max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--on-surface)]">Label to Part Matching</h2>
          <div className="flex items-center gap-2 border border-[var(--outline-variant)] rounded px-3 py-2 bg-white">
            <span className="font-mono-label text-xs text-[var(--on-surface-variant)]">Operator ID</span>
            <span className="font-mono-label text-sm font-semibold">{operator}</span>
          </div>
        </div>
        <p className="text-[var(--on-surface-variant)] mb-6">
          Scan part and then label to verify the match
        </p>

        <div className="grid grid-cols-[1fr_380px] gap-6 items-start">
          {/* Left: inputs */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-[140px_1fr] gap-4 items-stretch">
              <img
                src="/part-reference.jpg"
                alt="Example part label to scan"
                className="w-full h-full object-cover rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
              />
              <div className={`bg-white rounded-md border-2 transition-colors p-5 ${borderClass('part')}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-base flex items-center gap-2">
                    <span>◎</span> Part Scan
                  </span>
                  <span className="text-xs font-mono-label bg-[var(--surface-container)] text-[var(--on-surface-variant)] px-2 py-1 rounded">
                    Primary
                  </span>
                </div>
                <input
                  ref={partInputRef}
                  value={partScan}
                  onChange={(e) => setPartScan(e.target.value)}
                  onKeyDown={handlePartKeyDown}
                  placeholder="Scan or type part barcode..."
                  className="w-full h-14 px-4 border border-[var(--outline-variant)] rounded font-mono-label text-base outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-[140px_1fr] gap-4 items-stretch">
              <img
                src="/label-reference.jpg"
                alt="Example sub-component label to scan"
                className="w-full h-full object-cover rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
              />
              <div className={`bg-white rounded-md border-2 transition-colors p-5 ${borderClass('label')}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-base flex items-center gap-2">
                    <span>⬡</span> Label Scan
                  </span>
                  <span className="text-xs font-mono-label bg-[var(--surface-container)] text-[var(--on-surface-variant)] px-2 py-1 rounded">
                    Sub-component
                  </span>
                </div>
                <input
                  ref={labelInputRef}
                  value={labelScan}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  onKeyDown={handleLabelKeyDown}
                  disabled={!partScan}
                  placeholder={partScan ? 'Scan or type label barcode...' : 'Scan part first'}
                  className="w-full h-14 px-4 border border-[var(--outline-variant)] rounded font-mono-label text-base outline-none focus:border-[var(--primary)] disabled:bg-[var(--surface-container-low)] disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {status !== 'idle' && (
              <button
                onClick={reset}
                className="self-start flex items-center gap-2 px-5 py-3 bg-[var(--primary)] text-white rounded font-semibold text-sm hover:bg-[#1e293b] transition"
              >
                ↺ RESET SCAN
              </button>
            )}
          </div>

          {/* Right: status panel */}
          <div
            className={`rounded-md p-8 flex flex-col items-center justify-center text-center min-h-[420px] transition-colors ${
              status === 'idle'
                ? 'bg-white border border-[var(--outline-variant)]'
                : status === 'match'
                ? 'bg-[var(--success)]'
                : 'bg-[var(--error)]'
            }`}
          >
            {status === 'idle' && (
              <>
                <div className="w-20 h-20 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-3xl mb-5 scan-pulse">
                  ⌖
                </div>
                <h3 className="text-xl font-bold text-[var(--on-surface)] mb-2">READY TO SCAN</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Waiting for input from handheld device or keyboard entry.
                </p>
              </>
            )}
            {status === 'match' && (
              <>
                <div className="text-6xl text-white mb-4">✓</div>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-wide">MATCH</h3>
                <p className="text-sm text-white/90">Label verified against part barcode.</p>
              </>
            )}
            {status === 'mismatch' && (
              <>
                <div className="text-6xl text-white mb-4">✕</div>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-wide">MISMATCH</h3>
                <p className="text-sm text-white/90">
                  Sequence verification failed. Label does not match part barcode.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-8 bg-white rounded-md border border-[var(--outline-variant)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--outline-variant)] flex items-center justify-between">
            <span className="font-mono-label text-xs font-semibold tracking-wider text-[var(--on-surface-variant)]">
              RECENT ACTIVITY
            </span>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--on-surface-variant)]">
              Session started. No recent scans.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)]">
                  <th className="text-left px-5 py-2.5 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">TIMESTAMP</th>
                  <th className="text-left px-5 py-2.5 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">PART BARCODE</th>
                  <th className="text-left px-5 py-2.5 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">LABEL BARCODE</th>
                  <th className="text-left px-5 py-2.5 font-mono-label text-xs font-semibold text-[var(--on-surface-variant)]">RESULT</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-b last:border-b-0 border-[var(--outline-variant)]">
                    <td className="px-5 py-3 font-mono-label text-[var(--on-surface-variant)]">{r.timestamp}</td>
                    <td className="px-5 py-3 font-mono-label text-[var(--on-surface-variant)]">{r.partBarcode}</td>
                    <td className="px-5 py-3 font-mono-label">{r.labelBarcode}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-mono-label text-xs px-2 py-1 rounded font-semibold ${
                          r.result === 'MATCH'
                            ? 'bg-[var(--success-bg)] text-[var(--success-dark)]'
                            : 'bg-[var(--error-bg)] text-[var(--error)]'
                        }`}
                      >
                        {r.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
