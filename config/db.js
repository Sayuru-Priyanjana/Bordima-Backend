const mysql = require('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',  
  database: process.env.DB_NAME || 'bodima',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const createOwnersTableQuery = `
  CREATE TABLE IF NOT EXISTS owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    place_list JSON,
    password VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;


const createPlacesTableQuery = `
  CREATE TABLE IF NOT EXISTS places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    owner_id INT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    rent DECIMAL(10,2),
    images JSON,
    gender VARCHAR(20),
    type VARCHAR(100),
    rooms INT,
    furniture BOOLEAN DEFAULT FALSE,
    members INT,
    description TEXT,
    contact VARCHAR(50),
    views INT,
    wishlist INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
  );
  
`;


const initializeDatabase = async () => {
  try {
    // Create owners table
    await pool.query(createOwnersTableQuery);
    console.log('Owners table initialized or already exists.');

    // Create places table
    await pool.query(createPlacesTableQuery);
    console.log('Places table initialized or already exists.');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

initializeDatabase();

module.exports = pool;
