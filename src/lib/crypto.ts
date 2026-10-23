import type { Alum, EncryptedPayload } from './types'

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

async function gunzip(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(
      'This browser cannot decompress the dataset. Use a current version of Chrome, Safari, Edge, or Firefox.',
    )
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export type UnlockResult =
  | { ok: true; records: Alum[] }
  | { ok: false; error: string }

/**
 * Decrypts the bundled dataset. PBKDF2-SHA256 + AES-256-GCM.
 * Nothing is sent anywhere; this runs entirely in the browser.
 */
export async function unlockDataset(
  payload: EncryptedPayload,
  passphrase: string,
): Promise<UnlockResult> {
  try {
    const enc = new TextEncoder()
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey'],
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: b64ToBytes(payload.salt),
        iterations: payload.iterations,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    )

    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(payload.iv) },
      key,
      b64ToBytes(payload.ciphertext),
    )

    let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(plain)
    if (payload.gzip) bytes = await gunzip(bytes)

    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as { records: Alum[] }
    if (!parsed || !Array.isArray(parsed.records)) {
      return { ok: false, error: 'Dataset decrypted but is not in the expected format.' }
    }
    return { ok: true, records: parsed.records }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (/operation failed|decrypt|tag/i.test(message)) {
      return { ok: false, error: 'Incorrect passphrase.' }
    }
    return { ok: false, error: message }
  }
}

export async function loadPayload(): Promise<EncryptedPayload | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}dataset.enc.json`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as EncryptedPayload
  } catch {
    return null
  }
}
