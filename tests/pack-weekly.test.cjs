const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const { openApp } = require('./fixture.cjs');
const compiled = buildSync({ entryPoints: ['src/pack/weekly.js'], bundle: true, write: false, platform: 'node', format: 'cjs' }).outputFiles[0].text;
const weeklyModule = { exports: {} };
new Function('module', 'exports', compiled)(weeklyModule, weeklyModule.exports);
const { currentWeek, localDate, weekLabel, completedThisWeek, weeklyContent } = weeklyModule.exports;
const field = name => `[data-buddy-field="${name}"]`;
const action = name => `[data-buddy-action="${name}"]`;
const stored = saved => Object.entries(saved).map(([key, value]) => [key, JSON.parse(value)]).find(([, value]) => Array.isArray(value.plans) && Array.isArray(value.reports));
const freeze = (app, date) => {
  const OriginalDate = app.window.Date;
  app.window.Date = class extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : [date.getTime()])); }
    static now() { return date.getTime(); }
  };
};
async function add(app, title) {
  await app.change(app.document.querySelector(field('new-title')), title);
  await app.click(app.document.querySelector(action('add-item')));
}

test('local weeks use Monday midnight, calendar dates and an exclusive next Monday', () => {
  for (const now of [new Date(2026, 10, 16, 0), new Date(2026, 10, 22, 23, 59), new Date(2027, 0, 1, 12), new Date(2026, 2, 8, 12), new Date(2026, 10, 1, 12)]) {
    const range = currentWeek(now);
    assert.equal(range.start.getDay(), 1);
    assert.equal(range.start.getHours(), 0);
    assert.equal(range.start.getMinutes(), 0);
    assert.equal(range.end.getDay(), 1);
    assert.equal(range.end.getHours(), 0);
    const expectedEnd = new Date(range.start); expectedEnd.setDate(expectedEnd.getDate() + 7);
    assert.equal(+range.end, +expectedEnd);
    assert.ok(+now >= +range.start && +now < +range.end);
    const records = [
      { id: 'start', done: true, completedAt: range.start.toISOString() },
      { id: 'last', done: true, completedAt: new Date(+range.end - 1).toISOString() },
      { id: 'before', done: true, completedAt: new Date(+range.start - 1).toISOString() },
      { id: 'end', done: true, completedAt: range.end.toISOString() },
      { id: 'legacy', done: true },
      { id: 'invalid', done: true, completedAt: 'not-a-date' },
      { id: 'null', done: true, completedAt: null },
      { id: 'canceled', done: false, completedAt: range.start.toISOString() },
      { id: 'not-boolean', done: 'true', completedAt: range.start.toISOString() }
    ];
    assert.deepEqual(completedThisWeek(records, range).map(x => x.id), ['start', 'last']);
    assert.match(weeklyContent([], range), /本周完成：0 项.*本周暂无完成计划/s);
  }
  const yearBoundary = currentWeek(new Date(2027, 0, 1));
  assert.equal(localDate(yearBoundary.start), '2026-12-28');
  assert.equal(localDate(yearBoundary.end), '2027-01-04');
});

