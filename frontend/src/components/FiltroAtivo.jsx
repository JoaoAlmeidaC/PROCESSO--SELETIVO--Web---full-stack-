export default function FiltroAtivo({ label, onClear }) {
  return (
    <div className="filtro-ativo-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      Mostrando: <strong>{label}</strong>
      <button className="filtro-ativo-clear" onClick={onClear}>Limpar filtro ×</button>
    </div>
  );
}
