const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openApp } = require('./fixture.cjs');

// Each JSDOM window gets its own fixed instant and local calendar, independent
// of the test runner's timezone. UTC deliberately falls on a different day.
function freezeLocalClock(window, instant, offsetMinutes) {
  const NativeDate = window.Date;
  const fixed = NativeDate.parse(instant);
  const local = date => new NativeDate(date.getTime() + offsetMinutes * 60000);
  window.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [fixed])); }
    static now() { return fixed; }
    getFullYear() { return local(this).getUTCFullYear(); }
    getMonth() { return local(this).getUTCMonth(); }
    getDate() { return local(this).getUTCDate(); }
    getTimezoneOffset() { return -offsetMinutes; }
  };
}

const q = (app, selector) => app.document.querySelector(selector);
const navigate = (app, tab) => app.click(q(app, `[data-buddy-nav="${tab}"]`));
const toggle = app => [...app.document.querySelectorAll('button')]
  .find(button => button.textContent.trim() === '仅看逾期');
const titles = app => app.records().map(row => row.querySelector('[data-buddy-field="title"]').value);
const rows = app => app.records().map(row => ({
  id: row.dataset.buddyRecord,
  ...Object.fromEntries(['title', 'owner', 'due', 'status'].map(field =>
    [field, row.querySelector(`[data-buddy-field="${field}"]`).value])),
}));
async function addRow(app, record) {
  await app.change(q(app, '[data-buddy-field="new-title"]'), record.title);
  await app.click(q(app, '[data-buddy-action="add-item"]'));
  const row = app.records().at(-1);
  for (const field of ['owner', 'due', 'status']) {
    await app.change(row.querySelector(`[data-buddy-field="${field}"]`), record[field]);
  }
}
function overview(app) {
  const metrics = [...q(app, '.bd-metrics').children].map(node => node.textContent);
  const counts = [...app.document.querySelectorAll('.ui-status-grid > div')].map(node => ({
    label: node.querySelector('span').textContent,
    count: Number(node.querySelector('b').textContent),
  }));
  return { metrics, counts };
}

