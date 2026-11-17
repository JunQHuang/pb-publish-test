import React from 'react';
import { PageHeader, Section, Tabs as RaccoonTabs } from './components/console';
import { Badge, Progress as RaccoonProgress, EmptyState as RaccoonEmptyState } from './components/ui/primitives';
import { Dialog } from './components/ui/dialog';
import mascot from './assets/raccoon-project.webp';
export { Icon, Metric, Bars } from './business-widgets';
export function PageHead({title,desc,actions}) { return <PageHeader title={title} desc={desc} actions={actions}/>; }
export function Card({title,note,actions,children,className=''}) { return <Section title={title} desc={note} actions={actions} className={className}>{children}</Section>; }
export function Tag({children,tone=''}) { return <Badge tone={({blue:'volt',green:'mint',red:'rose',orange:'amber'})[tone]||'neutral'}>{children}</Badge>; }
export function Tabs({items,value,onChange}) { return <RaccoonTabs className="overflow-x-auto" items={items.map(([id,label,count])=>({id,label,count}))} value={value} onChange={onChange}/>; }
export function EmptyState({title,description,action}) { return <RaccoonEmptyState icon={<img src={mascot} alt="" className="size-10"/>} title={title} hint={description} action={action}/>; }
export function Progress({label,value,total}) { const percent=total?Math.round(value/total*100):0;return <div className="space-y-3"><div className="flex items-center justify-between text-[13px]"><span>{label}</span><b>{value} / {total}</b></div><RaccoonProgress value={percent}/><p className="text-[12px] text-ink-3">{total?percent+'% 已完成':'添加记录后展示实际进度'}</p></div>; }
export function Modal({title,children,onClose,footer}) { return <Dialog open onOpenChange={o=>{if(!o)onClose()}} title={title} footer={footer} size="md">{children}</Dialog>; }
