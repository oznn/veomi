import { Buffer } from 'buffer';
import rc4Encrypt from './rc4Encrypt';

function encodeBase64URL(data: string) {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function decodeBase64URL(data: string) {
  const padding = data.length % 4;
  if (padding > 0) data += '='.repeat(4 - padding); //eslint-disable-line
  return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
}
function exchange(input: string, key1: string, key2: string) {
  const f = (c: string) => {
    const i = key1.indexOf(c);
    return i !== -1 ? key2[i] : c;
  };

  return input.split('').map(f).join('');
}

export function encrypt(target: { [k: string]: any }[], input: string) {
  let vrf = input;

  target
    .sort((a, b) => a.sequence - b.sequence)
    .forEach(({ method, keys }) => {
      switch (method) {
        case 'exchange':
          vrf = exchange(vrf, keys?.at(0) || '', keys?.at(1) || '');
          break;
        case 'rc4':
          vrf = rc4Encrypt(keys?.at(0) || '', Buffer.from(vrf)).toString(
            'base64',
          );
          break;
        case 'reverse':
          vrf = vrf.split('').reverse().join('');
          break;
        case 'base64':
          vrf = encodeBase64URL(vrf);
          break;
        default:
        // no default
      }
    });

  return encodeURIComponent(vrf);
}

export function decrypt(target: { [k: string]: any }[], input: string) {
  let vrf = input;

  target
    .sort((a, b) => b.sequence - a.sequence)
    .forEach(({ method, keys }) => {
      switch (method) {
        case 'exchange':
          vrf = exchange(vrf, keys?.at(1) || '', keys?.at(0) || '');
          break;
        case 'rc4':
          vrf = rc4Encrypt(
            keys?.at(0) || '',
            Buffer.from(vrf, 'base64'),
          ).toString();
          break;
        case 'reverse':
          vrf = vrf.split('').reverse().join('');
          break;
        case 'base64':
          vrf = decodeBase64URL(vrf);
          break;
        default:
        // no default
      }
    });

  return vrf;
}
