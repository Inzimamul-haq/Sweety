import { env } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(env.port, () => {
  process.stdout.write(`Sweety API listening on port ${env.port}\n`);
});
