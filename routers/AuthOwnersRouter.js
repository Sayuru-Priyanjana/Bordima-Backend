const express = require('express');
const passport = require('passport');
const router = express.Router();



router.get('/', (req, res) => {
    res.send("<button><a href='/auth/owner/auth'>Login With Google</a></button>");
});

router.get('/auth', passport.authenticate('google', { 
    scope: ['email', 'profile'],
    prompt: 'select_account' // Optional: forces account selection
}));

router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/owner/profile',
        failureRedirect: '/auth/owner/auth/callback/failure'
    })
);

router.get('/auth/callback/success', (req, res) => {
    if (!req.user) return res.redirect('/auth/owner/auth/callback/failure');
    res.send(`Welcome ${req.user.displayName} (${req.user.email})`);
});

router.get('/auth/callback/failure', (req, res) => {
    res.send("Authentication Failed. <a href='/auth/owner'>Try again</a>");
});



router.get('/profile', (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated');

    const { id, displayName } = req.user;
    const email = req.user.emails?.[0]?.value || 'No email';
    const photo = req.user.photos?.[0]?.value || '/default-avatar.jpg';

    // res.send(req.user)    full user
    res.send(`
        <h1>Profile</h1>
        <img src="${photo}" width="100" style="border-radius:50%">
        <p>ID: ${id}</p>
        <p>Name: ${displayName}</p>
        <p>Email: ${email}</p>
        <pre>${JSON.stringify(req.user._json, null, 2)}</pre>
    `);

    
});


module.exports = router;