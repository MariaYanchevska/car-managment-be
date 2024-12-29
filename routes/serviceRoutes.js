const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { validateService } = require('../middleware/validation');


router.get('/dailyAvailabilityReport', serviceController.getServiceStatistics);


router.post('/', validateService, serviceController.createService);
router.put('/:id', validateService, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.get('/:id', serviceController.getService);
router.get('/', serviceController.getAllServices);

module.exports = router; 