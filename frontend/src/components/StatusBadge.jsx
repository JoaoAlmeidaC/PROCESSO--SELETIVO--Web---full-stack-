const STATUS_MAP = {
  'Concluído':    { cls: 'badge--green',  label: 'Concluído' },
  'Cancelado':    { cls: 'badge--red',    label: 'Cancelado' },
  'Agendado':     { cls: 'badge--blue',   label: 'Agendado' },
  'Em Andamento': { cls: 'badge--amber',  label: 'Em Andamento' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { cls: 'badge--gray', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}
