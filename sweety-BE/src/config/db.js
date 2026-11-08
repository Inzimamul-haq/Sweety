import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Ensure Postgres DATE columns (OID 1082) are returned as 'YYYY-MM-DD' strings
// rather than JavaScript Date objects at UTC midnight.
pg.types.setTypeParser(1082, (val) => val);

export const pool = new Pool({
  connectionString: env.databaseUrl || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
