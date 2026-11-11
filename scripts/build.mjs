// Builds one self-contained dist/index.html: bundled JS, minified CSS, and the two fonts embedded.
// Run with: npm run build
import { build, transform } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (...p) => path.join(root, ...p);

// Only the scripts this product actually shows: Devanagari for Hindi, Latin for Hinglish and English.
const FONTS = [
  { pkg: 'rozha-one', family: 'Rozha One', weights: [400] },
  { pkg: 'mukta', family: 'Mukta', weights: [400, 600, 700] },
];
const RANGES = {
  devanagari: 'U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09',
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
};

async function fontCss() {
  let css = '';
  for (const f of FONTS) {
    for (const w of f.weights) {
      for (const subset of ['devanagari', 'latin']) {
        const file = at('node_modules', '@fontsource', f.pkg, 'files', `${f.pkg}-${subset}-${w}-normal.woff2`);
        const b64 = (await readFile(file)).toString('base64');
        css += `@font-face{font-family:'${f.family}';font-style:normal;font-display:swap;font-weight:${w};` +
          `src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${RANGES[subset]}}\n`;
      }
    }
  }
  return css;
}

const js = await build({
  entryPoints: [at('web/js/main.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  write: false,
  legalComments: 'none',
  loader: { '.json': 'json' },
});

const styles = await transform(await readFile(at('web/css/styles.css'), 'utf8'), { loader: 'css', minify: true });
const css = (await fontCss()) + styles.code;

let html = await readFile(at('web/index.html'), 'utf8');
if (!html.includes('<!--TAREEKH:CSS-->') || !html.includes('<!--TAREEKH:JS-->')) {
  throw new Error('web/index.html is missing the build placeholders');
}
const script = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
html = html
  .replace('<!--TAREEKH:CSS-->', () => `<style>${css}</style>`)
  .replace('<!--TAREEKH:JS-->', () => `<script>${script}</script>`);

await mkdir(at('dist'), { recursive: true });
await writeFile(at('dist/index.html'), html);
const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`dist/index.html  ${kb(Buffer.byteLength(html))}  (js ${kb(script.length)}, css+fonts ${kb(css.length)})`);
