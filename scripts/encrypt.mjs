import fs from 'node:fs';
import path from 'node:path';
import { parseCSVToRecords } from '../shared/normalize.mjs';
import { encryptRecords, writeDataset } from './encrypt-lib.mjs';

const input = process.argv[2];
if (!input) { console.error('Usage: node scripts/encrypt.mjs <csv> [passphrase]'); process.exit(1); }

const csv = fs.readFileSync(input, 'utf8');
const { records, stats } = parseCSVToRecords(csv);
console.log('Parsed', records.length, 'records, header row', stats.headerRow + 1);

const pass = process.argv[3] || 'ubp2026';
const payload = encryptRecords(records, pass, { label: 'UBP Networking Database', demo: false });
fs.mkdirSync('public', { recursive: true });
writeDataset(path.join('public', 'dataset.enc.json'), payload);
console.log('Encrypted -> public/dataset.enc.json (' + records.length + ' records, passphrase: ' + pass + ')');
