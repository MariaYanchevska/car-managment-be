const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { validateCarCreate, validateCarUpdate } = require('../middleware/validation');

router.post('/', validateCarCreate, carController.createCar);
router.put('/:id', validateCarUpdate, carController.updateCar);
router.delete('/:id', carController.deleteCar);
router.get('/:id', carController.getCar);
router.get('/', carController.getAllCars);

module.exports = router; 