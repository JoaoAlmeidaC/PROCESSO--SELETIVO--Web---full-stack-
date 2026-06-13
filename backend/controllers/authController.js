const fs = require('fs');
const path = require('path');

const USERS_PATH = path.join(__dirname, '../data/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
}

exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === email && u.senha === senha);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const { senha: _, ...userSafe } = user;
  res.json({ user: userSafe, token: `token_${user.id}_${Date.now()}` });
};
