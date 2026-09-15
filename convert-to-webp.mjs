import sharp from './node_modules/sharp/lib/index.js';
import { readdirSync, statSync, unlinkSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const dir = './public/images';

// Map old filename → new clean webp name
const rename = (f) => f
  .replace(/\.(png|jpg|jpeg)$/i, '.webp')
  .replace(/\s+/g, '-')
  .toLowerCase();

const files = readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
const mapping = {}; // old path → new path (for code replacement)

for (const file of files) {
  const input = join(dir, file);
  const newName = rename(file);
  const output = join(dir, newName);

  try {
    await sharp(input)
      .rotate()                         // apply EXIF orientation
      .webp({ quality: 82 })
      .toFile(output);

    const oldMB = (statSync(input).size / 1024 / 1024).toFixed(1);
    const newMB = (statSync(output).size / 1024 / 1024).toFixed(1);
    console.log(`OK  ${file} → ${newName}  (${oldMB}MB → ${newMB}MB)`);

    // Record mapping for code replacement (only if name changed)
    if (file !== newName) {
      mapping[`/images/${file}`] = `/images/${newName}`;
    }

    // Delete old file
    unlinkSync(input);
  } catch (err) {
    console.error(`FAIL  ${file}: ${err.message}`);
  }
}

// Update all code references
const CODE_DIRS = ['./app', './components', './lib'];
const EXTS = ['.tsx', '.ts', '.js', '.jsx'];

function updateFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [oldPath, newPath] of Object.entries(mapping)) {
    if (content.includes(oldPath)) {
      content = content.split(oldPath).join(newPath);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`Updated code: ${filePath}`);
  }
}

function walkDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      walkDir(full);
    } else if (entry.isFile() && EXTS.includes(extname(entry.name))) {
      updateFile(full);
    }
  }
}

for (const d of CODE_DIRS) {
  walkDir(d);
}

console.log('\nMapping:', mapping);
console.log('\nDone. Push the changes to GitHub Desktop.');
