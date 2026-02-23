const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/', vehicleController.getAllVehicles);
router.post('/', vehicleController.saveVehicle);
router.delete('/', vehicleController.deleteVehicle);

// server/routes/vehicles.js
router.get('/available', vehicleController.getAvailableVehicles);

router.get('/management-settings', vehicleController.getManagementSettings);

router.post('/management-settings', vehicleController.saveManagementSettings);
module.exports = router;