const { Pool } = require("pg");

const pool = new Pool({
  user: "kyarene",
  host: "localhost",
  database: "mydb",
  password: "********",
  port: 5432,
});

module.exports = pool;