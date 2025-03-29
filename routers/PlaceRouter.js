const express  = require('express');
const mysql = require('mysql2');
const router = express.Router();
const pool = require('../config/db');
const PlaceController  = require('../controllers/PlaceController');
require('dotenv').config();


// add place
router.post('/add',PlaceController.addPlace);

// get filtered data
router.get('/', PlaceController.getFilteredPlaces);

// get single place
router.get('/:id', PlaceController.getPlace);

// delete place
router.delete('/', PlaceController.deletePlace);

// update place
router.patch('/', PlaceController.updatePlace);






module.exports = router;