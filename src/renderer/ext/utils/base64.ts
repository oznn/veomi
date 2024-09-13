function encodeBase64URL(data: string) {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function decodeBase64URL(data: string) {
  const padding = data.length % 4;
  if (padding > 0) data += '='.repeat(4 - padding); //eslint-disable-line
  return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
}