for (const clock of [
  { name: 'UTC+8 跨年凌晨', instant: '2030-12-31T16:30:00Z', offsetMinutes: 480,
    yesterday: '2030-12-31', today: '2031-01-01', tomorrow: '2031-01-02' },
  { name: 'UTC-8 跨年深夜', instant: '2031-01-01T07:30:00Z', offsetMinutes: -480,
    yesterday: '2030-12-30', today: '2030-12-31', tomorrow: '2031-01-01' },
]) {
  test(`仅看逾期：${clock.name}，日期/状态交集、恢复、全量统计与持久化`, async t => {
    const app = await openApp();
    t.after(() => app.close());
    freezeLocalClock(app.window, clock.instant, clock.offsetMinutes);
    const now = new app.window.Date();
    assert.notEqual(now.toISOString().slice(0, 10), clock.today);
    assert.equal(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`, clock.today);

    await navigate(app, 'deliveries');
    assert.equal(toggle(app).getAttribute('aria-pressed'), 'false');
    const statuses = ['todo', 'doing', 'done', 'blocked'];
    const days = [['昨天', clock.yesterday], ['今天', clock.today], ['明天', clock.tomorrow], ['无日期', '']];
    for (const status of statuses) {
      for (const [day, due] of days) {
        await addRow(app, { title: `${day}-${status}`, due, status,
          owner: ['todo', 'done'].includes(status) ? '林工' : '周工' });
      }
    }
    const allDeliveries = rows(app);
    assert.equal(allDeliveries.length, 16);
    await navigate(app, 'milestones');
    assert.equal(toggle(app), undefined, '里程碑不增加逾期筛选');
    for (const status of statuses) {
      await addRow(app, { title: `节点-${status}`, owner: '项目负责人', due: clock.yesterday, status });
    }
    const allMilestones = rows(app);
    await navigate(app, 'overview');
    assert.equal(toggle(app), undefined);
    const fullOverview = overview(app);
    assert.match(fullOverview.metrics[0], /交付事项/);
    assert.match(fullOverview.metrics[0], /16/);
    assert.match(fullOverview.metrics[1], /已通过验收/);
    assert.match(fullOverview.metrics[1], /4/);
    assert.match(fullOverview.metrics[2], /关键里程碑/);
    assert.match(fullOverview.metrics[2], /4/);
    assert.match(fullOverview.metrics[3], /需要关注/);
    assert.match(fullOverview.metrics[3], /4/);
    assert.deepEqual(fullOverview.counts, [
      { label: '待处理', count: 4 }, { label: '进行中', count: 4 },
      { label: '已完成', count: 4 }, { label: '有阻塞', count: 4 },
    ]);
    const savedBefore = await app.saved();

    await navigate(app, 'deliveries');
    await app.click(toggle(app));
    assert.equal(toggle(app).getAttribute('aria-pressed'), 'true');
    assert.deepEqual(titles(app), ['昨天-todo', '昨天-doing', '昨天-blocked']);
    for (const status of statuses) {
      await app.change(q(app, '[aria-label="筛选状态"]'), status);
      assert.deepEqual(titles(app), status === 'done' ? [] : [`昨天-${status}`]);
    }
    await app.change(q(app, '[aria-label="筛选状态"]'), 'all');
    await app.change(q(app, '[aria-label="搜索事项"]'), ' 昨天 ');
    assert.deepEqual(titles(app), ['昨天-todo', '昨天-doing', '昨天-blocked']);
    await app.change(q(app, '[aria-label="搜索事项"]'), ' 周工 ');
    assert.deepEqual(titles(app), ['昨天-doing', '昨天-blocked']);
    await app.change(q(app, '[aria-label="筛选状态"]'), 'doing');
    assert.deepEqual(titles(app), ['昨天-doing']);
    await app.click(toggle(app));
    assert.equal(q(app, '[aria-label="搜索事项"]').value, ' 周工 ');
    assert.equal(q(app, '[aria-label="筛选状态"]').value, 'doing');
    assert.deepEqual(titles(app), days.map(([day]) => `${day}-doing`));
    await app.click(toggle(app));
    assert.deepEqual(titles(app), ['昨天-doing']);
    await app.change(q(app, '[aria-label="搜索事项"]'), '不存在');
    assert.deepEqual(titles(app), []);
    assert.ok(app.document.body.textContent.includes('没有匹配的事项'));
    await app.change(q(app, '[aria-label="搜索事项"]'), '林工');
    await app.change(q(app, '[aria-label="筛选状态"]'), 'done');
    assert.deepEqual(titles(app), [], '已完成与仅看逾期的交集必须为空');
    await app.click(toggle(app));
    assert.deepEqual(titles(app), days.map(([day]) => `${day}-done`));
    await app.click(toggle(app));
    // Invalid creation must not mutate data, including while results are empty.
    await app.change(q(app, '[data-buddy-field="new-title"]'), '   ');
    await app.click(q(app, '[data-buddy-action="add-item"]'));
    assert.deepEqual(await app.saved(), savedBefore);

    // Inspect overview after enabled and disabled filter states separately.
    await navigate(app, 'overview');
    assert.deepEqual(overview(app), fullOverview);
    await navigate(app, 'deliveries');
    await app.change(q(app, '[aria-label="搜索事项"]'), '周工');
    await app.change(q(app, '[aria-label="筛选状态"]'), 'doing');
    await app.click(toggle(app));
    await app.click(toggle(app));
    await navigate(app, 'overview');
    assert.deepEqual(overview(app), fullOverview);
    assert.deepEqual(await app.saved(), savedBefore, '所有筛选都不能写入或删改存储');

    await navigate(app, 'deliveries');
    await app.click(toggle(app));
    const restored = await openApp({ saved: await app.saved() });
    t.after(() => restored.close());
    await navigate(restored, 'deliveries');
    assert.equal(toggle(restored).getAttribute('aria-pressed'), 'false');
    assert.deepEqual(rows(restored), allDeliveries, '刷新保留所有 id 与原有字段');
    await navigate(restored, 'milestones');
    assert.equal(toggle(restored), undefined);
    assert.deepEqual(rows(restored), allMilestones);
    await navigate(restored, 'overview');
    assert.deepEqual(overview(restored), fullOverview);
    assert.deepEqual(await restored.saved(), savedBefore);
  });
}
