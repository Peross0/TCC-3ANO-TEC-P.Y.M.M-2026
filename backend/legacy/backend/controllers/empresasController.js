const db = require('../database/database');

function cadastrar(req, res) {
  const { nome, cnpj, email, telefone, endereco } = req.body;

  if (!nome || !cnpj || !email || !telefone || !endereco) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha nome, CNPJ, e-mail, telefone e endereço.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ sucesso: false, mensagem: 'E-mail inválido.' });
  }

  db.get('SELECT id FROM empresas WHERE cnpj = ? OR email = ?', [cnpj, email], (err, empresaExistente) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco de dados.' });
    }

    if (empresaExistente) {
      return res.status(409).json({ sucesso: false, mensagem: 'Já existe uma empresa com este CNPJ ou e-mail.' });
    }

    const sql = `
      INSERT INTO empresas (nome, cnpj, email, telefone, endereco)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [nome.trim(), cnpj.trim(), email.trim().toLowerCase(), telefone.trim(), endereco.trim()], function (insertError) {
      if (insertError) {
        console.error(insertError);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar empresa.' });
      }

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Empresa cadastrada com sucesso!',
        empresa: { id: this.lastID, nome, cnpj, email, telefone, endereco },
      });
    });
  });
}

function listar(req, res) {
  const sql = `
    SELECT empresas.*,
      COUNT(empresa_visualizacoes.id) AS visualizacoes
    FROM empresas
    LEFT JOIN empresa_visualizacoes ON empresa_visualizacoes.empresa_id = empresas.id
    GROUP BY empresas.id
    ORDER BY empresas.created_at DESC
  `;

  db.all(sql, [], (err, empresas) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar empresas.' });
    }
    return res.status(200).json({ sucesso: true, empresas });
  });
}

function listarVisualizacoes(req, res) {
  const { id } = req.params;
  const sql = `
    SELECT id, usuario_nome, usuario_email, visualizado_em
    FROM empresa_visualizacoes
    WHERE empresa_id = ?
    ORDER BY visualizado_em DESC
  `;

  db.all(sql, [id], (err, visualizacoes) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar visualizações.' });
    }
    return res.status(200).json({ sucesso: true, visualizacoes });
  });
}

function registrarVisualizacao(req, res) {
  const { id } = req.params;
  const { usuario_nome, usuario_email } = req.body;

  db.get('SELECT id FROM empresas WHERE id = ?', [id], (err, empresa) => {
    if (err) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco de dados.' });
    }
    if (!empresa) {
      return res.status(404).json({ sucesso: false, mensagem: 'Empresa não encontrada.' });
    }

    db.run(
      'INSERT INTO empresa_visualizacoes (empresa_id, usuario_nome, usuario_email) VALUES (?, ?, ?)',
      [id, usuario_nome || 'Candidato não identificado', usuario_email || null],
      function (insertError) {
        if (insertError) {
          console.error(insertError);
          return res.status(500).json({ sucesso: false, mensagem: 'Erro ao registrar visualização.' });
        }
        return res.status(201).json({ sucesso: true, visualizacao_id: this.lastID });
      }
    );
  });
}

function atualizar(req, res) {
  const { id } = req.params;
  const { nome, cnpj, email, telefone, endereco } = req.body;

  if (!nome || !cnpj || !email || !telefone || !endereco) {
    return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os dados da empresa.' });
  }

  db.run(
    `UPDATE empresas SET nome = ?, cnpj = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?`,
    [nome.trim(), cnpj.trim(), email.trim().toLowerCase(), telefone.trim(), endereco.trim(), id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(409).json({ sucesso: false, mensagem: 'CNPJ ou e-mail já utilizado por outra empresa.' });
      }
      if (!this.changes) {
        return res.status(404).json({ sucesso: false, mensagem: 'Empresa não encontrada.' });
      }
      return res.status(200).json({ sucesso: true, mensagem: 'Empresa atualizada com sucesso.' });
    }
  );
}

function cadastrarVaga(req, res) {
  const { id } = req.params;
  const { titulo, descricao, requisitos } = req.body;

  if (!titulo || !descricao || !requisitos) {
    return res.status(400).json({ sucesso: false, mensagem: 'Preencha título, descrição e requisitos da vaga.' });
  }

  db.run(
    'INSERT INTO vagas (empresa_id, titulo, descricao, requisitos) VALUES (?, ?, ?, ?)',
    [id, titulo.trim(), descricao.trim(), requisitos.trim()],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar vaga.' });
      }
      return res.status(201).json({ sucesso: true, vaga: { id: this.lastID, empresa_id: id, titulo, descricao, requisitos } });
    }
  );
}

function listarVagas(req, res) {
  db.all(
    'SELECT * FROM vagas WHERE empresa_id = ? ORDER BY created_at DESC',
    [req.params.id],
    (err, vagas) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar vagas.' });
      }
      return res.status(200).json({ sucesso: true, vagas });
    }
  );
}

function listarTodasVagas(req, res) {
  db.all(
    `SELECT vagas.*, empresas.nome AS empresa_nome, empresas.endereco AS empresa_endereco
     FROM vagas
     INNER JOIN empresas ON empresas.id = vagas.empresa_id
     ORDER BY vagas.created_at DESC`,
    [],
    (err, vagas) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar vagas.' });
      }
      return res.status(200).json({ sucesso: true, vagas });
    }
  );
}

module.exports = {
  cadastrar,
  listar,
  listarVisualizacoes,
  registrarVisualizacao,
  atualizar,
  cadastrarVaga,
  listarVagas,
  listarTodasVagas,
};
