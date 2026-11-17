// Presentation patterns adapted from the supplied ProjectBuddy v1.1 template.
import React, { useEffect, useRef } from "react";
export function Icon({ name = "grid", size = 18, ...props }) {
  const paths = {
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    check: "m5 12 4 4L19 6",
    flag: "M5 22V3m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0",
    box: "m12 3 9 5v8l-9 5-9-5V8Zm0 9 9-4m-9 4L3 8m9 4v9",
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    plus: "M12 5v14M5 12h14",
    arrow: "M5 12h14m-5-5 5 5-5 5",
    clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    alert: "m12 3 10 18H2Zm0 5v6m0 3v1",
    chevron: "m9 5 7 7-7 7",
    close: "m6 6 12 12M6 18 18 6",
    users:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m5 1a4 4 0 0 1 0 8m4 5v-2a4 4 0 0 0-3-4",
    trash: "M3 6h18M9 6V3h6v3m-10 0 1 15h12l1-15M10 10v7m4-7v7",
    edit: "m15 4 5 5-10 10-6 1 1-6ZM14 5l5 5",
    download: "M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5",
    menu: "M4 6h16M4 12h16M4 18h16",
    chart: "M4 3v18h17M8 15v-4m5 4V7m5 8v-9",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
export function PageHead({ eyebrow, title, desc, actions }) {
  return (
    <header className="bd-pagehead">
      <div>
        {eyebrow && <span className="ui-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {actions && <div className="bd-actions">{actions}</div>}
    </header>
  );
}
export function Tag({ children, tone = "" }) {
  return <span className={"bd-tag " + tone}>{children}</span>;
}
export function Metric({ label, value, note, icon = "chart", tone = "" }) {
  return (
    <div className={"bd-metric " + tone}>
      <div className="ui-metric-label">
        <span>{label}</span>
        <span className="ui-icon-tile">
          <Icon name={icon} />
        </span>
      </div>
      <b>{value}</b>
      {note && <small>{note}</small>}
    </div>
  );
}
export function Card({ title, note, actions, children, className = "" }) {
  return (
    <section className={"bd-card " + className}>
      <div className="bd-cardhead">
        <div>
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
export function Tabs({ items, value, onChange, label = "内容视图" }) {
  return (
    <nav className="bd-tabs" role="tablist" aria-label={label}>
      {items.map(([key, label, count]) => (
        <button
          key={key}
          role="tab"
          type="button"
          aria-selected={value === key}
          className={value === key ? "is-active" : ""}
          onClick={() => onChange(key)}
        >
          {label}
          {count !== undefined && <span className="ui-tab-count">{count}</span>}
        </button>
      ))}
    </nav>
  );
}
export function EmptyState({ title, description, action, icon = "box" }) {
  return (
    <div className="ui-empty">
      <span className="ui-empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Progress({ label, value, total }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ui-progress">
      <div>
        <span>{label}</span>
        <b>
          {value}
          <small> / {total}</small>
        </b>
      </div>
      <div
        className="ui-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <i style={{ width: percent + "%" }} />
      </div>
      <small>{total ? percent + "% 已完成" : "添加记录后展示实际进度"}</small>
    </div>
  );
}
export function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div
      className="bd-bars"
      role="img"
      aria-label={data.map((d) => d.label + " " + d.value).join("，")}
    >
      {data.map((d) => (
        <div key={d.label}>
          <b>{d.value}</b>
          <i
            style={{
              height: Math.max(2, (d.value / max) * 85) + "px",
              background: d.color || "var(--ui-primary)",
            }}
          />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
export function Modal({ title, children, onClose, footer }) {
  const ref = useRef(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const before = document.activeElement,
      node = ref.current;
    node?.querySelector("input,button,select,textarea")?.focus();
    const key = (e) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const all = [
          ...node.querySelectorAll(
            'input,button,select,textarea,[tabindex="0"]',
          ),
        ].filter((x) => !x.disabled);
        const first = all[0],
          last = all.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    node?.addEventListener("keydown", key);
    return () => {
      node?.removeEventListener("keydown", key);
      before?.focus?.();
    };
  }, []);
  return (
    <div
      className="bd-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className="bd-modalbox bd-narrow"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ui-dialog-head">
          <h2>{title}</h2>
          <button
            className="ui-icon-button"
            aria-label="关闭对话框"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  );
}
