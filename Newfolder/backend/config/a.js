const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'password123';

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
    // Use this hash in your SQL INSERT statement
  }
});
