---
title: "AI Agent 极简实现：从理论到实践"
date: 2026-04-18
source: "https://mp.weixin.qq.com/s/ri_lxDGayM-e5A0oAW59Fw"
author: "seanguo"
tags: ["AI Agent", "ReAct", "工具调用", "Python 实现", "DeepSeek"]
summary: "本文从工程实践角度，详细介绍了如何从头实现一个极简的 AI Agent 框架。作者以 DeepSeek 模型为例，展示了 Agent 框架的三大核心组件：LLM Call（使用 OpenAI SDK）、Tools Call（shell_exec、file_read、file_write、python_exec 四个工具）、Context Engineering（System Prompt + Session 管理）。文章提供了完整的 Python 代码实现，代码量仅 279 行，帮助读者理解 Agent 的本质：Agent Loop 这个 While 循环中管理上下文。"
---

## 文章核心要点

### Agent 框架三大部分

**1. LLM Call**
- 使用标准化 OpenAI SDK
- 支持 DeepSeek 等兼容厂商

**2. Tools Call**
四个核心工具函数：
- `shell_exec`：执行 shell 命令
- `file_read`：读取文件内容
- `file_write`：写入文件（自动创建目录）
- `python_exec`：在子进程中执行 Python 代码

**3. Context Engineering**
- System Prompt：定义 Agent 角色和可用工具
- Session 管理：使用 messages 列表累积上下文

### Agent Loop 核心逻辑

```python
while turn < MAX_TURNS:
    # 1. LLM Call
    response = client.chat.completions.create(...)
    # 2. 解析 tool_calls
    # 3. 执行工具
    # 4. 结果追加到 messages
    # 5. 继续循环或退出
```

### 工程设计要点
- **安全设置**：MAX_TURNS 防止无限循环
- **错误处理**：工具执行异常捕获
- **上下文管理**：历史消息累积与裁剪

### 为什么需要极简？
- 简单清晰，帮助理解 Agent 本质
- 代码库越简单，上下文越清晰，Agent 越智能
