import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('lexToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email, senha) =>
  api.post('/auth/login', { email, senha }).then(r => r.data);

export const getMetricas = () =>
  api.get('/atendimentos/metricas').then(r => r.data);

export const getAtendimentos = (params = {}) =>
  api.get('/atendimentos', { params }).then(r => r.data);

export const getOpcoes = () =>
  api.get('/atendimentos/opcoes').then(r => r.data);

export const exportarDados = (params = {}) =>
  api.get('/atendimentos/exportar', { params }).then(r => r.data);

export const criarAtendimento = (dados) =>
  api.post('/atendimentos', dados).then(r => r.data);

export const editarAtendimento = (id, dados) =>
  api.put(`/atendimentos/${id}`, dados).then(r => r.data);

export const getClientes = (busca = '') =>
  api.get('/clientes', { params: busca ? { busca } : {} }).then(r => r.data);

export const criarCliente = (dados) =>
  api.post('/clientes', dados).then(r => r.data);

export const editarCliente = (id, dados) =>
  api.put(`/clientes/${id}`, dados).then(r => r.data);

export const deletarCliente = (id) =>
  api.delete(`/clientes/${id}`).then(r => r.data);

export default api;
