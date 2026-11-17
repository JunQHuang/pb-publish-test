import React, { useState } from "react";
import {
  PageHead,
  Card,
  Tabs,
  Icon,
  EmptyState,
  Modal,
} from "../ui/components";
import { statuses } from "./Overview";
export default function RecordList({
  collection,
  list,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const milestone = collection === "milestones";
  const [title, setTitle] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [overdueOnly, setOverdueOnly] = useState(false),
    [draft, setDraft] = useState(null);
  // due is a calendar date: compare against local today, not a UTC timestamp.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const shown = list.filter(
    (x) =>
      (filter === "all" || x.status === filter) &&
      (!query.trim() ||
        (x.title + " " + (x.owner || ""))
          .toLowerCase()
          .includes(query.trim().toLowerCase())) &&
      (milestone || !overdueOnly ||
        (x.status !== "done" && x.due && x.due < today)),
  );
  const add = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({ title: title.trim() });
      setTitle("");
    }
  };
  const download = () => {
    const rows = [
      ["事项", "负责人", "截止日期", "状态"],
      ...list.map((x) => [
        x.title,
        x.owner || "",
        x.due || "",
        statuses.find((s) => s[0] === x.status)?.[1] || x.status,
      ]),
    ];
    const raw =
      "\ufeff" +
      rows
        .map((r) =>
          r.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
        new Blob([raw], { type: "text/csv;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = collection + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <PageHead
        eyebrow={milestone ? "PROJECT MILESTONES" : "DELIVERY ACCEPTANCE"}
        title={milestone ? "里程碑计划" : "交付验收"}
        desc={
          milestone
            ? "明确关键节点与责任人，让每一步推进都有方向。"
            : "管理验收清单、明确责任分工，确保每一项交付都有结果。"
        }
        actions={
          <>
            <button
              className="bd-btn"
              onClick={download}
              disabled={!list.length}
            >
              <Icon name="download" size={15} />
              导出清单
            </button>
            <button
              className="bd-btn primary"
              onClick={() =>
                setDraft({ title: "", owner: "", due: "", status: "todo" })
              }
            >
              <Icon name="plus" size={15} />
              新建{milestone ? "里程碑" : "验收项"}
            </button>
          </>
        }
      />
      <Card
        title={milestone ? "项目里程碑" : "验收事项清单"}
        note="点击单元格即可编辑，修改将自动保存。"
      >
        <Tabs
          label="按事项状态筛选"
          items={[
            ["all", "全部事项", list.length],
            ...statuses.map(([s, label]) => [
              s,
              label,
              list.filter((x) => x.status === s).length,
            ]),
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="ui-filters">
          <label className="ui-search">
            <Icon name="search" size={15} />
            <input
              aria-label="搜索事项"
              placeholder="搜索事项名称或负责人"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="筛选状态"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">全部状态</option>
            {statuses.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {!milestone && (
            <label className="bd-btn delivery-overdue-filter">
              <input
                type="checkbox"
                role="switch"
                aria-label="仅看逾期"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
              />
              仅看逾期
            </label>
          )}
          <span className="ui-count">
            显示 {shown.length} / 全部 {list.length} 项
          </span>
        </div>
        <div className="ui-table-scroll">
          <table className="ui-table">
            <thead>
              <tr>
                <th>交付事项 / 名称</th>
                <th>负责人</th>
                <th>截止日期</th>
                <th>当前状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((x, index) => (
                <tr key={x.id} data-buddy-record={x.id}>
                  <td>
                    <input
                      className="ui-record-title"
                      data-buddy-field="title"
                      aria-label={"事项名称：" + x.title}
                      value={x.title}
                      onChange={(e) =>
                        onUpdate(x.id, { title: e.target.value })
                      }
                    />
                    <span className="ui-record-id">
                      {milestone ? "MS" : "DL"}-
                      {String(list.indexOf(x) + 1).padStart(3, "0")}
                    </span>
                  </td>
                  <td data-label="负责人">
                    <input
                      data-buddy-field="owner"
                      aria-label={"负责人：" + x.title}
                      placeholder="待分配"
                      value={x.owner || ""}
                      onChange={(e) =>
                        onUpdate(x.id, { owner: e.target.value })
                      }
                    />
                  </td>
                  <td data-label="截止日期">
                    <input
                      data-buddy-field="due"
                      type="date"
                      aria-label={"截止日期：" + x.title}
                      value={x.due || ""}
                      onChange={(e) => onUpdate(x.id, { due: e.target.value })}
                    />
                  </td>
                  <td data-label="当前状态">
                    <select
                      data-buddy-field="status"
                      aria-label={"状态：" + x.title}
                      value={x.status}
                      onChange={(e) =>
                        onUpdate(x.id, { status: e.target.value })
                      }
                    >
                      {statuses.map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="ui-icon-button"
                      aria-label={"删除：" + x.title}
                      title="删除"
                      onClick={() => onDelete(x.id)}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!shown.length && (
          <EmptyState
            icon={list.length ? "search" : "box"}
            title={
              list.length
                ? "没有匹配的事项"
                : milestone
                  ? "规划第一个关键节点"
                  : "准备好开始交付了吗？"
            }
            description={
              list.length
                ? "调整关键词或状态筛选，查看其他事项。"
                : "添加验收事项，记录负责人、截止日期与状态，建立清晰的交付节奏。"
            }
          />
        )}
        <form className="ui-quick-add" onSubmit={add}>
          <input
            data-buddy-field="new-title"
            aria-label="新增事项名称"
            placeholder={
              milestone ? "例如：完成客户验收" : "例如：客户培训与交接"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            className="bd-btn primary"
            type="submit"
            data-buddy-action="add-item"
          >
            <Icon name="plus" size={14} />
            添加事项
          </button>
        </form>
        <div className="ui-table-foot">
          <span>{list.length} 条事项 · 独立保存到当前项目</span>
          <span>直接编辑 · 自动保存</span>
        </div>
      </Card>
      {draft && (
        <Modal
          title={milestone ? "新建里程碑" : "新建验收项"}
          onClose={() => setDraft(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.title.trim()) {
                onAdd({ ...draft, title: draft.title.trim() });
                setDraft(null);
              }
            }}
          >
            <div className="ui-form-fields">
              <label>
                事项名称
                <input
                  required
                  aria-label="新建事项标题"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                  placeholder="简要描述要交付的工作"
                />
              </label>
              <label>
                负责人
                <input
                  aria-label="新建事项负责人"
                  value={draft.owner}
                  onChange={(e) =>
                    setDraft({ ...draft, owner: e.target.value })
                  }
                  placeholder="分配责任人"
                />
              </label>
              <label>
                截止日期
                <input
                  aria-label="新建事项截止日期"
                  type="date"
                  value={draft.due}
                  onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                />
              </label>
            </div>
            <div className="ui-form-actions">
              <button
                className="bd-btn"
                type="button"
                onClick={() => setDraft(null)}
              >
                取消
              </button>
              <button className="bd-btn primary" type="submit">
                创建事项
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
