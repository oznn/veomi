import { Buffer } from 'buffer';

export default function rc4Encrypt(key: string, message: Buffer) {
  const S = Array.from(Array(256).keys());
  let j = 0;
  for (let i = 0; i < 256; i += 1) {
    j = (j + S[i] + key.charCodeAt(i % key.length)) % 256;
    [S[i], S[j]] = [S[j], S[i]];
  }

  const out: number[] = [];
  let i = 0;
  j = 0;
  for (let n = 0; n < message.length; n += 1) {
    const char = message[n];
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
    out.push(char ^ S[(S[i] + S[j]) % 256]); // eslint-disable-line no-bitwise
  }
  return Buffer.from(out);
}
