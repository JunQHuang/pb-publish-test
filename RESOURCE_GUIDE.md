# Selected resources

{
  "scaffold": "web-workbench",
  "accelerator": "project-delivery",
  "existing_capabilities": {
    "collections": [
      "deliveries",
      "milestones"
    ],
    "fields": {
      "id": "stable string",
      "title": "required string",
      "owner": "optional string",
      "due": "optional YYYY-MM-DD",
      "status": [
        "todo",
        "doing",
        "done",
        "blocked"
      ]
    },
    "capabilities": [
      "项目概览与全量统计",
      "新增、编辑、删除验收项和里程碑",
      "负责人、日期和状态编辑",
      "名称/负责人关键词与状态组合筛选",
      "持久化保存与回归测试"
    ]
  },
  "business_entry": "src/Module.jsx",
  "business_components": "src/pack/",
  "backend": "backend/app.py: FastAPI /api/data with SQLite, revision CAS and installation authentication",
  "storage": "Preview: PB bridge. Independent run: own authenticated backend. Static-only: localStorage.",
  "extend": "Read the selected business files once. Implement only confirmed gaps. Preserve resource behavior and tests.",
  "verification": "verify_app -> review_app -> finish_development"
}