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

exports.deletePlace = async (req, res) => {
    try {
        
        const placeId = parseInt(req.query.id, 10);
        
        if (isNaN(placeId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const sql = 'DELETE FROM places WHERE id = ?';
        const [result] = await pool.query(sql, [placeId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }

        res.status(200).json({ message: 'Place deleted successfully' });
    } catch (error) {
        console.error('Error deleting place:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updatePlace = async (req, res) => {
    try {
        const placeId = parseInt(req.query.id, 10);
        if (isNaN(placeId)) {
            return res.status(400).json({ message: 'Invalid place ID' });
        }

        const {
            name,
            latitude,
            longitude,
            rent,
            images,
            gender,
            type,
            rooms,
            furniture,
            members,
            description,
            contact,
            views,
            wishlist
        } = req.query;

        
        let sql = 'UPDATE places SET ';
        const values = [];

        if (name) {
            sql += 'name = ?, ';
            values.push(name);
        }
        if (latitude) {
            sql += 'latitude = ?, ';
            values.push(parseFloat(latitude));
        }
        if (longitude) {
            sql += 'longitude = ?, ';
            values.push(parseFloat(longitude));
        }
        if (rent) {
            sql += 'rent = ?, ';
            values.push(parseFloat(rent));
        }
        if (images) {
            sql += 'images = ?, ';
            values.push(images); 
        }
        if (gender) {
            sql += 'gender = ?, ';
            values.push(gender);
        }
        if (type) {
            sql += 'type = ?, ';
            values.push(type);
        }
        if (rooms) {
            sql += 'rooms = ?, ';
            values.push(parseInt(rooms, 10));
        }
        if (furniture !== undefined) {
            sql += 'furniture = ?, ';
            values.push(furniture === 'true' || furniture === true);
        }
        if (members) {
            sql += 'members = ?, ';
            values.push(parseInt(members, 10));
        }
        if (description) {
            sql += 'description = ?, ';
            values.push(description);
        }
        if (contact) {
            sql += 'contact = ?, ';
            values.push(contact);
        }
        if (views) {
            sql += 'views = ?, ';
            values.push(parseInt(views, 10));
        }
        if (wishlist) {
            sql += 'wishlist = ?, ';
            values.push(parseInt(wishlist, 10));
        }

        
        if (values.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        
        sql = sql.slice(0, -2) + ' WHERE id = ?';
        values.push(placeId);

        
        const [result] = await pool.query(sql, values);

        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Place not found or no changes made' });
        }

        res.status(200).json({ message: 'Place updated successfully' });
    } catch (error) {
        console.error('Error updating place:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

