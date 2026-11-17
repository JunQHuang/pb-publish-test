import React,{useEffect,useState} from 'react';
export default function ServerAccess({children}){
 const [ready,setReady]=useState(!window.__BUDDY_SERVER__),[checked,setChecked]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!window.__BUDDY_SERVER__)return;let active=true;fetch('./api/data').then(r=>{if(active){setReady(r.ok);setChecked(true)}}).catch(()=>{if(active){setChecked(true);setError('服务暂时不可用')}});return()=>{active=false}},[]);
 if(ready)return children;
 return <main style={{maxWidth:440,margin:'15vh auto',padding:32}}><h1>进入应用工作区</h1><p>使用此应用部署时配置的访问口令。应用数据保存在自己的后端。</p>{checked?<form onSubmit={async e=>{e.preventDefault();const token=new FormData(e.currentTarget).get('token');setBusy(true);setError('');try{const r=await fetch('./api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});if(!r.ok)throw Error();setReady(true)}catch{setError('无法登录，请检查口令和连接')}finally{setBusy(false)}}}><label>应用访问口令<input name="token" type="password" required autoComplete="current-password" style={{display:'block',width:'100%',margin:'12px 0'}}/></label><button disabled={busy}>{busy?'正在连接…':'进入工作区'}</button></form>:<p>正在连接服务端…</p>}{error&&<p role="alert">{error}</p>}</main>
}
