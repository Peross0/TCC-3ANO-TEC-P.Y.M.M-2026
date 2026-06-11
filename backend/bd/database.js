import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

db.serialize(() => {

    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            telefone TEXT,
            curso TEXT
        )
    `);

    // Tabela de empresas
    db.run(`
        CREATE TABLE IF NOT EXISTS empresas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cnpj TEXT UNIQUE,
            email TEXT,
            telefone TEXT,
            endereco TEXT
        )
    `);

    // Tabela de vagas
    db.run(`
        CREATE TABLE IF NOT EXISTS vagas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            salario REAL,
            carga_horaria INTEGER,
            empresa_id INTEGER,
            FOREIGN KEY (empresa_id) REFERENCES empresas(id)
        )
    `);

    // Tabela de candidaturas
    db.run(`
        CREATE TABLE IF NOT EXISTS candidaturas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            vaga_id INTEGER,
            data_candidatura DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (vaga_id) REFERENCES vagas(id)
        )
    `);

    console.log('Tabelas criadas com sucesso!');

});

export default db;