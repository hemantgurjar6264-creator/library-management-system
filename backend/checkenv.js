require('dotenv').config();
console.log('USER:', process.env.EMAIL_USER);
console.log('PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
