import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(here, 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

process.stdout.write(`
Supabase does not apply DDL through supabase-js.

1. Open your project → SQL Editor
2. Paste and run the contents of:
   ${schemaPath}

--- schema.sql ---
${sql}
`);
