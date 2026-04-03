/* eslint-disable */
import axios from 'axios';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load backend .env so X_API_KEY matches local API when running e2e against `nx serve backend`.
dotenv.config({ path: join(__dirname, '../../../apps/backend/.env') });

module.exports = async function () {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '8080';
  axios.defaults.baseURL = `http://${host}:${port}`;
  if (process.env.X_API_KEY) {
    axios.defaults.headers.common['x-api-key'] = process.env.X_API_KEY;
  }
};
