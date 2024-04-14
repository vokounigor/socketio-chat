import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.disable('etag');
app.disable('x-powered-by');
app.use(cors());

app.use('/static', express.static(join(__dirname, '/public')));

app.get('/', (_, res) => {
  return res.sendFile(join(__dirname, '/public/views/index.html'));
});

export const server = createServer(app);
