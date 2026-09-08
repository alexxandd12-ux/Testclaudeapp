-- Tabel pentru istoricul de scanări, partajat între toți utilizatorii aplicației
create table if not exists scan_history (
  id text primary key,
  created_at timestamptz not null default now(),
  timestamp_display text not null,
  timestamp_iso timestamptz not null,
  operator text not null,
  part_barcode text not null,
  label_barcode text not null,
  result text not null check (result in ('MATCH', 'MISMATCH'))
);

-- Index pentru sortare rapidă (cele mai recente primele)
create index if not exists scan_history_timestamp_idx on scan_history (timestamp_iso desc);

-- Row Level Security: activat, dar cu politici deschise
-- (aplicația nu are autentificare de utilizator, deci accesul e public prin anon key)
alter table scan_history enable row level security;

create policy "Public read access"
  on scan_history for select
  using (true);

create policy "Public insert access"
  on scan_history for insert
  with check (true);

create policy "Public delete access"
  on scan_history for delete
  using (true);
