import * as crypto from "crypto";

/**
 * Derives a 32-byte key for AES-256 from the provided key using SHA-256.
 * If the key is already a 32-byte Buffer, it is returned as-is.
 */
export const deriveKey = (key: string | Buffer): Buffer => {
  if (Buffer.isBuffer(key)) {
    if (key.length === 32) return key;
    throw new Error("Key must be 32 bytes for AES-256");
  }
  // Derive 32-byte key from string using SHA-256
  return crypto.createHash("sha256").update(String(key)).digest();
};
