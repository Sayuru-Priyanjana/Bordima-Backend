const pool = require('../config/db');
const mysql = require('mysql2');
const express = require('express');


exports.addPlace = async (req, res)=>{
    console.log(req.body);

    try {
        const { name, owner_id, latitude, longitude, rent, images, gender, type, rooms, furniture, members, description, contact } = req.body;

        if (!owner_id || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = `
        INSERT INTO places (name, owner_id, latitude, longitude, rent, images, gender, type, rooms, furniture, members, description, contact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [name, owner_id, latitude, longitude, rent, JSON.stringify(images), gender, type, rooms, furniture, members, description, contact];
        const [result] = await pool.query(query, values);

        res.status(201).json({message: 'Place added successfully', placeId: result.insertId});


    } catch (error) {
        console.error('Error adding place:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getPlace = async ({ params: { id } }, res)=>{
    
    try {
        const place_id = parseInt(id, 10);
        const sql = 'SELECT * FROM places WHERE id = ?';
        
        
        const [places] = await pool.query(sql, [place_id]);
        if(places.length==0) return res.status(404).json({message:'Place not found'});
        const place = places[0];

        res.status(200).json(place);

    } catch (error) {
        console.error('Error get place:', error);
        res.status(500).json({message:'Internal server error'})
    }
};


exports.getFilteredPlaces = async (req, res) => {
    try {
        const { id,gender, type, minRent, maxRent } = req.query;

        let query = 'SELECT * FROM places WHERE 1=1';
        let values = [];

        if(id){
            query += ' AND id = ?';
            values.push(parseInt(id, 10));
        }

        if (gender) {
            query += ' AND gender = ?';
            values.push(gender);
        }
        if (type) {
            query += ' AND type = ?';
            values.push(type);
        }
        if (minRent) {
            query += ' AND rent >= ?';
            values.push(parseFloat(minRent));
        }
        if (maxRent) {
            query += ' AND rent <= ?';
            values.push(parseFloat(maxRent));
        }

        const [rows] = await pool.query(query, values);

        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching places:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};