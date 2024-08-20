import { Buffer } from 'buffer';
import rc4Encrypt from '../../utils/rc4Encrypt';
import { encodeBase64URL, decodeBase64URL } from '../../utils/base64';

function exchange(input: string, key1: string, key2: string) {
  const f = (c: string) => {
    const i = key1.indexOf(c);
    return i !== -1 ? key2[i] : c;
  };

  return input.split('').map(f).join('');
}

export async function vrfEncrypt(input: string) {
  let vrf = input;
  const res = await fetch('https://rowdy-avocado.github.io/multi-keys/');
  const { aniwave } = (await res.json()) as {
    aniwave: { sequence: number; method: string; keys?: string[] }[];
  };

  aniwave
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

export async function vrfDecrypt(input: string) {
  let vrf = input;
  const res = await fetch('https://rowdy-avocado.github.io/multi-keys/');
  const { aniwave } = (await res.json()) as {
    aniwave: { sequence: number; method: string; keys?: string[] }[];
  };

  if (aniwave)
    aniwave
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
