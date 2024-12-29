const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { validateMaintenanceRequest } = require('../middleware/validation');

router.post('/', validateMaintenanceRequest, maintenanceController.createMaintenanceRequest);
router.put('/:id', validateMaintenanceRequest, maintenanceController.updateMaintenanceRequest);
router.delete('/:id', maintenanceController.deleteMaintenanceRequest);
router.get('/:id', maintenanceController.getMaintenanceRequest);
router.get('/', maintenanceController.getAllMaintenanceRequests);
router.get('/statistics/monthly', maintenanceController.getMonthlyStatistics);

module.exports = router; 