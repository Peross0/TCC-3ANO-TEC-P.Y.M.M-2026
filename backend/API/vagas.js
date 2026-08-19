import express from "express";
import db from "../bd/database.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { empresa_id, titulo, descricao, requisitos } = req.body;

  db.run(
    `
INSERT INTO vagas
(empresa_id,titulo,descricao,requisitos)
VALUES(?,?,?,?)
`,
    [empresa_id, titulo, descricao, requisitos],

    function (err) {
      if (err) return res.status(400).json(err);

      res.json({
        mensagem: "Vaga criada",
        id: this.lastID,
      });
    }
  );
});

router.get("/", (req, res) => {
  db.all(
    `
SELECT 
vagas.*,
empresas.nome AS empresa

FROM vagas

JOIN empresas

ON empresas.id=vagas.empresa_id

`,
    [],
    (err, result) => {
      res.json(result);
    }
  );
});

export default router;
