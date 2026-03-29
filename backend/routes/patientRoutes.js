const express = require('express');
const router = express.Router();
const { savePatient, getAllPatients, getPatientByUser } = require('../controllers/patientController');

router.post('/', savePatient);
router.get('/', getAllPatients);
router.get('/:userId', getPatientByUser);

module.exports = router;
