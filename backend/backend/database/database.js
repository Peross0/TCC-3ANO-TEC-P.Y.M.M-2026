const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria (ou abre, se já existir) o arquivo do banco
const dbPath = path.join(__dirname, 'conectafacil.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco SQLite em', dbPath);
  }
});

// Cria a tabela de usuários se ela ainda não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      telefone TEXT,
      curso TEXT,
      cidade TEXT,
      estado TEXT,
      tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('estudante', 'empresa')),
      foto TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
