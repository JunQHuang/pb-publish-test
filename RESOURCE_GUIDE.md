# Selected resources

{
  "scaffold": "web-workbench",
  "accelerator": "work-planning",
  "existing_capabilities": {
    "collections": [
      "plans",
      "reports"
    ],
    "fields": {
      "id": "stable string",
      "title": "required string",
      "content": "optional string",
      "owner": "optional string",
      "priority": [
        "high",
        "normal",
        "low"
      ],
      "done": "boolean"
    },
    "capabilities": [
      "计划负责人、优先级、完成状态编辑",
      "按完成状态筛选",
      "按本地时区周一至下周一汇总本周完成计划，排除无时间的历史记录",
      "报告保存与历史编辑",
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