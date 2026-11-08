import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;
const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(here, '../.env'),
});

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\n Missing DIRECT_URL or DATABASE_URL in .env');
  console.error('Please configure your Neon PostgreSQL connection string in sweety-BE/.env\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function setup() {
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    const client = await pool.connect();
    console.log('Connected.');

    try {
      const schemaPath = path.join(here, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      console.log('Applying schema.sql...');
      await client.query(schema);

      console.log(' Database schema created successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(' Database setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await setup();
