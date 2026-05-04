// server.js
// Instale as dependências antes de rodar:
// npm install express bcryptjs jsonwebtoken cors

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── Configurações ────────────────────────────────────────────
const PORT = 3000;
const JWT_SECRET = '23262311'; // Troque por uma chave forte!

// ─── Middlewares ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../front-end')));// Pasta onde ficará o login.html

// ─── Banco de dados simulado (substitua por MySQL/MongoDB etc.) ─
// Exemplo de usuário já com senha criptografada
// Senha real: "123456"
const usuarios = [
  {
    id: 1,
    nome: 'João Perosso',
    email: 'joao@email.com',
    senha: bcrypt.hashSync('123456', 10)
  }
];

// ─── Rota: Servir o login.html ─────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front-end', 'login.html'));
});

// ─── Rota: POST /api/login ─────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
  }

  // Busca o usuário pelo e-mail
  const usuario = usuarios.find(u => u.email === email.toLowerCase());

  if (!usuario) {
    return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
  }

  // Compara a senha com o hash salvo
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

  if (!senhaCorreta) {
    return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
  }

  // Gera o token JWT (válido por 1 dia)
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return res.status(200).json({
    mensagem: 'Login realizado com sucesso!',
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }
  });
});

// ─── Middleware: verificar token (use nas rotas protegidas) ──────
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
  }
}

// ─── Exemplo de rota protegida ──────────────────────────────────
app.get('/api/dashboard', autenticar, (req, res) => {
  res.json({
    mensagem: `Bem-vindo, ${req.usuario.nome}!`,
    usuario: req.usuario
  });
});

// ─── Inicia o servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});