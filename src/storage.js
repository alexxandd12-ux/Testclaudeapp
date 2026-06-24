const HISTORY_KEY = 'labelmatch_history';
const OPERATOR_KEY = 'labelmatch_operator';

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry) {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getOperator() {
  return localStorage.getItem(OPERATOR_KEY) || '';
}

export function setOperator(name) {
  localStorage.setItem(OPERATOR_KEY, name);
}

export function clearOperator() {
  localStorage.removeItem(OPERATOR_KEY);
}

export function exportHistoryToCSV(history) {
  const headers = ['Timestamp', 'Operator', 'Part Barcode (Expected)', 'Label Barcode (Scanned)', 'Result'];
  const rows = history.map(h => [
    h.timestamp,
    h.operator,
    h.partBarcode,
    h.labelBarcode,
    h.result,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scan-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
