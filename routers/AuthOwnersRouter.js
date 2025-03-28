const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/g_login', (req, res) => {
  res.send(`
    <h1>Owner Login</h1>
    <a href="/auth/owner/google">
      <button>Login with Google</button>
    </a>
  `);
});

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/owner/',
    failureRedirect: '/auth/owner/failure'
  })
);

router.get('/',async (req, res) => {
  if (!req.user) return res.redirect('/auth/owner');

  const sql = 'SELECT * FROM owners WHERE ID = ?';
  try {
    const [owners] =  await pool.query(sql,[req.user.id]);
    if(owners.length==0) return res.status(404).json({message: 'Owner not found'});
    res.json(owners[0]);

  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Internal server error'})
  }

});

router.get('/failure', (req, res) => {
  res.send(`
    <h1>Authentication Failed</h1>
    <a href="/auth/owner">Try again</a>
  `);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/auth/owner/login');
});


// register user
 router.post('/register', async (req, res)=>{
    console.log(req.body);
   const {name, email, password} = req.body;

   if(!name || !email || !password) return res.status(400).json({message: 'All fields are required'});

   const saltRounds = 10;
   

   const sql = `INSERT INTO owners (email, display_name, password) VALUES (?, ?, ?)`;
   try {
    const hashedPassword = await bcrypt.hash(password,saltRounds);
    const [result] = await pool.query(sql, [email,name,hashedPassword]);
    res.status(201).json({message: 'Owner registered successfully'});
   } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error register owner'});
   }
 });

 // login user
 router.post('/login', async (req, res)=>{
    console.log(req.body);
    const {email, password} = req.body;

    if(!email || !password) return res.status(400).json({message: 'All fields are required'});
    try {
        const sql = 'SELECT * FROM owners WHERE email = ?';
        const [owners] = await pool.query(sql, [email]);

        if(owners.length==0) return res.status(401).json({message: 'Invalid email or password'});

        const owner = owners[0];
        const isMatched = await bcrypt.compare(password,owner.password);
        if(!isMatched) return res.status(401).json({message: 'Invalid email or password'});

        // Genarate JWT token
        const token = jwt.sign({id: owner.id, email:owner.email}, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({message: 'Login successful', token});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error loging in'});
    }

 });

module.exports = router;