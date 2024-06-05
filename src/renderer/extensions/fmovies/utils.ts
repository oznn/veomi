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
  const shifts = [4, 3, -2, 5, 2, -4, -4, 2];
  for (let i = 0; i < vrf.length; i += 1) {
    const shift = shifts[i % 8];
    vrf[i] = (vrf[i] + shift) & 0xff; //eslint-disable-line
  }
  return vrf;
}

export function vrfEncrypt(input: string) {
  const rc4 = rc4Encrypt('Ij4aiaQXgluXQRs6', Buffer.from(input));
  let vrf = Buffer.from(decodeUrl(rc4.toString('base64')));
  vrf = Buffer.from(decodeUrl(vrf.toString('base64')));
  vrf.reverse();
  vrf = Buffer.from(decodeUrl(vrf.toString('base64')));
  vrf = vrfShift(vrf);
  const res = new TextDecoder('utf-8').decode(Buffer.from(vrf));

  return encodeURIComponent(res.toString());
}
export function vrfDecrypt(input: string) {
  const rc4 = rc4Encrypt('8z5Ag5wgagfsOuhz', Buffer.from(input, 'base64'));
  return decodeURIComponent(new TextDecoder('utf-8').decode(rc4));
}
