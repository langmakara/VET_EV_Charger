// utils/crypto.ts

/**
 * Computes a SHA-256 hash from a string using the native Web Crypto API
 * Returns an uppercase hexadecimal string matching the ABA specification blueprint
 */
export async function generateSha256(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert buffer array to a hex string representation
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex.toUpperCase();
}
