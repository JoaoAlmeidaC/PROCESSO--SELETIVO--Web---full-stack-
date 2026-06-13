import { useState, useEffect, useRef } from 'react';
import { getClientes, criarCliente, editarCliente, deletarCliente } from '../utils/api';

function ConfirmModal({ nome, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon modal-icon--danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 className="modal-title">Remover cliente</h3>
        <p className="modal-text">Tem certeza que deseja remover <strong>{nome}</strong>? Esta ação não pode ser desfeita.</p>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn--danger" onClick={onConfirm}>Sim, remover</button>
        </div>
      </div>
    </div>
  );
}

function NovoClienteModal({ onSave, onCancel }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const firstRef = useRef();

  useEffect(() => { firstRef.current?.focus(); }, []);

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const novo = await criarCliente(form);
      onSave(novo);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal--wide">
        <h3 className="modal-title">Novo cliente</h3>
        <form onSubmit={submit} className="modal-form">
          <div className="modal-fields">
            <div className="field-group">
              <label className="field-label">Nome completo *</label>
              <input ref={firstRef} className="field-input" value={form.nome} onChange={handle('nome')} placeholder="Ex: Maria Souza" required />
            </div>
            <div className="field-group">
              <label className="field-label">E-mail *</label>
              <input type="email" className="field-input" value={form.email} onChange={handle('email')} placeholder="email@exemplo.com" required />
            </div>
            <div className="field-group">
              <label className="field-label">Telefone</label>
              <input className="field-input" value={form.telefone} onChange={handle('telefone')} placeholder="(61) 99999-0000" />
            </div>
            <div className="field-group">
              <label className="field-label">CPF</label>
              <input className="field-input" value={form.cpf} onChange={handle('cpf')} placeholder="000.000.000-00" />
            </div>
          </div>
          {erro && <div className="login-erro">{erro}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Salvando…' : 'Cadastrar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditarClienteModal({ cliente, onSave, onCancel }) {
  const [form, setForm] = useState({
    nome: cliente.nome || '',
    email: cliente.email || '',
    telefone: cliente.telefone || '',
    cpf: cliente.cpf || '',
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const firstRef = useRef();

  useEffect(() => { firstRef.current?.focus(); }, []);

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const atualizado = await editarCliente(cliente.id, form);
      onSave(atualizado);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao editar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal--wide">
        <h3 className="modal-title">Editar cliente</h3>
        <form onSubmit={submit} className="modal-form">
          <div className="modal-fields">
            <div className="field-group">
              <label className="field-label">Nome completo *</label>
              <input ref={firstRef} className="field-input" value={form.nome} onChange={handle('nome')} placeholder="Ex: Maria Souza" required />
            </div>
            <div className="field-group">
              <label className="field-label">E-mail *</label>
              <input type="email" className="field-input" value={form.email} onChange={handle('email')} placeholder="email@exemplo.com" required />
            </div>
            <div className="field-group">
              <label className="field-label">Telefone</label>
              <input className="field-input" value={form.telefone} onChange={handle('telefone')} placeholder="(61) 99999-0000" />
            </div>
            <div className="field-group">
              <label className="field-label">CPF</label>
              <input className="field-input" value={form.cpf} onChange={handle('cpf')} placeholder="000.000.000-00" />
            </div>
          </div>
          {erro && <div className="login-erro">{erro}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNovo, setShowNovo] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const debounce = useRef();

  const carregar = async (b = '') => {
    setLoading(true);
    try {
      const data = await getClientes(b);
      setClientes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleBusca = (e) => {
    const v = e.target.value;
    setBusca(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => carregar(v), 350);
  };

  const handleSave = (novo) => {
    setClientes(c => [...c, novo]);
    setShowNovo(false);
  };

  const handleEdit = (atualizado) => {
    setClientes(c => c.map(x => x.id === atualizado.id ? atualizado : x));
    setEditando(null);
  };

  const handleDelete = async () => {
    if (!confirmar) return;
    await deletarCliente(confirmar.id);
    setClientes(c => c.filter(x => x.id !== confirmar.id));
    setConfirmar(null);
  };

  return (
    <div className="clientes-page">
      {showNovo && <NovoClienteModal onSave={handleSave} onCancel={() => setShowNovo(false)} />}
      {editando && <EditarClienteModal cliente={editando} onSave={handleEdit} onCancel={() => setEditando(null)} />}
      {confirmar && <ConfirmModal nome={confirmar.nome} onConfirm={handleDelete} onCancel={() => setConfirmar(null)} />}

      <div className="clientes-header">
        <div className="filtros-search" style={{ flex: 1 }}>
          <span className="filtros-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            className="filtros-input"
            placeholder="Buscar por nome, e-mail ou CPF…"
            value={busca}
            onChange={handleBusca}
          />
        </div>
        <button className="btn btn--primary" onClick={() => setShowNovo(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo cliente
        </button>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>CPF</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-skeleton-row">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" /></td>)}
                </tr>
              ))
            ) : clientes.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">Nenhum cliente encontrado.</td></tr>
            ) : (
              clientes.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-id">{c.id}</td>
                  <td className="table-name">{c.nome}</td>
                  <td className="table-adv">{c.email}</td>
                  <td className="table-tipo">{c.telefone || '—'}</td>
                  <td className="table-tipo">{c.cpf || '—'}</td>
                  <td className="table-date">{c.dataCadastro?.split('-').reverse().join('/')}</td>
                  <td>
                    <div className="acoes-cell">
                      <button className="btn-edit" onClick={() => setEditando(c)} title="Editar cliente">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="btn-delete" onClick={() => setConfirmar(c)} title="Remover cliente">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="clientes-footer">
        {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
