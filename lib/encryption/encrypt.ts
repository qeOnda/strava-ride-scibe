import * as crypto from "crypto";

import { deriveKey } from "./deriveKey";

type EncrpytParams = {
  text: string;
  key: Buffer;
};

/**
 * Encrypts text using AES-256-CBC.
 * Returns a string with format: "iv_hex:encrypted_hex"
 */
export const encrypt = ({ text, key }: EncrpytParams): string => {
  if (!key) throw new Error("encrypt: 'key' is required");
  if (!text) throw new Error("encrypt: 'text' is required");

  const keyBuffer = deriveKey(key);

  const iv = crypto.randomBytes(16); // 16-byte initialization vector

  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};
