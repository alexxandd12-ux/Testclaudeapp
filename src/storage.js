import { supabase } from './supabaseClient';

const OPERATOR_KEY = 'labelmatch_operator'; // ultimul operator ramane local, per dispozitiv — intentionat

// ---- Istoric (partajat, in Supabase) ----

function fromRow(row) {
  return {
    id: row.id,
    timestamp: row.timestamp_display,
    timestampISO: row.timestamp_iso,
    operator: row.operator,
    partBarcode: row.part_barcode,
    labelBarcode: row.label_barcode,
    result: row.result,
  };
}

function toRow(entry) {
  return {
    id: entry.id,
    timestamp_display: entry.timestamp,
    timestamp_iso: entry.timestampISO,
    operator: entry.operator,
    part_barcode: entry.partBarcode,
    label_barcode: entry.labelBarcode,
    result: entry.result,
  };
}

export async function getHistory() {
  const { data, error } = await supabase
    .from('scan_history')
    .select('*')
    .order('timestamp_iso', { ascending: false });

  if (error) {
    console.error('Eroare la citirea istoricului din Supabase:', error);
    return [];
  }
  return data.map(fromRow);
}

export async function addHistoryEntry(entry) {
  const { error } = await supabase.from('scan_history').insert(toRow(entry));

  if (error) {
    console.error('Eroare la salvarea scanarii in Supabase:', error);
  }
  return getHistory();
}

export async function clearHistory() {
  // sterge toate randurile (id-urile sunt mereu != acestei valori imposibile)
  const { error } = await supabase.from('scan_history').delete().neq('id', '__never__');
  if (error) {
    console.error('Eroare la stergerea istoricului din Supabase:', error);
  }
}

export async function deleteHistoryEntry(target) {
  if (target.id != null) {
    const { error } = await supabase.from('scan_history').delete().eq('id', target.id);
    if (error) console.error('Eroare la stergerea inregistrarii din Supabase:', error);
  } else {
    // Inregistrari vechi, fara id (migrate din localStorage) — fallback pe potrivire completa
    const { error } = await supabase
      .from('scan_history')
      .delete()
      .eq('timestamp_iso', target.timestampISO)
      .eq('operator', target.operator)
      .eq('part_barcode', target.partBarcode)
      .eq('label_barcode', target.labelBarcode)
      .eq('result', target.result);
    if (error) console.error('Eroare la stergerea inregistrarii din Supabase:', error);
  }
  return getHistory();
}

// ---- Operator curent (ramane local — fiecare statie/dispozitiv isi aminteste ultimul operator) ----

export function getOperator() {
  return localStorage.getItem(OPERATOR_KEY) || '';
}

export function setOperator(name) {
  localStorage.setItem(OPERATOR_KEY, name);
}

export function clearOperator() {
  localStorage.removeItem(OPERATOR_KEY);
}

// ---- Export CSV (neschimbat, ruleaza client-side pe datele deja incarcate) ----

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
