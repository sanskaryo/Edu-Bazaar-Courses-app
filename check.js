require('dotenv').config();

console.log(process.env.JWT_ADMIN_PASSWORD);  // should output "adminpassword"
console.log(process.env.MONGO_URL);  // should output your MongoDB URL
