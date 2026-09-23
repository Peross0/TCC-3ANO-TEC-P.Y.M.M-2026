const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/', usuariosRoutes);

// Rota raiz só pra confirmar que a API está no ar
app.get('/', (req, res) => {
  res.json({ mensagem: 'API Conecta Fácil rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
