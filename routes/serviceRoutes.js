const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { validateService } = require('../middleware/validation');

router.post('/', validateService, serviceController.createService);
router.put('/:id', validateService, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.get('/:id', serviceController.getService);
router.get('/', serviceController.getAllServices);
router.get('/statistics/daily', serviceController.getServiceStatistics);

module.exports = router; 