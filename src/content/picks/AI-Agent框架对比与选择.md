---
title: "AI Agent 框架对比与选择指南"
date: 2026-04-18
source: "https://mp.weixin.qq.com/s/JU_PmeOgSNUbNFdl-AIGKQ"
author: "yabohe"
tags: ["AI Agent", "框架对比", "LangChain", "LlamaIndex", "AutoGen", "工程架构"]
summary: "本文系统梳理了当前主流 AI Agent 框架的理论基础与工程实现。首先介绍了 ReAct、Plan-and-Execute、Reflection 三种核心 Agent 模式，然后对比了 LangChain、LlamaIndex、AutoGPT/AutoGen、CrewAI、LangGraph、Semantic Kernel 等主流框架的特点与适用场景。最后深入探讨了 Agent 框架的三大核心组件：LLM Call、Tools Call、Context Engineering，以及 Agent Loop 的工作原理。"
---

## 文章核心要点

### 三种核心 Agent 模式

**ReAct 模式**
- 推理（Reasoning）+ 执行（Acting）+ 观察（Observation）循环
- 适合需要与外部环境动态交互的任务

**Plan-and-Execute 模式**
- 先制定完整的多步计划，再按步骤执行
- 适合复杂且任务关系依赖明确的长期任务

**Reflection 模式**
- 通过语言反馈强化 Agent 决策
- Self-Refine：迭代反馈和改进提升 LLM 输出

### 主流框架对比

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| LangChain | 最成熟，工具链丰富 | 快速构建复杂 AI 应用 |
| LlamaIndex | 专注数据索引和检索 | RAG 知识密集型应用 |
| AutoGen | 多 Agent 协作 | 复杂任务分解和执行 |
| CrewAI | 角色扮演型 Agent 协作 | 模拟团队协作场景 |
| LangGraph | 状态图框架 | 复杂流程控制 |
| Semantic Kernel | 轻量级，与 Azure 集成 | .NET 生态 |

### Agent 框架三大核心

1. **LLM Call**：API 管理，兼容各大厂商
2. **Tools Call**：Function Call / MCP / 代码执行
3. **Context Engineering**：提示词工程，Agent 智能的核心

### Agent Loop 工作原理
本质是一个 While 循环，每次迭代是 LLM 推理 + 工具调用 + 上下文处理，直到任务完成退出。
