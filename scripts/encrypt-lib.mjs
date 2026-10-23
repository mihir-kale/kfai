import crypto from 'node:crypto';
import zlib from 'node:zlib';
import fs from 'node:fs';

export function encryptRecords(records, passphrase, meta = {}) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(passphrase, salt, 250000, 32, 'sha256');
  const plaintext = zlib.gzipSync(Buffer.from(JSON.stringify({ records }), 'utf8'), { level: 9 });
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1, kdf: 'PBKDF2-SHA256', iterations: 250000,
    salt: salt.toString('base64'), iv: iv.toString('base64'),
    ciphertext: Buffer.concat([ciphertext, tag]).toString('base64'),
    gzip: true,
    meta: { count: records.length, generatedAt: new Date().toISOString(), demo: Boolean(meta.demo), label: meta.label || 'UBP Networking Database' },
  };
}

export function writeDataset(path, payload) {
  fs.writeFileSync(path, JSON.stringify(payload, null, 0) + '\n', 'utf8');
  return path;
}
