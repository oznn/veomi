import { Buffer } from 'buffer';
import rc4Encrypt from '../../utils/rc4Encrypt';

function decodeUrl(inp: string): string {
  let input = inp.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) throw new Error('InvalidLengthError');
    input += new Array(5 - pad).join('=');
  }
  return input;
}

function vrfShift(vrf: Buffer) {
  const shifts = [-2, -4, -5, 6, 2, -3, 3, 6];
  for (let i = 0; i < vrf.length; i += 1) {
    const shift = shifts[i % 8];
    vrf[i] = (vrf[i] + shift) & 0xff; // eslint-disable-line no-bitwise
  }
  return vrf;
}

export function vrfEncrypt(input: string) {
  const rc4 = rc4Encrypt('Ex3tc7qjUz7YlWpQ', Buffer.from(input));
  const vrf = decodeUrl(rc4.toString('base64'));
  // const vrf1 = Buffer.from(vrf).toString('base64');
  // const vrf2 = vrfShift(Buffer.from(vrf1)).reverse();
  // const vrf3 = decodeUrl(vrf2.toString('base64'));
  const vrf4 = new TextDecoder('utf-8').decode(Buffer.from(vrf));
  return encodeURIComponent(vrf4);
}

export function vrfDecrypt(input: string) {
  const rc4 = rc4Encrypt('8z5Ag5wgagfsOuhz', Buffer.from(input, 'base64'));
  return decodeURIComponent(new TextDecoder('utf-8').decode(rc4));
}
