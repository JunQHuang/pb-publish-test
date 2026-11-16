import {useCallback,useEffect,useRef,useState} from 'react';
import config from '../project.json';
const key='buddy:'+config.name;
export function useProjectData(initial){
 const embedded=window.parent!==window;
 const server=!!window.__BUDDY_SERVER__;
 const revision=useRef(0),queue=useRef(Promise.resolve()),failed=useRef(false);
 const [value,commit]=useState(()=>{try{return {...initial,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{return initial}});
 const current=useRef(value),latestSave=useRef(''),readyRef=useRef(!embedded&&!server);
 const [ready,setReady]=useState(!embedded&&!server),[status,setStatus]=useState(embedded?'正在连接工程存储':'本地保存');
 useEffect(()=>{
  if(server){
   let stopped=false;
   fetch('./api/data').then(r=>{if(!r.ok)throw Error();return r.json()}).then(result=>{if(stopped)return;revision.current=result.revision;current.current={...initial,...result.value};commit(current.current);readyRef.current=true;setReady(true);setStatus('服务端已连接')}).catch(()=>{if(!stopped)setStatus('服务端连接失败，请刷新重试')});
   return()=>{stopped=true};
  }
  if(!embedded)return;
  const receive=e=>{if(e.source!==window.parent||e.data?.channel!=='raccoonx-buddy-data-v1')return;
   if(e.data.type==='loaded'&&!readyRef.current){current.current={...current.current,...e.data.value};commit(current.current);readyRef.current=true;setReady(true);setStatus('已保存');}
   // A late receipt for an earlier edit cannot mark a newer edit as saved.
   if(e.data.type==='saved'&&e.data.save_id===latestSave.current)setStatus('已保存');
   if(e.data.type==='error'&&(!e.data.save_id||e.data.save_id===latestSave.current))setStatus('保存未完成，请保留页面并核对');
  };
  window.addEventListener('message',receive);window.parent.postMessage({channel:'raccoonx-buddy-data-v1',type:'load'},'*');
  return()=>window.removeEventListener('message',receive);
 },[]);
 const setValue=useCallback(update=>{
  if(!readyRef.current)return;
  const next=typeof update==='function'?update(current.current):update;
  if(Object.is(next,current.current))return;
  if(failed.current)return;
  current.current=next;commit(next);
  if(server){
   setStatus('正在保存到服务端…');
   queue.current=queue.current.then(async()=>{if(failed.current)return;const response=await fetch('./api/data',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:revision.current,value:next})});if(!response.ok)throw Error(String(response.status));revision.current=(await response.json()).revision;setStatus('服务端已保存')}).catch(()=>{failed.current=true;readyRef.current=false;setReady(false);setStatus('保存冲突或连接中断，请刷新核对，未确认的修改没有覆盖服务端')});
   return;
  }
  if(window.parent!==window){
   const save_id=crypto.randomUUID();latestSave.current=save_id;setStatus('正在保存…');
   // Dispatch in the user action, not a cancellable debounce/effect.
   window.parent.postMessage({channel:'raccoonx-buddy-data-v1',type:'save',save_id,value:next},'*');
  }else try{localStorage.setItem(key,JSON.stringify(next));setStatus('已保存到本机')}catch{setStatus('当前浏览器无法保存')}
 },[]);
 return [value,setValue,status,ready];
}
