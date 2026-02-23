const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, 
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, 
    trustServerCertificate: true 
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('MSSQL Database Connected Successfully!');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! ', err);
    process.exit(1);
  });

module.exports = {
  sql, 
  poolPromise,
  dbConfig: config
};