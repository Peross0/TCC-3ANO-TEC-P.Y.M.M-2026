const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rota raiz para teste de conexão
app.get('/', (req, res) => {
  res.json({ mensagem: 'API Conecta Fácil rodando!' });
});

// Rotas de Usuários e Empresas (Prefixo /api)
app.use('/api', usuariosRoutes);

// '0.0.0.0' para aceitar conexões da rede local / emuladores
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Conecta Fácil rodando em http://192.168.101.144:${PORT}`);
});