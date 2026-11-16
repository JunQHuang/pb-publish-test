const {test}=require('node:test');const assert=require('node:assert/strict');
const {openApp}=require('./fixture.cjs');
test('planning pack preserves filters, owner, priority and editable generated report',async t=>{
 const app=await openApp();t.after(()=>app.close());const q=s=>app.document.querySelector(s);
 await app.change(q('[data-buddy-field="new-title"]'),'完成接口联调');await app.click(q('[data-buddy-action="add-item"]'));
 await app.change(q('[aria-label="负责人：完成接口联调"]'),'测试负责人');
 await app.change(q('[aria-label="优先级：完成接口联调"]'),'high');
 await app.click(q('article button'));
 await app.change(q('[aria-label="筛选完成状态"]'),'open');assert.equal(app.document.querySelectorAll('article').length,0);
 await app.click(q('[data-buddy-nav="reports"]'));
 await app.click([...app.document.querySelectorAll('button')].find(x=>x.textContent==='从已完成计划生成报告'));
 assert.match(q('textarea').value,/完成接口联调.*测试负责人.*高/);
 await app.change(q('textarea'),'用户补充后的成果');
 const restored=await openApp({saved:await app.saved()});t.after(()=>restored.close());
 await restored.click(restored.document.querySelector('[data-buddy-nav="reports"]'));
 assert.equal(restored.document.querySelector('textarea').value,'用户补充后的成果');
});
