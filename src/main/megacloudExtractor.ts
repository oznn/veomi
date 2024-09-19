import crypto from 'crypto';

function deriveKeyAndIV(passphrase: string, salt: Buffer) {
  const password = Buffer.from(passphrase, 'utf8');
  const concatenatedHashes = [];
  let currentHash = Buffer.alloc(0);

  while (concatenatedHashes.length < 48) {
    const preHash = Buffer.concat([currentHash, password, salt]);
    currentHash = crypto.createHash('md5').update(preHash).digest();
    concatenatedHashes.push(currentHash);
  }

  const keyBytes = Buffer.concat(concatenatedHashes).slice(0, 32);
  const ivBytes = Buffer.concat(concatenatedHashes).slice(32, 48);
  return { key: keyBytes, iv: ivBytes };
}
function decryptAESCryptoJS(encrypted: string, passphrase: string) {
  const encryptedBytesWithSalt = Buffer.from(encrypted.trim(), 'base64');
  const salt = encryptedBytesWithSalt.slice(8, 16);
  const encryptedBytes = encryptedBytesWithSalt.slice(16);
  const { key, iv } = deriveKeyAndIV(passphrase.trim(), salt);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedBytes, 'base64', 'utf8');

  decrypted += decipher.final('utf8');
  return decrypted;
}

function chunked(list: number[], size: number) {
  const chunks = [];
  for (let i = 0; i < list.length; i += size) {
    const end = Math.min(i + size, list.length);
    chunks.push(list.slice(i, end));
  }
  return chunks;
}

async function generateIndexPairs() {
  const res = await fetch(
    'https://megacloud.tv/js/player/a/prod/e1-player.min.js',
  );
  const scriptText = await res.text();

  const switchCode = scriptText.substring(
    scriptText.lastIndexOf('switch'),
    scriptText.indexOf('=partKey'),
  );

  const indexes: number[] = [];
  const variableMatches = [...switchCode.matchAll(/=(\w+)/g)];

  variableMatches.forEach((variableMatch) => {
    const variable = variableMatch[1];
    const regex = new RegExp(`,${variable}=((?:0x)?([0-9a-fA-F]+))`);
    const match = scriptText.match(regex);

    if (match) {
      const value = match[1];
      if (value.startsWith('0x')) {
        indexes.push(parseInt(value.slice(2), 16));
      } else {
        indexes.push(parseInt(value, 10));
      }
    }
  });

  return chunked(indexes, 2);
}

// Assuming these are defined elsewhere in your code
export default async function processCipheredData(ciphered: string) {
  const indexPairs = await generateIndexPairs();
  let password = '';
  let index = 0;
  let ciphertext = ciphered;

  for (let i = 0; i < indexPairs.length; i += 1) {
    const [startOffset, length] = indexPairs[i];
    const start = startOffset + index;
    const end = start + length;
    const passSubstr = ciphered.substring(start, end);
    password += passSubstr;
    ciphertext = ciphertext.replace(passSubstr, '');
    index += length;
  }

  return decryptAESCryptoJS(ciphertext, password);
}
