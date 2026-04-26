import * as fs from 'node:fs';
import { createGzip } from 'node:zlib';
import readline from 'node:readline';

// 输入：ECDICT 的 CSV（word,phonetic,definition,translation,pos,collins,oxford,tag,bnc,frq,exchange,detail,audio）
const SRC = process.argv[2] || './ecdict.csv';
const OUT = './assets/ecdict.lemma.json.gz';

type Entry = { w: string; ipa: string; trans: string; pos?: string; tag?: string };
const map: Record<string, Entry> = {};

const rl = readline.createInterface({ input: fs.createReadStream(SRC) });
let header: string[] | null = null;

rl.on('line', (line) => {
  const cols = line.split(',');
  if (!header) { header = cols; return; }
  const get = (k: string) => cols[header!.indexOf(k)] || '';
  const w = get('word').trim().toLowerCase();
  if (!w || !/^[a-z][a-z\-']*$/.test(w)) return;
  const exchange = get('exchange');
  if (exchange && /\bs:|d:|p:|i:|3:|r:|t:/.test(exchange)) return;
  map[w] = { w, ipa: get('phonetic'), trans: get('translation').replace(/\\n/g, '\n'), pos: get('pos'), tag: get('tag') };
});
rl.on('close', () => {
  const data = JSON.stringify(map);
  console.log('entries:', Object.keys(map).length, 'raw size:', data.length);
  fs.mkdirSync('assets', { recursive: true });
  const gz = createGzip({ level: 9 });
  const out = fs.createWriteStream(OUT);
  gz.pipe(out);
  gz.write(data); gz.end();
  out.on('finish', () => console.log('wrote', OUT));
});
