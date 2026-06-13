export default function FiltrosBar({ filtros, onChange, opcoes }) {
  const handle = (key) => (e) => onChange({ ...filtros, [key]: e.target.value, page: 1 });

  const handleData = (key) => (e) => {
    const novoInicio = key === 'dataInicio' ? e.target.value : (filtros.dataInicio || '');
    const novoFim   = key === 'dataFim'    ? e.target.value : (filtros.dataFim    || '');
    // Aplica sempre — se ambas preenchidas filtra o período, se uma apagada remove o filtro
    onChange({ ...filtros, [key]: e.target.value, page: 1,
      dataInicio: novoInicio, dataFim: novoFim });
  };

  return (
    <div className="filtros-bar">
      <div className="filtros-search">
        <span className="filtros-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar por cliente, advogado, área ou tipo…"
          value={filtros.busca || ''}
          onChange={handle('busca')}
          className="filtros-input filtros-input--search"
        />
      </div>

      <div className="filtros-selects">
        <select value={filtros.status || ''} onChange={handle('status')} className="filtros-select">
          <option value="">Todos os status</option>
          {opcoes.status.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={filtros.area || ''} onChange={handle('area')} className="filtros-select">
          <option value="">Todas as áreas</option>
          {opcoes.areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select value={filtros.advogado || ''} onChange={handle('advogado')} className="filtros-select">
          <option value="">Todos os advogados</option>
          {opcoes.advogados.map(a => <option key={a} value={a}>{a.replace('Dr. ', '').replace('Dra. ', '')}</option>)}
        </select>

        <div className="filtros-date-group">
          <input
            type="date"
            value={filtros.dataInicio || ''}
            onChange={handleData('dataInicio')}
            className="filtros-select"
            title="Data inicial"
            max={filtros.dataFim || ''}
          />
          <span className="filtros-date-sep">até</span>
          <input
            type="date"
            value={filtros.dataFim || ''}
            onChange={handleData('dataFim')}
            className="filtros-select"
            title="Data final"
            min={filtros.dataInicio || ''}
          />
          {(filtros.dataInicio || filtros.dataFim) && (
            <span className="filtros-date-active">● período ativo</span>
          )}
        </div>

        {(filtros.busca || filtros.status || filtros.area || filtros.advogado || filtros.dataInicio || filtros.dataFim) && (
          <button
            className="btn-clear"
            onClick={() => onChange({ page: 1, limit: filtros.limit })}
          >
            ✕ Limpar
          </button>
        )}
      </div>
    </div>
  );
}
