import { useState } from 'react';
import { login } from '../utils/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const data = await login(email, senha);
      localStorage.setItem('lexToken', data.token);
      localStorage.setItem('lexUser', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand-mark">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 1v22M5 5l7-4 7 4M5 19l7 4 7-4M5 5v14M19 5v14"/>
            </svg>
          </div>
          <h1 className="login-hero">Resende Mori Hutchison Advogados Associados</h1>
          <p className="login-hero-sub">
            Visualize atendimentos, acompanhe receitas e gerencie clientes em um único painel.
          </p>
          <div className="login-stats">
            <div className="login-stat">
              <span className="login-stat-value">500+</span>
              <span className="login-stat-label">Atendimentos</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">8</span>
              <span className="login-stat-label">Advogados</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">8</span>
              <span className="login-stat-label">Áreas jurídicas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-box-header">
            <div className="login-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 1v22M5 5l7-4 7 4M5 19l7 4 7-4M5 5v14M19 5v14"/>
              </svg>
            </div>
            <span className="login-logo-name">LexPanel</span>
          </div>

          <h2 className="login-title">Entrar na sua conta</h2>
          <p className="login-subtitle">Acesso restrito a usuários autorizados.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">E-mail</label>
              <input
                type="email"
                className="field-input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">Senha</label>
              <div className="field-password">
                <input
                  type={showSenha ? 'text' : 'password'}
                  className="field-input field-input--password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
                <button type="button" className="toggle-senha" onClick={() => setShowSenha(v => !v)}>
                  {showSenha ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {erro && <div className="login-erro">{erro}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : 'Entrar'}
            </button>
          </form>

          <div className="login-hint">
            <p>Acesso de demonstração:</p>
            <code>admin@lexPanel.com / admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
