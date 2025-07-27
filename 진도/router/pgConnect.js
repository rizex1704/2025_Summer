const { Pool } = require("pg");

const pool = new Pool({
  user: "kyarene",
  host: "localhost",
  database: "mydb",
  password: "kr131704!!",
  port: 5432,
});

module.exports = pool;