const { electron } = window;

function chunked(list, size) {
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

  const indexes = [];
  const variableMatches = [...switchCode.matchAll(/=(\w+)/g)];

  for (const variableMatch of variableMatches) {
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
  }

  return chunked(indexes, 2);
}

// Assuming these are defined elsewhere in your code
export default async function extractor(ciphered: string) {
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

  const videoResJson = await electron.crypto.aes(ciphertext, password);
  console.log(videoResJson);
  // return videoResJson;
}
