const http=require('node:http'),fs=require('node:fs');
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/app.css':'app.css'};
http.createServer((req,res)=>{const file=files[req.url];if(!file){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync('dist/'+file));}).listen(8000,'127.0.0.1',()=>console.log('Buddy: http://localhost:8000'));
