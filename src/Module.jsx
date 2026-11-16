import React, { useEffect, useState } from 'react';
import { Card } from './ui/components';
import { completedThisWeek, completionPatch, currentWeek, localDate, weekLabel, weeklyContent } from './pack/weekly';

export const initialData = { plans: [], reports: [] };
export const navigation = [{ id: 'plans', name: '工作计划', icon: '▤' }, { id: 'reports', name: '周报记录', icon: '◷' }];

export default function Module({ tab, data, setData }) {
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [range, setRange] = useState(() => currentWeek());
  useEffect(() => {
    const refresh = () => {
      const next = currentWeek();
      setRange(previous => previous.start.getTime() === next.start.getTime() ? previous : next);
    };
    const timer = setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  const list = data[tab] || [];
  const visible = tab === 'plans' ? list.filter(x => filter === 'all' || (filter === 'done' ? x.done : !x.done)) : list;
  const completed = completedThisWeek(data.plans || [], range);
  const generate = () => {
    const current = currentWeek();
    setRange(current);
    setData(v => ({ ...v, reports: [...(v.reports || []), {
      id: crypto.randomUUID(), title: '工作成果汇总 · ' + localDate(current.start),
      content: weeklyContent(v.plans || [], current), done: false
    }] }));
  };
  const add = e => {
    e.preventDefault();
    if (!title.trim()) { setError('请填写事项名称。'); return; }
    setData(v => ({ ...v, [tab]: [...(v[tab] || []), { id: crypto.randomUUID(), title: title.trim(), content: '', done: false, owner: '', priority: 'normal' }] }));
    setTitle(''); setError('');
  };
  const update = (id, patch) => setData(v => ({ ...v, [tab]: (v[tab] || []).map(x => x.id === id ? { ...x, ...patch } : x) }));
  return <>
    <div className="metrics">
      <div className="metric"><span>计划事项</span><strong>{(data.plans || []).length}</strong></div>
      <div className="metric"><span>已完成</span><strong>{(data.plans || []).filter(x => x.done).length}</strong></div>
      <div className="metric"><span>周报记录</span><strong>{(data.reports || []).length}</strong></div>
    </div>
    <Card title={tab === 'plans' ? '工作计划' : '成果记录与后续安排'}>
      <form className="toolbar" onSubmit={add}>
        <input data-buddy-field="new-title" aria-label="新增事项名称" placeholder={tab === 'plans' ? '添加工作计划' : '添加报告标题'} value={title} aria-invalid={!!error} aria-describedby={error ? 'title-error' : undefined} onChange={e => { setTitle(e.target.value); setError(''); }} />
        <button className="button primary" type="submit" data-buddy-action="add-item">添加事项</button>
      </form>
      {error && <p id="title-error" role="alert">{error}</p>}
      {tab === 'plans' ? <div className="toolbar">
        <label>完成状态 <select aria-label="筛选完成状态" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">全部</option><option value="open">未完成</option><option value="done">已完成</option></select></label>
        <span className="hint">显示 {visible.length} / 全部 {list.length} 项</span>
      </div> : <div className="weekly-summary">
        <div className="toolbar"><button className="button primary" data-buddy-action="generate-report" onClick={generate}>从已完成计划生成报告</button><span className="hint">本周完成 {completed.length} 项 · 生成后可编辑，修改自动保存。</span></div>
        <p className="hint" data-buddy-field="week-range">本周统计范围（浏览器本地时区）：{weekLabel(range)}</p>
        <p className="hint">仅汇总本周完成的计划；缺少完成时间的历史记录不计入。无完成计划也可生成空周报告。</p>
      </div>}
      {!!list.length && !visible.length && <p className="empty">没有符合当前筛选的计划。</p>}
      {!list.length && <p className="empty">记录目标与成果，让工作有迹可循。</p>}
      {visible.map(x => <article className="panel" key={x.id} data-buddy-record={x.id}>
        <div className="panel-head"><strong>{x.title}</strong><button className="button" data-buddy-field="done" aria-pressed={!!x.done} onClick={() => update(x.id, tab === 'plans' ? completionPatch(!x.done) : { done: !x.done })}>{x.done ? '已完成' : '标记完成'}</button></div>
        {tab === 'plans' && <div className="form-grid">
          <label>负责人<input data-buddy-field="owner" aria-label={'负责人：' + x.title} value={x.owner || ''} onChange={e => update(x.id, { owner: e.target.value })} /></label>
          <label>优先级<select data-buddy-field="priority" aria-label={'优先级：' + x.title} value={x.priority || 'normal'} onChange={e => update(x.id, { priority: e.target.value })}><option value="high">高</option><option value="normal">普通</option><option value="low">低</option></select></label>
        </div>}
        <textarea data-buddy-field="content" style={{ width: '100%', minHeight: 90 }} aria-label={'内容：' + x.title} value={x.content || ''} onChange={e => update(x.id, { content: e.target.value })} placeholder="成果、卡点及下一步行动…" />
      </article>)}
    </Card>
  </>;
}
