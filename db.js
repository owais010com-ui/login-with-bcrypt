import { Pool } from 'pg';
import 'dotenv/config'


// console.log("process.env.PG_HOST,", process.env.PG_DATABASE);

export const db = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }

});