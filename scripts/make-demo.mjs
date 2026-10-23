import fs from 'node:fs';
import path from 'node:path';
import { parseCSVToRecords } from '../shared/normalize.mjs';
import { encryptRecords, writeDataset } from './encrypt-lib.mjs';

const rows = [
  'Name,Class Year,Employer,Position Type,Title,Personal Email,Location',
  'Sarah Chen,2026,Goldman Sachs,Intern,Investment Banking Summer Analyst,sarah.chen@example.com,Charlotte NC',
  'Marcus Webb,2025,McKinsey & Company,Intern,Business Analyst,marcus.webb@example.com,New York NY',
  'Priya Patel,2021,Deloitte,Full-time,Audit Associate,priya.patel@example.com,Atlanta GA',
  'Daniel Rivera,2019,JPMorgan Chase,Full-time,M&A Analyst,daniel.rivera@example.com,New York NY',
  'Nia Okafor,2016,Blackstone,Full-time,Private Equity Associate,nia.okafor@example.com,New York NY',
];
const csv = rows.join('\n');
const { records } = parseCSVToRecords(csv);
const payload = encryptRecords(records, 'ubp-demo', { label: 'UBP Networking Database (demo)', demo: true });
fs.mkdirSync('public', { recursive: true });
writeDataset(path.join('public', 'dataset.enc.json'), payload);
console.log('Demo dataset -> public/dataset.enc.json (' + records.length + ' records, passphrase: ubp-demo)');
