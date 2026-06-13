import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { criarAtendimento, editarAtendimento } from '../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatCurrency(val) {
  if (!val) return '—';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_OPTIONS = ['Agendado', 'Em Andamento', 'Concluído', 'Cancelado'];
const AREA_OPTIONS = ['Civil', 'Criminal', 'Família', 'Previdenciário', 'Trabalhista', 'Tributário', 'Administrativo', 'Ambiental', 'Empresarial'];
const TIPO_OPTIONS = ['Consulta', 'Audiência', 'Acordo', 'Perícia', 'Petição', 'Recurso', 'Contrato', 'Outro'];

const FORM_EMPTY = {
  cliente: '',
  advogado: '',
  area: '',
  tipo: '',
  status: 'Agendado',
  data: '',
  hora: '',
  valor: '',
  observacoes: '',
};

function AtendimentoModal({ inicial, onClose, onSaved, opcoes }) {
  const isEdit = !!inicial?.id;
  const [form, setForm] = useState(
    isEdit
      ? { ...inicial, valor: inicial.valor ? String(inicial.valor) : '' }
      : FORM_EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const advogadoOpts = opcoes?.advogados?.length ? opcoes.advogados : [];
  const areaOpts = opcoes?.areas?.length ? opcoes.areas : AREA_OPTIONS;

  const handleSubmit = async () => {
    if (!form.cliente.trim()) return setErro('Informe o nome do cliente.');
    if (!form.advogado.trim()) return setErro('Selecione o advogado.');
    if (!form.area) return setErro('Selecione a área.');
    if (!form.tipo) return setErro('Selecione o tipo.');
    if (!form.status) return setErro('Selecione o status.');
    if (!form.data) return setErro('Informe a data.');
    if (!form.hora) return setErro('Informe o horário.');

    setErro('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        valor: form.valor !== '' ? parseFloat(form.valor.toString().replace(',', '.')) : 0,
      };
      if (isEdit) {
        await editarAtendimento(inicial.id, payload);
      } else {
        await criarAtendimento(payload);
      }
      onSaved();
    } catch (e) {
      setErro(e.response?.data?.error || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Editar Atendimento' : 'Novo Atendimento'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-field modal-field--full">
              <label className="modal-label">Cliente *</label>
              <input
                className="modal-input"
                type="text"
                placeholder="Nome do cliente"
                value={form.cliente}
                onChange={e => set('cliente', e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Advogado *</label>
              {advogadoOpts.length > 0 ? (
                <select className="modal-input" value={form.advogado} onChange={e => set('advogado', e.target.value)}>
                  <option value="">Selecionar…</option>
                  {advogadoOpts.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Nome do advogado"
                  value={form.advogado}
                  onChange={e => set('advogado', e.target.value)}
                />
              )}
            </div>

            <div className="modal-field">
              <label className="modal-label">Área *</label>
              <select className="modal-input" value={form.area} onChange={e => set('area', e.target.value)}>
                <option value="">Selecionar…</option>
                {areaOpts.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Tipo *</label>
              <select className="modal-input" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option value="">Selecionar…</option>
                {TIPO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Status *</label>
              <select className="modal-input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Data *</label>
              <input
                className="modal-input"
                type="date"
                value={form.data}
                onChange={e => set('data', e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Horário *</label>
              <input
                className="modal-input"
                type="time"
                value={form.hora}
                onChange={e => set('hora', e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Valor (R$)</label>
              <input
                className="modal-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.valor}
                onChange={e => set('valor', e.target.value)}
              />
            </div>

            <div className="modal-field modal-field--full">
              <label className="modal-label">Observações</label>
              <textarea
                className="modal-input modal-textarea"
                placeholder="Ex: Número do processo, detalhes adicionais…"
                value={form.observacoes}
                onChange={e => set('observacoes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {erro && <p className="modal-erro">{erro}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn btn--outline" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TabelaAtendimentos({ data, loading, error, pagination, onPageChange, onRefresh, opcoes }) {
  const [modal, setModal] = useState(null); // null | { mode: 'new' } | { mode: 'edit', item }

  const handleSaved = () => {
    setModal(null);
    if (onRefresh) onRefresh();
  };

  if (error) {
    return (
      <div className="table-state table-state--error">
        <span>⚠️ {error}</span>
      </div>
    );
  }

  return (
    <>
      {modal && (
        <AtendimentoModal
          inicial={modal.mode === 'edit' ? modal.item : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          opcoes={opcoes}
        />
      )}

      <div className="table-toolbar">
        <button
          className="btn btn--primary"
          onClick={() => setModal({ mode: 'new' })}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Atendimento
        </button>
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Advogado</th>
                <th>Área</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="table-skeleton-row">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j}><div className="skeleton" /></td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="table-empty">
                    Nenhum atendimento encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                data.map(a => (
                  <tr key={a.id} className="table-row">
                    <td className="table-id">{a.id}</td>
                    <td className="table-name">{a.cliente}</td>
                    <td className="table-adv">{a.advogado}</td>
                    <td><span className="area-tag">{a.area}</span></td>
                    <td className="table-tipo">{a.tipo}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="table-date">{formatDate(a.data)}</td>
                    <td className="table-hora">{a.hora}</td>
                    <td className="table-valor">{formatCurrency(a.valor)}</td>
                    <td className="table-actions">
                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() => setModal({ mode: 'edit', item: a })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
            </span>
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >‹ Anterior</button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let p;
                if (pagination.totalPages <= 5) {
                  p = i + 1;
                } else if (pagination.page <= 3) {
                  p = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  p = pagination.totalPages - 4 + i;
                } else {
                  p = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={p}
                    className={`page-btn page-btn--num ${p === pagination.page ? 'page-btn--active' : ''}`}
                    onClick={() => onPageChange(p)}
                  >{p}</button>
                );
              })}

              <button
                className="page-btn"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >Próxima ›</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
