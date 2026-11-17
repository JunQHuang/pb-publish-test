const fs=require('node:fs');const {JSDOM}=require('jsdom');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
exports.openApp=async function({saved}={}){
 if(saved&&(typeof saved!=='object'||Array.isArray(saved)))throw Error('saved must be the key/value object returned by await app.saved(), not a JSON string');
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'http://buddy.test',runScripts:'dangerously',pretendToBeVisual:true});
 const document=dom.window.document;
 if(saved)for(const [k,v]of Object.entries(saved))dom.window.localStorage.setItem(k,v);
 dom.window.eval(fs.readFileSync('dist/app.js','utf8'));
 const waitFor=async(predicate,message='condition')=>{const start=Date.now();while(!predicate()){if(Date.now()-start>2000)throw Error('fixture timed out waiting for '+message);await delay(5)}};
 await waitFor(()=>document.querySelector('main')&&document.querySelector('fieldset')&&!document.querySelector('fieldset').disabled,'ready application');
 const target=(el,operation)=>{if(!el)throw new Error('fixture target missing for '+operation+'. Available controls: '+JSON.stringify([...document.querySelectorAll('input,select,textarea,button')].slice(0,40).map(x=>({tag:x.tagName,field:x.dataset.buddyField,label:x.getAttribute('aria-label')||x.getAttribute('placeholder')||x.textContent?.slice(0,60)}))));return el};
 return{window:dom.window,document,waitFor,records:()=>[...document.querySelectorAll('[data-buddy-record]')],click:async el=>{target(el,'click').click();await delay(10)},change:async(el,value)=>{Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target(el,'change')),'value').set.call(el,value);el.dispatchEvent(new dom.window.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));await delay(10)},saved:async()=>{await delay(30);return Object.fromEntries(Object.keys(dom.window.localStorage).map(k=>[k,dom.window.localStorage.getItem(k)]))},close:()=>dom.window.close()};
};
