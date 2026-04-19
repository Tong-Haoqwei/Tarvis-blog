# GitHub Issues 博客 CMS 实现计划

## 概述

将 GitHub Issues 作为博客的 CMS（内容管理系统），通过 GitHub Actions 自动同步到 Astro 项目，并部署到 Vercel。

***

## 架构流程

```
GitHub Issue (创建/更新)
        ↓
GitHub Actions (定时触发或手动触发)
        ↓
Node.js 脚本 (调用 GitHub API)
        ↓
生成 Markdown 文件 (src/content/posts/)
        ↓
Git Push 到仓库
        ↓
Vercel 自动部署
```

***

## 实现步骤

### 第一步：创建 GitHub Actions 工作流

**文件**: `.github/workflows/sync-issues.yml`

* 定时触发：每天凌晨 2 点（可配置）

* 手动触发：支持 `workflow_dispatch`

* 权限配置：`GITHUB_TOKEN` 用于 API 调用和 Git Push

### 第二步：创建 Issues 同步脚本

**文件**: `scripts/sync-issues.mjs`

功能：

1. 调用 GitHub REST API 获取 Issues
2. 筛选带有特定标签的 Issue（如 `blog` 标签）
3. 解析 Issue 内容，提取 frontmatter 和正文
4. 生成符合 Astro Content Collections 格式的 Markdown 文件
5. 删除已关闭 Issue 对应的文件

**Issue 格式约定**:

```markdown
---
title: 文章标题
date: 2026-04-17
tags: [标签1, 标签2]
excerpt: 文章摘要
---

文章正文内容...
```

### 第三步：配置 Vercel 部署

**文件**: `vercel.json`（可选）

* 配置构建命令：`npm run build`

* 配置输出目录：`dist`

* 配置 Node.js 版本

### 第四步：更新 Content Collections 配置

**文件**: `src/content/config.ts`

* 添加 `slug` 字段（可选，用于自定义 URL）

* 添加 `issueNumber` 字段（关联 Issue 编号）

### 第五步：创建 Issue 模板

**文件**: `.github/ISSUE_TEMPLATE/blog-post.yml`

* 提供标准化的 Issue 创建表单

* 包含 title、date、tags、excerpt 字段

* 降低使用门槛

***

## 文件清单

| 文件路径                                   | 用途                            |
| -------------------------------------- | ----------------------------- |
| `.github/workflows/sync-issues.yml`    | GitHub Actions 工作流配置          |
| `scripts/sync-issues.mjs`              | Issues 同步脚本                   |
| `.github/ISSUE_TEMPLATE/blog-post.yml` | Issue 模板                      |
| `vercel.json`                          | Vercel 部署配置（可选）               |
| `src/content/config.ts`                | 更新 Content Collections schema |

***

## 技术细节

### GitHub API 调用

```javascript
// 获取仓库 Issues
GET /repos/{owner}/{repo}/issues
  ?state=open
  &labels=blog
  &sort=created
  &direction=desc
```

### Markdown 文件生成格式

```markdown
---
title: 从 Issue 标题获取
date: 从 Issue 创建时间或 frontmatter 解析
tags: 从 Issue 标签或 frontmatter 解析
excerpt: 从 frontmatter 解析或正文截取
issueNumber: Issue 编号（用于追踪）
---

Issue 正文内容
```

### Git 自动提交

```bash
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add src/content/posts/
git commit -m "docs: sync issues to posts [skip ci]"
git push
```

> `[skip ci]` 标记避免触发无限循环的 CI 构建

***

## 部署流程

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "feat: initial blog setup with GitHub Issues CMS"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 2. Vercel 配置

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. Vercel 自动识别 Astro 框架
5. 点击 "Deploy"

### 3. 使用流程

1. 在 GitHub 仓库创建 Issue
2. 添加 `blog` 标签
3. 等待 GitHub Actions 自动同步（或手动触发）
4. Vercel 自动部署更新

***

## 注意事项

1. **权限配置**: 确保 `GITHUB_TOKEN` 有 `repo` 和 `workflow` 权限
2. **避免循环触发**: 使用 `[skip ci]` 或配置 workflow 触发条件
3. **内容冲突**: 脚本会覆盖同名文件，建议使用 Issue 编号作为文件名前缀
4. **私密 Issue**: 如需私密文章，可使用 `draft` 标签并在脚本中过滤

***

## 执行顺序

1. 创建 `.github/workflows/` 目录
2. 创建 `scripts/` 目录
3. 编写 `sync-issues.mjs` 同步脚本
4. 编写 `sync-issues.yml` 工作流配置
5. 创建 Issue 模板
6. 更新 Content Collections 配置
7. 测试本地脚本运行
8. 推送到 GitHub 测试完整流程

