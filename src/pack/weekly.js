export function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function currentWeek(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

export function weekLabel({ start, end }) {
  return `${localDate(start)}（周一）00:00（含）至 ${localDate(end)}（周一）00:00（不含）`;
}

export function completedThisWeek(plans, { start, end }) {
  return plans.filter(plan => {
    if (plan.done !== true || typeof plan.completedAt !== 'string' || !plan.completedAt) return false;
    const time = Date.parse(plan.completedAt);
    return time >= start.getTime() && time < end.getTime();
  });
}

export function completionPatch(done, now = new Date()) {
  return { done, completedAt: done ? now.toISOString() : null };
}

export function weeklyContent(plans, range) {
  const completed = completedThisWeek(plans, range);
  const entries = completed.map(plan => '• ' + plan.title + '（负责人：' + (plan.owner || '未填写') + '；优先级：' + ({ high: '高', normal: '普通', low: '低' }[plan.priority] || '普通') + '）' + (plan.content ? '\n' + plan.content : ''));
  return `统计范围（浏览器本地时区）：${weekLabel(range)}\n\n本周完成：${completed.length} 项\n\n${entries.join('\n\n') || '本周暂无完成计划。'}`;
}
