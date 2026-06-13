const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/atendimentosController');

router.get('/metricas', ctrl.metricas);
router.get('/opcoes', ctrl.opcoes);
router.get('/exportar', ctrl.exportar);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);

module.exports = router;
