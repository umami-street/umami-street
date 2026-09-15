import sharp from './node_modules/sharp/lib/index.js';
import { readdirSync, statSync, renameSync } from 'fs';
import { join, extname } from 'path';

const dir = './public/images';
const MAX_WIDTH = 1920;

const files = readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

for (const file of files) {
  const input = join(dir, file);
  const sizeMB = statSync(input).size / 1024 / 1024;
  const ext = extname(file).toLowerCase();

  if (sizeMB < 1) {
    console.log(`SKIP  ${file} (${sizeMB.toFixed(1)} MB — already small)`);
    continue;
  }

  const tmp = input + '.tmp';

  try {
    const img = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.png') {
      await img.png({ quality: 80, compressionLevel: 9 }).toFile(tmp);
    } else {
      await img.jpeg({ quality: 75, mozjpeg: true }).toFile(tmp);
    }

    const newMB = statSync(tmp).size / 1024 / 1024;
    renameSync(tmp, input);
    console.log(`OK    ${file}: ${sizeMB.toFixed(1)} MB → ${newMB.toFixed(1)} MB`);
  } catch (err) {
    console.error(`FAIL  ${file}: ${err.message}`);
  }
}

console.log('\nDone.');
