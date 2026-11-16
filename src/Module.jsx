import React from "react";
import Overview from "./pack/Overview";
import RecordList from "./pack/RecordList";
export const initialData = { deliveries: [], milestones: [] };
export const navigation = [
  { id: "overview", name: "项目概览" },
  { id: "deliveries", name: "交付验收" },
  { id: "milestones", name: "里程碑" },
];
export default function Module({ tab, data, setData, navigate }) {
  if (tab === "overview") return <Overview data={data} navigate={navigate} />;
  const collection = tab === "milestones" ? "milestones" : "deliveries";
  const mutate = (fn) =>
    setData((v) => ({ ...v, [collection]: fn(v[collection] || []) }));
  return (
    <RecordList
      key={collection}
      collection={collection}
      list={data[collection] || []}
      onAdd={(fields) =>
        mutate((rows) => [
          ...rows,
          {
            id: crypto.randomUUID(),
            title: "",
            owner: "",
            due: "",
            status: "todo",
            ...fields,
          },
        ])
      }
      onUpdate={(id, patch) =>
        mutate((rows) =>
          rows.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        )
      }
      onDelete={(id) => mutate((rows) => rows.filter((x) => x.id !== id))}
    />
  );
}
