---
title: "MCP 协议与 A2A 协议：Agent 互联互通的标准"
date: 2026-04-18
source: "https://mp.weixin.qq.com/s/pr8oQ9wEC7Oa1NvvW89j6w"
author: "seanguo"
tags: ["MCP", "A2A", "Agent 协议", "标准协议", "互操作性"]
summary: "本文介绍了 AI Agent 领域的两大核心协议：MCP（Model Context Protocol）和 A2A（Agent-to-Agent）。MCP 由 Anthropic 开发并捐赠给 Linux 基金会，成为 Agent 与外部系统交互的标准协议；A2A 由 Google 发布，解决不同 Agent 之间通信的问题。这两个协议的出现，标志着 AI Agent 从单点应用向规模化、互操作性方向发展的趋势。"
---

## 文章核心要点

### MCP 协议（Model Context Protocol）
- **定义**：Anthropic 发布的 Agent 与外部系统间交互的通信标准
- **作用**：让 Agent 能获取外部实时数据（天气、价格、新闻等动态数据）
- **发展**：2025 年 12 月捐赠给 Linux 基金会旗下组织 AAIF，成为中立行业标准

### MCP vs Function Calling
- Function Calling 与 OpenAI 深度绑定
- MCP 是更通用的标准，不依赖特定模型厂商

### A2A 协议（Agent-to-Agent）
- **发布**：Google 于 2025 年 4 月 9 日正式发布
- **作用**：解决不同 Agent 之间通信的中立标准协议
- **背景**：随着各行各业都在探索自己的 Agent，Agent 之间的通信需求自然出现

### RAG（检索增强生成）
- 通过检索知识库增强大模型的生成答案能力
- 核心：文档分片 → 向量化 → 语义匹配 → 整合输入大模型

### 技术趋势
- Agent 作为 AI 大模型和用户之间的桥梁
- 从单点应用向规模化、互操作性方向发展
- 上下文工程是 Agent 商业应用的关键
