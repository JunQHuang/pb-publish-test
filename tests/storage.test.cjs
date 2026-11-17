const {test}=require('node:test');const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');const {buildSync}=require('esbuild');
const source=buildSync({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {useProjectData} from './src/state.js';function Probe(){const [data,setData,status,ready]=useProjectData({n:0});return <><output>{data.n}:{status}</output><button disabled={!ready} onClick={()=>setData(v=>({n:v.n+1}))}>Update</button></>}createRoot(document.getElementById('root')).render(<Probe/>);`,resolveDir:process.cwd(),loader:'jsx'},nodePaths:(process.env.NODE_PATH||'').split(require('node:path').delimiter).filter(Boolean),bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'}}).outputFiles[0].text;
const wait=()=>new Promise(r=>setTimeout(r,25));
const until=async predicate=>{const deadline=Date.now()+3000;while(!predicate()){if(Date.now()>deadline)throw new Error('storage probe did not reach expected UI state');await wait()}};
test('embedded changes dispatch immediately and stale receipts cannot report saved',async t=>{
 const dom=new JSDOM('<iframe></iframe>',{url:'http://buddy.test',runScripts:'dangerously',pretendToBeVisual:true});t.after(()=>dom.window.close());
 const child=dom.window.document.querySelector('iframe').contentWindow;child.document.body.innerHTML='<div id="root"></div>';
 const messages=[];dom.window.addEventListener('message',event=>messages.push(event.data));
 const reply=data=>child.dispatchEvent(new child.MessageEvent('message',{source:dom.window,data:{channel:'raccoonx-buddy-data-v1',...data}}));
 child.eval(source);await until(()=>messages.some(m=>m.type==='load'));reply({type:'loaded',value:{n:0}});await until(()=>child.document.querySelector('button')&&!child.document.querySelector('button').disabled);
 assert.equal(messages.filter(m=>m.type==='save').length,0,'loading must not create a redundant save');
 child.document.querySelector('button').click();await until(()=>messages.filter(m=>m.type==='save').length===1&&child.document.querySelector('output').textContent.includes('正在保存'));
 let saves=messages.filter(m=>m.type==='save');assert.equal(saves.length,1);assert.equal(saves[0].value.n,1);assert.match(child.document.querySelector('output').textContent,/正在保存/);
 child.document.querySelector('button').click();await until(()=>messages.filter(m=>m.type==='save').length===2&&child.document.querySelector('output').textContent.startsWith('2:'));saves=messages.filter(m=>m.type==='save');assert.equal(saves.length,2);assert.equal(saves[1].value.n,2);
 reply({type:'saved',save_id:saves[0].save_id});await wait();assert.match(child.document.querySelector('output').textContent,/正在保存/);
 reply({type:'saved',save_id:saves[1].save_id});await until(()=>child.document.querySelector('output').textContent==='2:已保存');
});
