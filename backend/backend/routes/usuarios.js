const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.post('/cadastro', usuariosController.cadastrar);
router.post('/login', usuariosController.login);
router.get('/usuarios', usuariosController.listar);
router.get('/usuarios/:id', usuariosController.buscarPorId);
router.put('/usuarios/:id', usuariosController.atualizar);
router.delete('/usuarios/:id', usuariosController.excluir);

module.exports = router;
