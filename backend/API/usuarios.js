import express from "express";
import db from "../bd/database.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { nome, email, senha, telefone, curso } = req.body;

  db.run(
    `
INSERT INTO usuarios
(nome,email,senha,telefone,curso)
VALUES (?,?,?,?,?)
`,
    [nome, email, senha, telefone, curso],

    function (err) {
      if (err) return res.status(400).json(err);

      res.json({
        mensagem: "Usuário criado",
        id: this.lastID,
      });
    }
  );
});

router.get("/", (req, res) => {
  db.all("SELECT * FROM usuarios", [], (err, result) => {
    res.json(result);
  });
});

export default router;
