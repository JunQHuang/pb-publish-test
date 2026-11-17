const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openApp } = require('./fixture.cjs');

// Freeze the browser clock and local calendar getters without depending on host TZ.
function freezeLocalToday(app, instant, offsetMinutes) {
  const NativeDate = app.window.Date;
  const timestamp = NativeDate.parse(instant);
  const local = new NativeDate(timestamp + offsetMinutes * 60_000);
  app.window.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [timestamp])); }
    static now() { return timestamp; }
    getFullYear() { return local.getUTCFullYear(); }
    getMonth() { return local.getUTCMonth(); }
    getDate() { return local.getUTCDate(); }
    getTimezoneOffset() { return -offsetMinutes; }
  };
  const now = new app.window.Date();
  assert.deepEqual([now.getFullYear(), now.getMonth() + 1, now.getDate()], [2030, 1, 1]);
  assert.notEqual(now.toISOString().slice(0, 10), '2030-01-01');
}

function records(app) {
  return app.records().map(row => Object.fromEntries([
    ['id', row.dataset.buddyRecord],
    ...['title', 'owner', 'due', 'status'].map(field => [
      field, row.querySelector(`[data-buddy-field="${field}"]`).value,
    ]),
  ]));
}

async function add(app, title, fields = {}) {
  const q = selector => app.document.querySelector(selector);
  await app.change(q('[data-buddy-field="new-title"]'), title);
  await app.click(q('[data-buddy-action="add-item"]'));
  const row = app.records().at(-1);
  for (const [field, value] of Object.entries(fields)) {
    await app.change(row.querySelector(`[data-buddy-field="${field}"]`), value);
  }
}

for (const boundary of [
  { name: 'local day ahead of UTC across year boundary', instant: '2029-12-31T23:30:00Z', offset: 120 },
  { name: 'local day behind UTC', instant: '2030-01-02T00:30:00Z', offset: -120 },
]) {
  test(`delivery overdue filter: ${boundary.name}`, async t => {
    const app = await openApp();
    t.after(() => app.close());
    freezeLocalToday(app, boundary.instant, boundary.offset);
    const q = selector => app.document.querySelector(selector);
    const nav = tab => app.click(q(`[data-buddy-nav="${tab}"]`));
    const toggle = () => q('[role="switch"][aria-label="仅看逾期"]');
    const titles = () => records(app).map(row => row.title);
    const overview = () => ({
      metrics: [...app.document.querySelectorAll('.bd-metric b')].map(el => el.textContent),
      statuses: [...app.document.querySelectorAll('.ui-status-grid b')].map(el => el.textContent),
      text: q('main').textContent,
    });

    await nav('deliveries');
    assert.equal(toggle().checked, false);
    const days = [
      ['yesterday', '2029-12-31'], ['today', '2030-01-01'],
      ['tomorrow', '2030-01-02'], ['undated', ''],
    ];
    for (const status of ['todo', 'doing', 'blocked', 'done']) {
      for (const [day, due] of days) {
        await add(app, `Release ${status} ${day}`, {
          owner: status === 'doing' ? 'Bob' : 'Alice', due, status,
        });
      }
    }
    const allDeliveries = records(app);
    assert.equal(allDeliveries.length, 16);

    await nav('milestones');
    assert.equal(toggle(), null, 'no new filter on milestones');
    await add(app, '阶段一', { due: '2029-12-31', status: 'done' });
    await add(app, '阶段二');
    const allMilestones = records(app);
    await app.change(q('[aria-label="筛选状态"]'), 'done');
    assert.deepEqual(titles(), ['阶段一']);
    await nav('overview');
    const fullOverview = overview();
    assert.deepEqual(fullOverview.metrics, ['16', '4', '2', '4']);
    assert.deepEqual(fullOverview.statuses, ['4', '4', '4', '4']);
    const savedBefore = await app.saved();

    await nav('deliveries');
    assert.equal(toggle().checked, false);
    assert.deepEqual(records(app), allDeliveries);
    await app.click(toggle());
    assert.equal(toggle().checked, true);
    assert.deepEqual(titles(), [
      'Release todo yesterday', 'Release doing yesterday', 'Release blocked yesterday',
    ]);
    // All four statuses x yesterday/today/tomorrow/no date, including completed past due.
    for (const status of ['todo', 'doing', 'blocked', 'done']) {
      await app.change(q('[aria-label="筛选状态"]'), status);
      assert.deepEqual(titles(), status === 'done' ? [] : [`Release ${status} yesterday`]);
    }
    for (const [query, status, expected] of [
      ['  TODO  ', 'all', ['Release todo yesterday']],
      [' aLiCe ', 'all', ['Release todo yesterday', 'Release blocked yesterday']],
      [' aLiCe ', 'doing', []],
      [' aLiCe ', 'blocked', ['Release blocked yesterday']],
      [' aLiCe ', 'done', []],
      ['不存在', 'todo', []],
    ]) {
      await app.change(q('[aria-label="搜索事项"]'), query);
      await app.change(q('[aria-label="筛选状态"]'), status);
      assert.deepEqual(titles(), expected);
      if (!expected.length) assert.match(q('main').textContent, /没有匹配的事项/);
    }

    await app.change(q('[aria-label="搜索事项"]'), ' aLiCe ');
    await app.change(q('[aria-label="筛选状态"]'), 'blocked');
    await app.click(toggle());
    assert.equal(toggle().checked, false);
    assert.equal(q('[aria-label="搜索事项"]').value, ' aLiCe ');
    assert.equal(q('[aria-label="筛选状态"]').value, 'blocked');
    assert.deepEqual(records(app), allDeliveries.filter(row => row.status === 'blocked'));
    await app.click(toggle());
    assert.deepEqual(titles(), ['Release blocked yesterday']);

    // Excluding every record (done AND overdue) is harmless and uses the existing empty state.
    await app.change(q('[aria-label="筛选状态"]'), 'done');
    assert.deepEqual(titles(), []);
    assert.match(q('main').textContent, /没有匹配的事项/);
    assert.deepEqual(await app.saved(), savedBefore, 'filters must not write business data');
    await nav('overview');
    assert.deepEqual(overview(), fullOverview, 'all overview statistics stay independent of filters');

    await nav('milestones');
    assert.equal(toggle(), null);
    assert.deepEqual(records(app), allMilestones);
    // Save/reload while a filter is active, not after clearing it.
    await nav('deliveries');
    await app.change(q('[aria-label="搜索事项"]'), 'Bob');
    await app.change(q('[aria-label="筛选状态"]'), 'doing');
    await app.click(toggle());
    assert.deepEqual(titles(), ['Release doing yesterday']);
    const savedAfter = await app.saved();
    assert.deepEqual(savedAfter, savedBefore);
    const restored = await openApp({ saved: savedAfter });
    t.after(() => restored.close());
    await restored.click(restored.document.querySelector('[data-buddy-nav="deliveries"]'));
    assert.equal(restored.document.querySelector('[aria-label="仅看逾期"]').checked, false);
    assert.deepEqual(records(restored), allDeliveries, 'reload retains every id and field');
    await restored.click(restored.document.querySelector('[data-buddy-nav="milestones"]'));
    assert.deepEqual(records(restored), allMilestones);
    assert.deepEqual(await restored.saved(), savedBefore);
  });
}
