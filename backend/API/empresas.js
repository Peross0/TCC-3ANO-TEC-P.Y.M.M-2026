import express from "express";
import db from "../bd/database.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { nome, cnpj, email, telefone, endereco } = req.body;

  db.run(
    `
INSERT INTO empresas
(nome,cnpj,email,telefone,endereco)
VALUES(?,?,?,?,?)
`,
    [nome, cnpj, email, telefone, endereco],

    function (err) {
      if (err) return res.status(400).json(err);

      res.json({
        mensagem: "Empresa cadastrada",
        id: this.lastID,
      });
    }
  );
});

router.get("/", (req, res) => {
  db.all("SELECT * FROM empresas", [], (err, result) => {
    res.json(result);
  });
});

export default router;
