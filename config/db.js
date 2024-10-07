const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'kautapp-db-do-user-16587720-0.c.db.ondigitalocean.com',
  user: 'doadmin',
  password: 'Casa123___123',
  database: 'yoelijodigital',
  port: 25060,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
