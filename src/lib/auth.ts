import { createHmac } from "crypto";

const APP_PASSWORD = process.env.APP_PASSWORD ?? "";
const APP_SECRET = process.env.APP_SECRET ?? "heavenzy-secret-2024";

export function deriveToken(password: string): string {
  return createHmac("sha256", APP_SECRET).update(password).digest("hex");
}

export function isValidToken(token: string): boolean {
  if (!APP_PASSWORD) return false;
  const expected = deriveToken(APP_PASSWORD);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
