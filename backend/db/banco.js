// backend/db/banco.js

const { Pool } = require("pg"); // <--- ADICIONE ESTA LINHA

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TecnoSenior",
  password: "180513",
  port: 5432,
});

module.exports = pool;