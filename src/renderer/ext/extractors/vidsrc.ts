function bMGyx71TzQLfdonN(a: string): string {
  const b = 3;
  const c: string[] = [];
  let d = 0;

  while (d < a.length) {
    c.push(a.substring(d, Math.min(d + b, a.length)));
    d += b;
  }

  const e = c.reverse().join('');
  return e;
}

function Iry9MQXnLs(a: string): string {
  const b = 'pWB9V)[*4I`nJpp?ozyB~dbr9yt!_n4u';
  const d =
    a
      .match(/.{1,2}/g)
      ?.map((hex) => String.fromCharCode(parseInt(hex, 16)))
      .join('') || '';

  let c = '';
  for (let e = 0; e < d.length; e += 1)
    // eslint-disable-next-line
    c += String.fromCharCode(d.charCodeAt(e) ^ b.charCodeAt(e % b.length));

  let e = '';
  for (let i = 0; i < c.length; i += 1)
    e += String.fromCharCode(c[i].charCodeAt(0) - 3);

  return atob(e);
}

function IGLImMhWrI(a: string): string {
  const b = a.split('').reverse().join('');

  const c = b
    .split('')
    .map((it) => {
      if ((it >= 'a' && it <= 'm') || (it >= 'A' && it <= 'M')) {
        return String.fromCharCode(it.charCodeAt(0) + 13);
      }
      if ((it >= 'n' && it <= 'z') || (it >= 'N' && it <= 'Z')) {
        return String.fromCharCode(it.charCodeAt(0) - 13);
      }
      return it;
    })
    .join('');

  const d = c.split('').reverse().join('');
  return atob(d);
}

function GTAxQyTyBx(a: string): string {
  const b = a.split('').reverse().join('');
  const c = b
    .split('')
    .filter((_, index) => index % 2 === 0)
    .join('');
  return atob(c);
}

function C66jPHx8qu(a: string): string {
  const b = a.split('').reverse().join('');
  const c = 'X9a(O;FMV2-7VO5x;Ao:dN1NoFs?j,';
  const d =
    b
      .match(/.{1,2}/g)
      ?.map((hex) => String.fromCharCode(parseInt(hex, 16)))
      .join('') || '';

  let e = '';
  for (let i = 0; i < d.length; i += 1)
    // eslint-disable-next-line
    e += String.fromCharCode(d.charCodeAt(i) ^ c.charCodeAt(i % c.length));

  return e;
}

function MyL1IRSfHe(a: string): string {
  const b = a.split('').reverse().join('');
  const c = b
    .split('')
    .map((char) => String.fromCharCode(char.charCodeAt(0) - 1))
    .join('');
  const d =
    c
      .match(/.{1,2}/g)
      ?.map((hex) => String.fromCharCode(parseInt(hex, 16)))
      .join('') || '';

  return d;
}

function detdj7JHiK(a: string): string {
  const b = a.substring(10, a.length - 16);
  const c = '3SAY~#%Y(V%>5d/Yg"$G[Lh1rK4a;7ok';
  const d = atob(b);

  const e = c
    .repeat(Math.ceil((d.length + c.length) / c.length))
    .substring(0, d.length);
  let f = '';
  for (let i = 0; i < d.length; i += 1) {
    // eslint-disable-next-line
    f += String.fromCharCode(d.charCodeAt(i) ^ e.charCodeAt(i));
  }

  return f;
}

function nZlUnj2VSo(a: string): string {
  const map: { [key: string]: string } = {
    x: 'a',
    y: 'b',
    z: 'c',
    a: 'd',
    b: 'e',
    c: 'f',
    d: 'g',
    e: 'h',
    f: 'i',
    g: 'j',
    h: 'k',
    i: 'l',
    j: 'm',
    k: 'n',
    l: 'o',
    m: 'p',
    n: 'q',
    o: 'r',
    p: 's',
    q: 't',
    r: 'u',
    s: 'v',
    t: 'w',
    u: 'x',
    v: 'y',
    w: 'z',
    X: 'A',
    Y: 'B',
    Z: 'C',
    A: 'D',
    B: 'E',
    C: 'F',
    D: 'G',
    E: 'H',
    F: 'I',
    G: 'J',
    H: 'K',
    I: 'L',
    J: 'M',
    K: 'N',
    L: 'O',
    M: 'P',
    N: 'Q',
    O: 'R',
    P: 'S',
    Q: 'T',
    R: 'U',
    S: 'V',
    T: 'W',
    U: 'X',
    V: 'Y',
    W: 'Z',
  };

  return Array.from(a)
    .map((char) => map[char] || char)
    .join('');
}

function laM1dAi3vO(a: string): string {
  const b = a.split('').reverse().join('');
  const c = b.replace(/-/g, '+').replace(/_/g, '/');
  const d = atob(c);

  let e = '';
  const f = 5;
  for (let i = 0; i < d.length; i += 1)
    e += String.fromCharCode(d[i].charCodeAt(0) - f);

  return e;
}

function GuxKGDsA2T(a: string): string {
  const b = a.split('').reverse().join('');
  const c = b.replace(/-/g, '+').replace(/_/g, '/');
  const d = atob(c);

  let e = '';
  const f = 7;
  // for (const ch of d) {
  for (let i = 0; i < d.length; i += 1)
    e += String.fromCharCode(d[i].charCodeAt(0) - f);

  return e;
}

function LXVUMCoAHJ(a: string): string {
  const b = a.split('').reverse().join('');
  const c = b.replace(/-/g, '+').replace(/_/g, '/');
  const d = atob(c);

  let e = '';
  const f = 3;
  for (let i = 0; i < d.length; i += 1)
    e += String.fromCharCode(d[i].charCodeAt(0) - f);

  return e;
}
export default function extractor(method: string, url: string) {
  switch (method) {
    case 'NdonQLf1Tzyx7bMG':
      return bMGyx71TzQLfdonN(url);
    case 'sXnL9MQIry':
      return Iry9MQXnLs(url);
    case 'IhWrImMIGL':
      return IGLImMhWrI(url);
    case 'xTyBxQyGTA':
      return GTAxQyTyBx(url);
    case 'ux8qjPHC66':
      return C66jPHx8qu(url);
    case 'eSfH1IRMyL':
      return MyL1IRSfHe(url);
    case 'KJHidj7det':
      return detdj7JHiK(url);
    case 'o2VSUnjnZl':
      return nZlUnj2VSo(url);
    case 'Oi3v1dAlaM':
      return laM1dAi3vO(url);
    case 'TsA2KGDGux':
      return GuxKGDsA2T(url);
    case 'JoAHUMCLXV':
      return LXVUMCoAHJ(url);
    default:
      return null;
  }
}
