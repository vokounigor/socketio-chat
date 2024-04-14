import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nouns = JSON.parse(
  readFileSync(join(__dirname, '/../constants/nouns.json'))
);
const adjectives = JSON.parse(
  readFileSync(join(__dirname, '/../constants/adjectives.json'))
);

/**
 * @param {string | undefined} separator
 * @param {number | undefined} length
 * @returns {string}
 */
export function generateRandomUsername(separator, length) {
  if (!separator) {
    separator = '';
  }
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  let result = noun + separator + adjective;

  if (length) {
    result = result.substring(0, length);
  }
  return result;
}
