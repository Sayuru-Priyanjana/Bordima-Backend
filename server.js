const express = require('express');
require('dotenv').config();
const passport = require('passport');
const cookieSession = require('cookie-session');

require('./Auth/passport');

const authOwners = require('./routers/AuthOwnersRouter');

const app = express();
app.use(express.json());

app.use(cookieSession({
    name: 'google-auth-session',
    keys: [process.env.COOKIE_KEY1, process.env.COOKIE_KEY2], // Use environment variables
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth/owner', authOwners);

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});