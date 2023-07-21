const {Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PWD,
    user: process.env.DATABASE_USER,
    port: process.env.DATABASE_PORT,
    ssl: {rejectUnauthorized: false}
});
module.exports = pool;