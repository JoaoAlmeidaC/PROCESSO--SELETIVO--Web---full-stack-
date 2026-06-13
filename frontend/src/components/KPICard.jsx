export default function KPICard({ label, value, sub, accent, icon, onClick, active }) {
  return (
    <button
      className={`kpi-card kpi-card--${accent}${onClick ? ' kpi-card--clickable' : ''}${active ? ' kpi-card--active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <span className="kpi-value">{value}</span>
        <span className="kpi-label">{label}</span>
        {sub && <span className="kpi-sub">{sub}</span>}
      </div>
      {onClick && (
        <div className="kpi-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      )}
    </button>
  );
}
