const {test}=require('node:test');const assert=require('node:assert/strict');
const {openApp}=require('./fixture.cjs');
test('workspace renders navigation and editable business data',async t=>{const app=await openApp();t.after(()=>app.close());assert.ok(app.document.querySelector('h1').textContent);assert.ok(app.document.querySelectorAll('nav button').length>=1);});

test('missing test targets report available controls instead of a null prototype error',async t=>{const app=await openApp();t.after(()=>app.close());await assert.rejects(app.change(null,'x'),/fixture target missing.*Available controls/);});
