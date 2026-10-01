const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const empresasController = require('../controllers/empresasController');

// Rotas de Usuários
router.post('/cadastro', usuariosController.cadastrar);
router.post('/login', usuariosController.login);
router.get('/usuarios', usuariosController.listar);
router.get('/usuarios/:id', usuariosController.buscarPorId);
router.put('/usuarios/:id', usuariosController.atualizar);
router.delete('/usuarios/:id', usuariosController.excluir);

// Rotas de Empresas e Vagas
router.post('/empresas', empresasController.cadastrar);
router.get('/empresas', empresasController.listar);
router.get('/empresas/:id/visualizacoes', empresasController.listarVisualizacoes);
router.post('/empresas/:id/visualizacoes', empresasController.registrarVisualizacao);
router.put('/empresas/:id', empresasController.atualizar);
router.post('/empresas/:id/vagas', empresasController.cadastrarVaga);
router.get('/empresas/:id/vagas', empresasController.listarVagas);
router.get('/vagas', empresasController.listarTodasVagas);

module.exports = router;