const express  = require('express');
const mysql = require('mysql2');
const router = express.Router();
const pool = require('../config/db');
const PlaceController  = require('../controllers/PlaceController');
require('dotenv').config();


// add place
router.post('/add',PlaceController.addPlace);

// get filtered data
router.get('/places', PlaceController.getFilteredPlaces);

// get single place
router.get('/:id', PlaceController.getPlace);




module.exports = router;