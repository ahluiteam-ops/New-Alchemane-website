import { mkdir, writeFile } from 'node:fs/promises';
const references = {
  'studio-zash': 'https://i.pinimg.com/736x/f7/11/ca/f711caadc3a5b9d3382ef10de7e7a7d4.jpg',
  'skincare-catalog': 'https://i.pinimg.com/736x/a2/f1/33/a2f1330c9eecdb23fc5a4e53bafcc21e.jpg',
  'quiet-luxury': 'https://i.pinimg.com/736x/f5/22/bd/f522bd06dfa613a96974b96764d02cd8.jpg',
  'fylona': 'https://i.pinimg.com/736x/d8/f4/f5/d8f4f5fc89cec6c5e255ebfb6bce7df5.jpg',
};
await mkdir('public/references/pinterest', { recursive: true });
await Promise.all(Object.entries(references).map(async ([name, url]) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  await writeFile(`public/references/pinterest/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name}`);
}));