test('completion timestamps reset, filters and report history survive fresh windows; blank titles are rejected', async t => {
  const app = await openApp(); t.after(() => app.close());
  const q = selector => app.document.querySelector(selector);
  await add(app, '   ');
  assert.equal(app.records().length, 0);
  assert.match(q('[role="alert"]').textContent, /请填写事项名称/);
  await add(app, '  周报验收计划  ');
  const record = () => app.records()[0];
  await app.change(record().querySelector(field('owner')), '负责人甲');
  for (const priority of ['high', 'low', 'normal', 'high']) {
    await app.change(record().querySelector(field('priority')), priority);
    assert.equal(stored(await app.saved())[1].plans[0].priority, priority);
  }
  await app.change(record().querySelector(field('content')), '已完成回归');
  const firstTime = new Date(2026, 10, 17, 9);
  freeze(app, firstTime);
  await app.click(record().querySelector(field('done')));
  let plan = stored(await app.saved())[1].plans[0];
  assert.equal(plan.title, '周报验收计划');
  assert.equal(plan.done, true);
  assert.equal(plan.completedAt, firstTime.toISOString());
  await app.change(q('[aria-label="筛选完成状态"]'), 'open');
  assert.equal(app.records().length, 0);
  await app.change(q('[aria-label="筛选完成状态"]'), 'done');
  assert.equal(app.records().length, 1);
  await app.click(record().querySelector(field('done')));
  plan = stored(await app.saved())[1].plans[0];
  assert.equal(plan.done, false);
  assert.equal(plan.completedAt, null);
  await app.click(q('[data-buddy-nav="reports"]'));
  await app.click(q(action('generate-report')));
  assert.match(app.records()[0].querySelector(field('content')).value, /本周暂无完成计划/);
  await add(app, ' \t ');
  assert.equal(app.records().length, 1, 'blank report titles do not create a record');
  await app.change(q(field('new-title')), '');
  await app.click(q('[data-buddy-nav="plans"]'));
  await app.change(q('[aria-label="筛选完成状态"]'), 'all');
  const secondTime = new Date(2026, 10, 18, 10);
  freeze(app, secondTime);
  await app.click(record().querySelector(field('done')));
  assert.equal(stored(await app.saved())[1].plans[0].completedAt, secondTime.toISOString());
  await app.click(q('[data-buddy-nav="reports"]'));
  await app.click(q(action('generate-report')));
  const report = app.records()[1];
  const reportId = report.dataset.buddyRecord;
  assert.match(report.querySelector(field('content')).value, /周报验收计划.*负责人甲.*高/);
  assert.match(report.querySelector(field('content')).value, /已完成回归/);
  await app.change(report.querySelector(field('content')), '已编辑的本周成果与下周安排');
  const saved = await app.saved();
  const restored = await openApp({ saved }); t.after(() => restored.close());
  assert.equal(restored.records().length, 1);
  assert.equal(restored.records()[0].querySelector(field('owner')).value, '负责人甲');
  assert.equal(restored.records()[0].querySelector(field('priority')).value, 'high');
  assert.equal(stored(await restored.saved())[1].plans[0].completedAt, secondTime.toISOString());
  await restored.click(restored.document.querySelector('[data-buddy-nav="reports"]'));
  const history = restored.document.querySelector(`[data-buddy-record="${reportId}"]`);
  assert.equal(history.querySelector(field('content')).value, '已编辑的本周成果与下周安排');
  await restored.change(history.querySelector(field('content')), '历史报告再次修订');
  const reopened = await openApp({ saved: await restored.saved() }); t.after(() => reopened.close());
  await reopened.click(reopened.document.querySelector('[data-buddy-nav="reports"]'));
  assert.equal(reopened.document.querySelector(`[data-buddy-record="${reportId}"] ${field('content')}`).value, '历史报告再次修订');
  assert.equal(reopened.records().length, 2, 'editing history preserves other reports');
});

test('generated weekly reports exclude cross-week and undated history without modifying stored records', async t => {
  const seed = await openApp(); t.after(() => seed.close());
  await add(seed, '用于取得现有存储键');
  const saved = await seed.saved();
  const [key, data] = stored(saved);
  const now = new Date(2026, 10, 19, 12);
  const range = currentWeek(now);
  const make = (id, time, done = true) => ({ id, title: id, content: '', owner: '', priority: 'normal', done, ...(time === undefined ? {} : { completedAt: time }) });
  data.plans = [
    make('周一零点纳入', range.start.toISOString()),
    make('周日最后毫秒纳入', new Date(+range.end - 1).toISOString()),
    make('上周排除', new Date(+range.start - 1).toISOString()),
    make('下周零点排除', range.end.toISOString()),
    make('历史无日期排除'),
    make('错误日期排除', 'bad-date'),
    make('未完成排除', range.start.toISOString(), false)
  ];
  data.reports = [{ id: 'history', title: '历史周报', content: '保留历史内容', done: false }];
  saved[key] = JSON.stringify(data);
  const app = await openApp({ saved }); t.after(() => app.close());
  freeze(app, now);
  await app.click(app.document.querySelector('[data-buddy-nav="reports"]'));
  await app.click(app.document.querySelector(action('generate-report')));
  assert.ok(app.document.querySelector(field('week-range')).textContent.includes(weekLabel(range)));
  const content = app.records()[1].querySelector(field('content')).value;
  assert.ok(content.includes(weekLabel(range)));
  assert.match(content, /本周完成：2 项/);
  assert.match(content, /周一零点纳入/);
  assert.match(content, /周日最后毫秒纳入/);
  assert.doesNotMatch(content, /排除/);
  const persisted = stored(await app.saved())[1];
  assert.deepEqual(persisted.plans, data.plans);
  assert.deepEqual(persisted.reports[0], data.reports[0]);
});

test('an empty week can generate and persist an editable report', async t => {
  const app = await openApp(); t.after(() => app.close());
  await app.click(app.document.querySelector('[data-buddy-nav="reports"]'));
  const button = app.document.querySelector(action('generate-report'));
  assert.equal(button.disabled, false);
  await app.click(button);
  assert.equal(app.records().length, 1);
  assert.match(app.records()[0].querySelector(field('content')).value, /本周完成：0 项.*本周暂无完成计划/s);
  await app.change(app.records()[0].querySelector(field('content')), '本周调研中，下周继续推进');
  const restored = await openApp({ saved: await app.saved() }); t.after(() => restored.close());
  await restored.click(restored.document.querySelector('[data-buddy-nav="reports"]'));
  assert.equal(restored.records()[0].querySelector(field('content')).value, '本周调研中，下周继续推进');
});
