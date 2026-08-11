import { compile } from 'sass';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scssPath = path.resolve(__dirname, '../styles/_breakpoints.scss');
const result = fs.readFileSync(scssPath, 'utf-8');

const variables = {}

const matches = result.matchAll(/\$(\w+):\s(\d+\.?\d*\w+);/g);

for (const match of matches) {
  variables[match[1]] = match[2]
}

const fileContent = `export const breakpoints = ${JSON.stringify(variables, null, 2)};\n`;

fs.writeFileSync(path.resolve(__dirname, '../styles/breakpoints.ts'), fileContent);