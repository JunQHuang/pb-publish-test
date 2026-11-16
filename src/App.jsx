import React,{useState} from 'react';
import config from '../project.json';
import Module,{initialData,navigation} from './Module';
import {useProjectData} from './state';
import WorkspaceShell from './ui/WorkspaceShell';
import {PageHead} from './ui/components';
export default function App(){
 const [tab,setTab]=useState(navigation[0].id);
 const [data,setData,status,ready]=useProjectData(initialData);
 return <div className={'style-'+config.style}><WorkspaceShell title={config.title} navigation={navigation} tab={tab} onNavigate={setTab} status={status}>
  {!ready&&<p role="status">正在加载已保存的数据…</p>}
  <fieldset className="module-root" disabled={!ready}>{config.accelerator!=='project-delivery'&&<PageHead title={navigation.find(n=>n.id===tab)?.name||config.title} desc="围绕业务目标，让每一步工作都有记录。"/>}<Module tab={tab} data={data} setData={setData} navigate={setTab}/></fieldset>
 </WorkspaceShell></div>;
}
