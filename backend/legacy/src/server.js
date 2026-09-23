import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
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
server.post("/cadastro", async (req, res) => {
  const { nome, email, senha, telefone, curso, tipo_usuario = "estudante" } = req.body;
  const nomeNormalizado = typeof nome === "string" ? nome.trim() : "";
  const emailNormalizado = typeof email === "string" ? email.trim().toLowerCase() : "";
  const tiposValidos = ["estudante", "empresa"];

  if (!nomeNormalizado || !emailNormalizado || !senha || !tiposValidos.includes(tipo_usuario)) {
    return res.status(400).json({ sucesso: false, mensagem: "Preencha nome, email, senha e tipo de usuário válido." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    return res.status(400).json({ sucesso: false, mensagem: "Email inválido." });
  }

  if (senha.length < 6) {
    return res.status(400).json({ sucesso: false, mensagem: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    db.run(
      `INSERT INTO usuarios (nome, email, senha, telefone, curso, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)`,
      [nomeNormalizado, emailNormalizado, hash, telefone || null, curso || null, tipo_usuario],
      function (err) {
        if (err) {
          const duplicado = err.message.includes("UNIQUE constraint failed");
          return res.status(duplicado ? 409 : 500).json({
            sucesso: false,
            mensagem: duplicado ? "Este email já está cadastrado." : "Erro ao cadastrar usuário.",
          });
        }

        return res.status(201).json({
          sucesso: true,
          mensagem: "Cadastro realizado com sucesso!",
          usuario: { id: this.lastID, nome: nomeNormalizado, email: emailNormalizado, tipo_usuario },
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ sucesso: false, mensagem: "Erro ao processar senha." });
  }
});

// Login
server.post("/login", (req, res) => {
  const emailNormalizado = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const { senha } = req.body;

  if (!emailNormalizado || !senha) {
    return res.status(400).json({ sucesso: false, mensagem: "Informe email e senha." });
  }

  db.get("SELECT * FROM usuarios WHERE lower(email) = ?", [emailNormalizado], async (err, usuario) => {
    if (err) {
      return res.status(500).json({ sucesso: false, mensagem: "Erro no banco de dados." });
    }

    if (!usuario) {
      return res.status(401).json({ sucesso: false, mensagem: "Email ou senha incorretos." });
    }

    let senhaCorreta = await bcrypt.compare(senha, usuario.senha).catch(() => false);
    if (!senhaCorreta && usuario.senha === senha) {
      senhaCorreta = true;
      const hash = await bcrypt.hash(senha, 10);
      db.run("UPDATE usuarios SET senha = ? WHERE id = ?", [hash, usuario.id]);
    }
    if (!senhaCorreta) {
      return res.status(401).json({ sucesso: false, mensagem: "Email ou senha incorretos." });
    }

    const { senha: _senha, ...usuarioSemSenha } = usuario;
    return res.json({ sucesso: true, mensagem: "Login realizado com sucesso!", usuario: usuarioSemSenha });
  });
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
