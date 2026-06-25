import express from 'express';
import cors from 'cors';
import db from '../bd/database.js';

const server = express();

server.use(cors());
server.use(express.json());


server.get('/', (req, res) => {
    res.send('Servidor Ligado!');
});

server.post('/cadastro', (req, res) => {

    const { nome, email, senha, telefone, curso } = req.body;

    db.run(
        `
        INSERT INTO usuarios
        (nome, email, senha, telefone, curso)
        VALUES (?, ?, ?, ?, ?)
        `,
        [nome, email, senha, telefone, curso],

        function (err) {

            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err.message
                });
            }

            return res.status(201).json({
                error: false,
                message: 'Usuário cadastrado com sucesso!',
                id: this.lastID
            });
        }
    );
});

server.post('/login', (req, res) => {

    const { email, senha } = req.body;

    db.get(
        `
        SELECT *
        FROM usuarios
        WHERE email = ? AND senha = ?
        `,
        [email, senha],

        (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }

            if (!usuario) {
                return res.status(401).json({
                    error: true,
                    message: 'Email ou senha inválidos'
                });
            }

            return res.status(200).json({
                error: false,
                message: 'Login realizado com sucesso!',
                usuario
            });
        }
    );
});

server.get('/usuarios', (req, res) => {

    db.all(
        'SELECT * FROM usuarios',
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }

            return res.status(200).json({
                error: false,
                result: rows
            });
        }
    );
});

server.get('/usuarios/:id', (req, res) => {

    const { id } = req.params;

    db.get(
        'SELECT * FROM usuarios WHERE id = ?',
        [id],

        (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }

            if (!usuario) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            return res.status(200).json({
                error: false,
                result: usuario
            });
        }
    );
});

server.delete('/usuarios/:id', (req, res) => {

    const { id } = req.params;

    db.run(
        'DELETE FROM usuarios WHERE id = ?',
        [id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: true,
                    message: 'Usuário não encontrado'
                });
            }

            return res.status(200).json({
                error: false,
                message: 'Usuário removido com sucesso!'
            });
        }
    );
});


// =====================
// INICIAR SERVIDOR
// =====================
server.listen(3000, () => {
    console.log('Servidor ON na porta 3000');
});