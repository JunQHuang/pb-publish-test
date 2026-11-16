import React from "react";
import {
  PageHead,
  Metric,
  Card,
  Tag,
  Progress,
  Bars,
  Icon,
  EmptyState,
} from "../ui/components";
export const statuses = [
  ["todo", "待处理", "#a2b2cc"],
  ["doing", "进行中", "#6389ed"],
  ["done", "已完成", "#58b5a0"],
  ["blocked", "有阻塞", "#e3aa69"],
];
export default function Overview({ data, navigate }) {
  const rows = data.deliveries || [],
    milestones = data.milestones || [],
    done = rows.filter((x) => x.status === "done").length,
    blocked = rows.filter((x) => x.status === "blocked");
  const counts = statuses.map(([key, label, color]) => ({
    key,
    label,
    color,
    value: rows.filter((x) => x.status === key).length,
  }));
  return (
    <>
      <PageHead
        eyebrow="DELIVERY WORKSPACE"
        title="项目概览"
        desc="把交付进展、验收事项与关键节点，汇聚在一个工作空间。"
        actions={
          <button
            className="bd-btn primary"
            onClick={() => navigate("deliveries")}
          >
            <Icon name="plus" size={15} />
            管理交付事项
          </button>
        }
      />
      <div className="ui-banner">
        <Icon name="box" size={23} />
        <div>
          <b>每一次交付，都更有把握</b>
          <p>从明确责任到完成验收，持续追踪每一个重要环节。</p>
        </div>
        <button className="ui-link" onClick={() => navigate("milestones")}>
          查看里程碑
          <Icon name="arrow" size={13} />
        </button>
      </div>
      <div className="bd-metrics">
        <Metric
          label="交付事项"
          value={rows.length}
          note="所有待验收的工作"
          icon="box"
        />
        <Metric
          label="已通过验收"
          value={done}
          note={
            rows.length
              ? Math.round((done / rows.length) * 100) + "% 总体完成率"
              : "等待第一项交付"
          }
          icon="check"
        />
        <Metric
          label="关键里程碑"
          value={milestones.length}
          note="按计划推进重要节点"
          icon="flag"
        />
        <Metric
          label="需要关注"
          value={blocked.length}
          note="当前存在阻塞的事项"
          icon="alert"
        />
      </div>
      <div className="ui-overview-grid">
        <Card
          title="交付进度"
          note="全量数据统计，不受列表筛选影响"
          actions={<Tag tone="blue">实时更新</Tag>}
        >
          <Progress label="验收完成情况" value={done} total={rows.length} />
          <div className="ui-status-grid">
            {counts.map((x) => (
              <div key={x.key}>
                <span>{x.label}</span>
                <b>{x.value}</b>
              </div>
            ))}
          </div>
        </Card>
        <Card title="状态分布" note="及时了解交付的运行状态">
          <Bars data={counts} />
        </Card>
      </div>
      <div className="ui-overview-bottom">
        <Card
          title="交付事项"
          note="最近添加的工作与负责人"
          actions={
            <button className="ui-link" onClick={() => navigate("deliveries")}>
              查看全部
              <Icon name="arrow" size={12} />
            </button>
          }
        >
          {rows.length ? (
            <ul className="ui-activity">
              {rows
                .slice(-4)
                .reverse()
                .map((x) => (
                  <li key={x.id}>
                    <span className="ui-activity-dot" />
                    <div>
                      <strong>{x.title}</strong>
                      <small>
                        {x.owner || "待分配负责人"} ·{" "}
                        {x.due || "未设置截止日期"}
                      </small>
                    </div>
                    <Tag>
                      {statuses.find((s) => s[0] === x.status)?.[1] || "待处理"}
                    </Tag>
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyState
              title="让交付从第一项开始"
              description="添加真实的验收事项与负责人，这里将展示最新进展。"
              action={
                <button
                  className="ui-link"
                  onClick={() => navigate("deliveries")}
                >
                  创建交付事项
                  <Icon name="arrow" size={13} />
                </button>
              }
            />
          )}
        </Card>
        <Card
          title="风险与关注"
          note="优先解决阻塞，让交付顺利向前"
          actions={
            <Tag tone={blocked.length ? "orange" : "green"}>
              {blocked.length ? "有待处理" : "暂无阻塞"}
            </Tag>
          }
        >
          {blocked.length ? (
            <ul className="ui-activity">
              {blocked.map((x) => (
                <li key={x.id}>
                  <Icon name="alert" size={17} />
                  <div>
                    <strong>{x.title}</strong>
                    <small>{x.owner || "请分配负责人"}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="当前没有阻塞事项"
              description="遇到问题时，把事项标记为「有阻塞」，便于集中跟进。"
              icon="check"
            />
          )}
        </Card>
      </div>
    </>
  );
}
