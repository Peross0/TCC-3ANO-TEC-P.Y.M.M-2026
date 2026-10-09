const bcrypt = require('bcrypt');
const db = require('../database/database');

const SALT_ROUNDS = 10;

// POST /cadastro
function cadastrar(req, res) {
  const { nome, email, senha, telefone, curso, cidade, estado, tipo_usuario } = req.body;

  // Validação básica de campos obrigatórios
  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha nome, email, senha e tipo de usuário.'
    });
  }

  if (!['estudante', 'empresa'].includes(tipo_usuario)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Tipo de usuário inválido.'
    });
  }

  // Validação simples de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email inválido.' });
  }

  // Verifica se o email já está cadastrado
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco de dados.' });
    }

    if (row) {
      return res.status(409).json({ sucesso: false, mensagem: 'Este email já está cadastrado.' });
    }

    // Gera o hash da senha antes de salvar
    bcrypt.hash(senha, SALT_ROUNDS, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar senha.' });
      }

      const sql = `
        INSERT INTO usuarios (nome, email, senha, telefone, curso, cidade, estado, tipo_usuario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [nome, email, hash, telefone || null, curso || null, cidade || null, estado || null, tipo_usuario];

      db.run(sql, params, function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar usuário.' });
        }

        return res.status(201).json({
          sucesso: true,
          mensagem: 'Cadastro realizado com sucesso!',
          usuario: {
            id: this.lastID,
            nome,
            email,
            tipo_usuario
          }
        });
      });
    });
  });
}

// POST /login
function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ sucesso: false, mensagem: 'Informe email e senha.' });
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco de dados.' });
    }

    if (!usuario) {
      return res.status(401).json({ sucesso: false, mensagem: 'Email ou senha incorretos.' });
    }

    bcrypt.compare(senha, usuario.senha, (err, senhaCorreta) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar senha.' });
      }

      if (!senhaCorreta) {
        return res.status(401).json({ sucesso: false, mensagem: 'Email ou senha incorretos.' });
      }

      // Não devolvemos a senha (nem o hash) na resposta
      const { senha: _senha, ...usuarioSemSenha } = usuario;

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
        usuario: usuarioSemSenha
      });
    });
  });
}

// GET /usuarios
function listar(req, res) {
  db.all(
    'SELECT id, nome, email, telefone, curso, cidade, estado, tipo_usuario, foto, created_at FROM usuarios',
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco de dados.' });
      }
      return res.status(200).json({ sucesso: true, usuarios: rows });
    }
  );
}

// GET /usuarios/:id
function buscarPorId(req, res) {
  const { id } = req.params;
  db.get(
    'SELECT id, nome, email, telefone, curso, cidade, estado, tipo_usuario, foto, created_at FROM usuarios WHERE id = ?',
    [id],
    (err, usuario) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco de dados.' });
      }
      if (!usuario) {
        return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
      }
      return res.status(200).json({ sucesso: true, usuario });
    }
  );
}

// PUT /usuarios/:id
function atualizar(req, res) {
  const { id } = req.params;
  const { nome, telefone, curso, cidade, estado, foto } = req.body;

  const sql = `
    UPDATE usuarios
    SET nome = COALESCE(?, nome),
        telefone = COALESCE(?, telefone),
        curso = COALESCE(?, curso),
        cidade = COALESCE(?, cidade),
        estado = COALESCE(?, estado),
        foto = COALESCE(?, foto)
    WHERE id = ?
  `;

  db.run(sql, [nome, telefone, curso, cidade, estado, foto, id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar usuário.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, mensagem: 'Perfil atualizado com sucesso!' });
  });
}

// DELETE /usuarios/:id
function excluir(req, res) {
  const { id } = req.params;
  db.run('DELETE FROM usuarios WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir usuário.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ sucesso: true, mensagem: 'Usuário excluído com sucesso.' });
  });
}

module.exports = { cadastrar, login, listar, buscarPorId, atualizar, excluir };
