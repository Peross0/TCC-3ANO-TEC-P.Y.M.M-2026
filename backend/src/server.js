import express from "express";
import cors from "cors";
import db from "../bd/database.js";

const server = express();

server.use(cors());
server.use(express.json());

// =====================
// TESTE SERVIDOR
// =====================

server.get("/", (req, res) => {
  res.send("Servidor Ligado!");
});

// =====================
// USUÁRIOS
// =====================

// Cadastro usuário
server.post("/cadastro", (req, res) => {
  const { nome, email, senha, telefone, curso } = req.body;

  db.run(
    `
        INSERT INTO usuarios
        (nome,email,senha,telefone,curso)

        VALUES(?,?,?,?,?)
        `,
    [nome, email, senha, telefone, curso],

    function (err) {
      if (err) {
        return res.status(400).json({
          error: true,
          message: err.message,
        });
      }

      res.status(201).json({
        error: false,
        message: "Usuário cadastrado!",
        id: this.lastID,
      });
    }
  );
});

// Login
server.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get(
    `
SELECT * FROM usuarios
WHERE email=? AND senha=?
`,

    [email, senha],

    (err, usuario) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: err.message,
        });
      }

      if (!usuario) {
        return res.status(401).json({
          error: true,
          message: "Email ou senha inválidos",
        });
      }

      res.json({
        error: false,
        message: "Login realizado!",
        usuario,
      });
    }
  );
});

// Listar usuários

server.get("/usuarios", (req, res) => {
  db.all(
    "SELECT * FROM usuarios",

    [],

    (err, rows) => {
      res.json({
        error: false,
        result: rows,
      });
    }
  );
});

// Buscar usuário

server.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT * FROM usuarios WHERE id=?",

    [id],

    (err, row) => {
      if (!row) {
        return res.status(404).json({
          message: "Usuário não encontrado",
        });
      }

      res.json(row);
    }
  );
});

// Deletar usuário

server.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM usuarios WHERE id=?",

    [id],

    function (err) {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Usuário removido!",
      });
    }
  );
});

// =====================
// EMPRESAS
// =====================

server.post("/empresas", (req, res) => {
  const { nome, cnpj, email, telefone, endereco } = req.body;

  db.run(
    `
INSERT INTO empresas

(nome,cnpj,email,telefone,endereco)

VALUES(?,?,?,?,?)

`,

    [nome, cnpj, email, telefone, endereco],

    function (err) {
      if (err) {
        return res.status(400).json(err);
      }

      res.json({
        message: "Empresa cadastrada!",
        id: this.lastID,
      });
    }
  );
});

server.get("/empresas", (req, res) => {
  db.all(
    "SELECT * FROM empresas",

    [],

    (err, rows) => {
      res.json(rows);
    }
  );
});

// =====================
// VAGAS
// =====================

server.post("/vagas", (req, res) => {
  const { empresa_id, titulo, descricao, requisitos } = req.body;

  db.run(
    `

INSERT INTO vagas

(empresa_id,titulo,descricao,requisitos)

VALUES(?,?,?,?)

`,

    [empresa_id, titulo, descricao, requisitos],

    function (err) {
      if (err) {
        return res.status(400).json(err);
      }

      res.json({
        message: "Vaga criada!",
        id: this.lastID,
      });
    }
  );
});

server.get("/vagas", (req, res) => {
  db.all(
    `

SELECT

vagas.id,
vagas.titulo,
vagas.descricao,
vagas.requisitos,
empresas.nome AS empresa


FROM vagas


INNER JOIN empresas

ON empresas.id = vagas.empresa_id


`,

    [],

    (err, rows) => {
      res.json(rows);
    }
  );
});

// =====================
// CANDIDATURAS
// =====================

server.post("/candidaturas", (req, res) => {
  const { usuario_id, vaga_id } = req.body;

  db.run(
    `

INSERT INTO candidaturas

(usuario_id,vaga_id)

VALUES(?,?)

`,

    [usuario_id, vaga_id],

    function (err) {
      if (err) {
        return res.status(400).json(err);
      }

      res.json({
        message: "Candidatura enviada!",
        id: this.lastID,
      });
    }
  );
});

server.get("/candidaturas", (req, res) => {
  db.all(
    `

SELECT

usuarios.nome AS candidato,

vagas.titulo AS vaga,

candidaturas.status


FROM candidaturas


INNER JOIN usuarios

ON usuarios.id = candidaturas.usuario_id



INNER JOIN vagas

ON vagas.id = candidaturas.vaga_id


`,

    [],

    (err, rows) => {
      res.json(rows);
    }
  );
});

// =====================
// INICIAR SERVIDOR
// =====================

server.listen(3000, () => {
  console.log("Servidor ON na porta 3000");
});
