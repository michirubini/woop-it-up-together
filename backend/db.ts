import { Pool } from "pg";
import dotenv = require("dotenv");

dotenv.config();

const db = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || "5432"),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

export = db;
