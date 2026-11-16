const {test}=require('node:test');const assert=require('node:assert/strict');
const {openApp}=require('./fixture.cjs');
test('delivery pack filters without deleting records and persists owner/status',async t=>{
 const app=await openApp();t.after(()=>app.close());const q=s=>app.document.querySelector(s);
 await app.click(q('[data-buddy-nav="deliveries"]'));
 for(const name of ['客户交接','内部部署']){await app.change(q('[data-buddy-field="new-title"]'),name);await app.click(q('[data-buddy-action="add-item"]'));}
 await app.change(q('[aria-label="负责人：客户交接"]'),'交付负责人');
 await app.change(q('[aria-label="状态：客户交接"]'),'blocked');
 await app.change(q('[aria-label="筛选状态"]'),'blocked');
 assert.equal(app.document.querySelectorAll('tbody tr').length,1);
 assert.equal(q('[data-buddy-record] [data-buddy-field=title]').value,'客户交接');
 await app.change(q('[aria-label="搜索事项"]'),'不存在');
 assert.equal(app.document.querySelectorAll('tbody tr').length,0);
 const restored=await openApp({saved:await app.saved()});t.after(()=>restored.close());
 await restored.click(restored.document.querySelector('[data-buddy-nav="deliveries"]'));
 assert.equal(restored.document.querySelectorAll('tbody tr').length,2);
 assert.equal(restored.document.querySelector('[aria-label="负责人：客户交接"]').value,'交付负责人');
 assert.equal(restored.document.querySelector('[aria-label="状态：客户交接"]').value,'blocked');
});
test('editable title, date, milestones and modal keep stable records across reload',async t=>{
 const a=await openApp();t.after(()=>a.close());const q=s=>a.document.querySelector(s);
 await a.click(q('[data-buddy-nav="deliveries"]'));
 await a.change(q('[data-buddy-field="new-title"]'),'原始事项');await a.click(q('[data-buddy-action="add-item"]'));
 const id=q('[data-buddy-record]').dataset.buddyRecord;
 await a.change(q('[data-buddy-field="title"]'),'修改后的事项');await a.change(q('[data-buddy-field="due"]'),'2030-12-31');
 assert.equal(q('[data-buddy-record]').dataset.buddyRecord,id);
 await a.click(q('[data-buddy-nav="milestones"]'));
 await a.change(q('[data-buddy-field="new-title"]'),'第一阶段');await a.click(q('[data-buddy-action="add-item"]'));
 const b=await openApp({saved:await a.saved()});t.after(()=>b.close());await b.click(b.document.querySelector('[data-buddy-nav="deliveries"]'));
 assert.equal(b.document.querySelector('[data-buddy-field="title"]').value,'修改后的事项');assert.equal(b.document.querySelector('[data-buddy-field="due"]').value,'2030-12-31');
 await a.click([...a.document.querySelectorAll('button')].find(x=>x.textContent==='新建里程碑'));
 assert.ok(q('[role="dialog"]'));await a.change(q('[aria-label="新建事项标题"]'),'第二阶段');await a.click([...q('[role="dialog"]').querySelectorAll('button')].find(x=>x.textContent==='创建事项'));assert.equal(a.records().length,2);assert.equal(q('[role="dialog"]'),null);
});
