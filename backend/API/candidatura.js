import express from "express";
import db from "../bd/database.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { usuario_id, vaga_id } = req.body;

  db.run(
    `
INSERT INTO candidaturas
(usuario_id,vaga_id)
VALUES(?,?)
`,

    [usuario_id, vaga_id],

    function (err) {
      if (err) return res.status(400).json(err);

      res.json({
        mensagem: "Candidatura enviada",
        id: this.lastID,
      });
    }
  );
});

router.get("/", (req, res) => {
  db.all(
    `
SELECT

usuarios.nome,
vagas.titulo,
candidaturas.status


FROM candidaturas


JOIN usuarios

ON usuarios.id=candidaturas.usuario_id


JOIN vagas

ON vagas.id=candidaturas.vaga_id

`,

    [],

    (err, result) => {
      res.json(result);
    }
  );
});

export default router;
