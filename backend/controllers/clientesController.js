const fs = require('fs');
const path = require('path');

const CLIENTES_PATH = path.join(__dirname, '../data/clientes.json');

function load() {
  return JSON.parse(fs.readFileSync(CLIENTES_PATH, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(CLIENTES_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

exports.listar = (req, res) => {
  const clientes = load();
  const { busca } = req.query;
  if (busca) {
    const t = busca.toLowerCase();
    return res.json(clientes.filter(c =>
      c.nome.toLowerCase().includes(t) ||
      c.email.toLowerCase().includes(t) ||
      c.cpf.includes(t)
    ));
  }
  res.json(clientes);
};

exports.criar = (req, res) => {
  const { nome, email, telefone, cpf } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  const clientes = load();
  const existe = clientes.find(c => c.email === email);
  if (existe) {
    return res.status(409).json({ error: 'Email já cadastrado' });
  }

  const novo = {
    id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
    nome,
    email,
    telefone: telefone || '',
    cpf: cpf || '',
    dataCadastro: new Date().toISOString().split('T')[0],
  };

  clientes.push(novo);
  save(clientes);
  res.status(201).json(novo);
};

exports.editar = (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email, telefone, cpf } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  let clientes = load();
  const idx = clientes.findIndex(c => c.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const duplicado = clientes.find(c => c.email === email && c.id !== id);
  if (duplicado) {
    return res.status(409).json({ error: 'Email já cadastrado por outro cliente' });
  }

  clientes[idx] = { ...clientes[idx], nome, email, telefone: telefone || '', cpf: cpf || '' };
  save(clientes);
  res.json(clientes[idx]);
};

exports.deletar = (req, res) => {
  const id = parseInt(req.params.id);
  let clientes = load();
  const idx = clientes.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }
  clientes.splice(idx, 1);
  save(clientes);
  res.json({ success: true });
};
