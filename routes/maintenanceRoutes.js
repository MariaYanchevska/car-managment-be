const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { 
    validateMaintenanceRequestCreate, 
    validateMaintenanceRequestUpdate 
} = require('../middleware/validation');


router.get('/monthlyRequestsReport', maintenanceController.getMonthlyRequestsReport);
router.get('/statistics/monthly', maintenanceController.getMonthlyStatistics);


router.post('/', validateMaintenanceRequestCreate, maintenanceController.createMaintenanceRequest);
router.put('/:id', validateMaintenanceRequestUpdate, maintenanceController.updateMaintenanceRequest);
router.delete('/:id', maintenanceController.deleteMaintenanceRequest);
router.get('/:id', maintenanceController.getMaintenanceRequest);
router.get('/', maintenanceController.getAllMaintenanceRequests);

module.exports = router; 