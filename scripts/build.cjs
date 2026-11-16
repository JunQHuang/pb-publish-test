const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const cp = require('node:child_process');
if(fs.existsSync('ui-kit/xbuddy/styles/entry.css')) {
 const cli=path.resolve(path.dirname(require.resolve('tailwindcss/package.json')),'../@tailwindcss/cli/dist/index.mjs');
 cp.execFileSync(process.execPath,[cli,'--input','ui-kit/xbuddy/styles/entry.css','--output','ui-kit/xbuddy/styles/compiled.css','--minify'],{stdio:'inherit'});
 const compiled='ui-kit/xbuddy/styles/compiled.css';
 const fonts=path.dirname(require.resolve('@fontsource-variable/geist/package.json'));
 fs.writeFileSync(compiled,fs.readFileSync(compiled,'utf8').replace(/url\(\.\/files\/(geist-[a-z-]+\.woff2)\)/g,(_all,name)=>'url(data:font/woff2;base64,'+fs.readFileSync(path.join(fonts,'files',name)).toString('base64')+')'));
}
try {
esbuild.buildSync({entryPoints:['src/main.jsx'],bundle:true,write:true,outfile:'dist/app.js',format:'iife',platform:'browser',target:'es2022',minify:true,legalComments:'none',jsx:'automatic',loader:{'.svg':'dataurl','.webp':'dataurl','.woff2':'dataurl'},nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean),define:{'process.env.NODE_ENV':'"production"'}});
} finally { if(fs.existsSync('ui-kit/xbuddy/styles/compiled.css'))fs.unlinkSync('ui-kit/xbuddy/styles/compiled.css'); }
const config=JSON.parse(fs.readFileSync('project.json','utf8'));
const title=config.title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
fs.writeFileSync('dist/index.html',`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="./app.css"></head><body><div id="root"></div><script src="./app.js" defer></script></body></html>`);
console.log('Build passed: dist/index.html, app.js, app.css');
