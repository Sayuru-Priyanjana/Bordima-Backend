const express  = require('express');
const mysql = require('mysql2');
const router = express.Router();
const pool = require('../config/db');
require('dotenv').config();

