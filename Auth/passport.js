const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const pool = require('../config/db');

// Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialization
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM owners WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const { id, emails, displayName, photos } = profile;

    // Check existing user
    const [existingUser] = await pool.query(
      'SELECT * FROM owners WHERE google_id = ?', 
      [id]
    );

    if (existingUser.length > 0) {
      return done(null, existingUser[0]);
    }

    console.log(existingUser);

    // Create new user
    const [result] = await pool.query(
      'INSERT INTO owners SET ?',
      {
        google_id: id,
        email: emails[0].value,
        display_name: displayName,
        photo_url: photos[0]?.value || null
      }
    );

    // Fetch created user
    const [newUser] = await pool.query(
      'SELECT * FROM owners WHERE id = ?',
      [result.insertId]
    );

    console.log("New user "+ newUser);

    done(null, newUser[0]);
  } catch (err) {
    done(err);
  }
}));