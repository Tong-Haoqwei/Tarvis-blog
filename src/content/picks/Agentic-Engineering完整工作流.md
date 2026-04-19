---
title: "Agentic Engineering：从需求到发布的完整工作流"
date: 2026-04-18
source: "https://mp.weixin.qq.com/s/YAGaXOWh2GBPSNsQt5SlJg"
author: "seanguo"
tags: ["Agentic Engineering", "Claude Code", "AI Agent", "工程实践", "CI/CD"]
summary: "本文介绍了作者使用 Claude Code + 自定义 Skill/Command/MCP 体系，从需求到发布完成一次完整的 Agentic Engineering 实践。核心思路是：人负责定义目标、约束和质量标准，AI 作为自主智能体在结构化流程中执行规划、编码、测试和迭代，每个关键节点都有人工审核。文章详细展示了 11 个阶段的完整流程，包括需求获取、需求澄清、制定计划、并行开发、代码审查、编译部署、日志排查、创建 MR、AI 评审、修复意见、合入发布。"
---

## 文章核心要点

### Agentic Engineering 核心理念
- 人是编排者（Orchestrator），AI 是自主执行者
- 把 AI 的能力嵌入到有纪律的工程体系里
- 每个关键节点都有人工审核，不是让 AI 自由发挥

### 完整工作流（11 个阶段）

| 阶段 | 工具/Skill | 开发者角色 |
|------|------------|------------|
| ① 需求获取 | pm-dev | 口述需求 |
| ② 需求澄清 | brainstorming | 回答 2-3 个问题 |
| ③ 制定计划 | writing-plans | 审核计划 |
| ④ 并行开发 | executing-plans | 几乎无需干预 |
| ⑤ 代码自审 | code-review | 审核报告 |
| ⑥ 编译部署 | dtools | 确认部署参数 |
| ⑦ 日志排查 | galileo-log-query | 手动触发测试 |
| ⑧ 创建 MR | /create-mr | 确认 MR 信息 |
| ⑨ AI 评审 | /review-mr | 审核 AI 评审意见 |
| ⑩ 修复意见 | /fix-mr | 确认修复方案 |
| ⑪ 合入发布 | CI/CD | 点 Merge + 灰度发布 |

### Skill & Command 体系
- **Skill（技能）**：核心业务逻辑，由系统自动触发或被 Command 调用
- **Command（斜杠命令）**：用户主动调用的入口，轻量级路由
- **MCP Server**：通过 Model Context Protocol 连接外部平台 API

### 关键经验
- **Skill 不是一次写成的**：最有效的方法是跑一遍、复盘一次、AI 分析原因并自动改 Skill
- **顺序本身就是质量控制**：把顺序写死，避免 AI 优先做\"最像成果的那个\"
- **门禁是底线保障**：checklist + 门禁，确保 AI 交付质量从\"靠状态\"变成\"靠机制\"
