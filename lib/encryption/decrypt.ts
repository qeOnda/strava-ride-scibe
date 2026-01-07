import * as crypto from "crypto";

import { deriveKey } from "./deriveKey";

type DecryptParams = {
  encryptedText: string;
  key: Buffer;
};

/**
 * Decrypts AES-256-CBC encrypted text.
 * Expects format: "iv_hex:encrypted_hex"
 */
export const decrypt = ({ encryptedText, key }: DecryptParams): string => {
  if (!key) throw new Error("decrypt: 'key' is required");
  if (!encryptedText) throw new Error("decrypt: 'text' is required");

  const keyBuffer = deriveKey(key);

  // Split IV and ciphertext
  const parts = encryptedText.split(":");
  if (parts.length < 2) {
    throw new Error(
      "decrypt: invalid ciphertext format, expected 'iv:ciphertext'"
    );
  }

  const ivHex = parts[0];
  const ciphertextHex = parts.slice(1).join(":");

  try {
    const iv = Buffer.from(ivHex, "hex");
    const encryptedBuffer = Buffer.from(ciphertextHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
    let decrypted = decipher.update(encryptedBuffer, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      `decrypt: failed to decrypt text - ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
};
