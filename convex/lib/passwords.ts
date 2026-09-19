const ITERATIONS = 120_000;

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let mismatch = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return mismatch === 0;
}

async function deriveHash(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<{
  hash: string;
  salt: string;
}> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    hash: await deriveHash(password, salt),
    salt: toHex(salt),
  };
}

export async function passwordMatches(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const next = await deriveHash(password, fromHex(salt));
  return timingSafeEqual(next, hash);
}
