const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientesController');

router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.editar);
router.delete('/:id', ctrl.deletar);

module.exports = router;
