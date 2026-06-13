import { useState, useEffect } from 'react';
import Login from './components/Login';
import KPICard from './components/KPICard';
import FiltrosBar from './components/FiltrosBar';
import TabelaAtendimentos from './components/TabelaAtendimentos';
import DashboardCharts from './components/DashboardCharts';
import Clientes from './components/Clientes';
import FiltroAtivo from './components/FiltroAtivo';
import { useAtendimentos, useMetricas, useOpcoes } from './hooks/useAtendimentos';
import { exportarDados } from './utils/api';
import { exportCSV, exportPDF } from './utils/exportUtils';
import './App.css';

function formatCurrency(val) {
  return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const NAV = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'atendimentos', label: 'Atendimentos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    ),
  },
  {
    id: 'clientes', label: 'Clientes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lexUser')); } catch { return null; }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filtros, setFiltros] = useState({ page: 1, limit: 10 });
  const [kpiFiltro, setKpiFiltro] = useState(null);
  const [exporting, setExporting] = useState(null);

  const { data, pagination, loading, error } = useAtendimentos(filtros);
  const { data: metricas, loading: loadMetricas } = useMetricas();
  const opcoes = useOpcoes();

  const handleKpiClick = (statusVal, label) => {
    if (kpiFiltro === statusVal) {
      setKpiFiltro(null);
      setFiltros({ page: 1, limit: 10 });
    } else {
      setKpiFiltro(statusVal);
      setFiltros({ page: 1, limit: 10, status: statusVal });
      setActiveTab('atendimentos');
    }
  };

  const clearKpiFiltro = () => {
    setKpiFiltro(null);
    setFiltros({ page: 1, limit: 10 });
  };

  const handleExport = async (tipo) => {
    setExporting(tipo);
    try {
      const { busca, status, area, advogado, dataInicio, dataFim } = filtros;
      const res = await exportarDados({ busca, status, area, advogado, dataInicio, dataFim });
      if (tipo === 'csv') exportCSV(res.data);
      else exportPDF(res.data);
    } catch (e) {
      alert('Erro ao exportar: ' + e.message);
    } finally {
      setExporting(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('lexToken');
    localStorage.removeItem('lexUser');
    setUser(null);
  };

  if (!user) return <Login onLogin={setUser} />;

  const kpiData = metricas?.resumo;
  const kpiFiltroLabel = kpiFiltro
    ? (kpiFiltro === '__receita__' ? 'Receita Total' : kpiFiltro)
    : null;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 1v22M5 5l7-4 7 4M5 19l7 4 7-4M5 5v14M19 5v14"/>
          </svg>
          <span>LexPanel</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'nav-item--active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.nome?.[0] || 'U'}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.nome}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Sair">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{NAV.find(n => n.id === activeTab)?.label}</h1>
            <span className="topbar-sub">
              {activeTab === 'dashboard' && 'Visão geral dos atendimentos'}
              {activeTab === 'atendimentos' && `${pagination.total || 0} registros encontrados`}
              {activeTab === 'clientes' && 'Gerencie a base de clientes'}
            </span>
          </div>

          {activeTab === 'atendimentos' && (
            <div className="export-actions">
              <button className="btn btn--outline" onClick={() => handleExport('csv')} disabled={!!exporting}>
                {exporting === 'csv' ? 'Exportando…' : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Exportar CSV
                  </>
                )}
              </button>
              <button className="btn btn--primary" onClick={() => handleExport('pdf')} disabled={!!exporting}>
                {exporting === 'pdf' ? 'Exportando…' : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Exportar PDF
                  </>
                )}
              </button>
            </div>
          )}
        </header>

        <div className="content">
          <section className="kpi-grid">
            {loadMetricas ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="kpi-card kpi-skeleton" />)
            ) : kpiData ? (
              <>
                <KPICard
                  label="Total de Atendimentos"
                  value={kpiData.total}
                  accent="indigo"
                  active={kpiFiltro === null && activeTab === 'atendimentos' && !filtros.status}
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                  onClick={() => { setKpiFiltro(null); setFiltros({ page: 1, limit: 10 }); setActiveTab('atendimentos'); }}
                />
                <KPICard
                  label="Concluídos"
                  value={kpiData.concluidos}
                  sub={`${Math.round(kpiData.concluidos / kpiData.total * 100)}% do total`}
                  accent="green"
                  active={kpiFiltro === 'Concluído'}
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                  onClick={() => handleKpiClick('Concluído', 'Concluídos')}
                />
                <KPICard
                  label="Cancelados"
                  value={kpiData.cancelados}
                  sub={`${Math.round(kpiData.cancelados / kpiData.total * 100)}% do total`}
                  accent="red"
                  active={kpiFiltro === 'Cancelado'}
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                  onClick={() => handleKpiClick('Cancelado', 'Cancelados')}
                />
                <KPICard
                  label="Receita Total"
                  value={formatCurrency(kpiData.receitaTotal)}
                  sub="Atendimentos concluídos"
                  accent="amber"
                  active={kpiFiltro === 'Concluído' && filtros.status === 'Concluído'}
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                  onClick={() => handleKpiClick('Concluído', 'Receita — Concluídos')}
                />
              </>
            ) : null}
          </section>

          {activeTab === 'dashboard' && <DashboardCharts metricas={metricas} />}

          {activeTab === 'atendimentos' && (
            <section className="section-card">
              {kpiFiltroLabel && (
                <FiltroAtivo label={kpiFiltroLabel} onClear={clearKpiFiltro} />
              )}
              <FiltrosBar filtros={filtros} onChange={f => { setKpiFiltro(null); setFiltros(f); }} opcoes={opcoes} />
              <TabelaAtendimentos
                data={data}
                loading={loading}
                error={error}
                pagination={pagination}
                onPageChange={(p) => setFiltros(f => ({ ...f, page: p }))}
                onRefresh={() => setFiltros(f => ({ ...f }))}
                opcoes={opcoes}
              />
            </section>
          )}

          {activeTab === 'clientes' && (
            <section className="section-card">
              <Clientes />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
