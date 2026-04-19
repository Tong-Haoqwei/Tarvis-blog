---
title: 从零搭建 Tarvis Blog：一个极简技术博客的诞生
date: 2026-04-18
tags: [Astro, 前端, 博客]
excerpt: 记录 Tarvis Blog 从技术选型、架构设计、代码审查到部署上线的全历程，分享一个极简技术博客的构建哲学。
---

## 为什么要自己搭博客？

在 Notion、掘金、知乎写文章很方便，但总感觉少了点什么——对内容的完全掌控。自己搭博客，意味着：

- **数据自主** — Markdown 文件就是数据，Git 就是版本控制
- **样式自由** — 每一个像素都可以自定义
- **技术成长** — 搭建过程本身就是一次全栈实践

## 技术选型

| 需求 | 选择 | 理由 |
|------|------|------|
| 框架 | Astro 5 | 静态生成，零 JS 运行时，首屏极快 |
| 样式 | Tailwind CSS 3 | 原子化 CSS，暗色模式开箱即用 |
| 代码高亮 | Prism | Astro 内置，无需额外依赖 |
| 部署 | Vercel | 零配置，自动 CI/CD，全球 CDN |
| CMS | GitHub Issues | 零成本，写 Issue 就是写文章 |

为什么不用 Next.js 或 Hugo？Astro 的「岛屿架构」让页面默认零 JS，只有交互组件才加载脚本。对于一个内容为主的博客，这是最优解。

## 架构设计

Tarvis Blog 的核心设计原则是 **极简且可靠**：

```
用户请求 → Vercel CDN → 静态 HTML（零 JS 运行时）
```

没有服务端渲染，没有数据库，没有 API 调用。纯静态文件，CDN 友好。

### 内容层

Astro 5 引入了 Content Layer API，使用 `glob` loader 从本地 Markdown 文件加载内容：

```typescript
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
  }),
});
```

Schema 验证确保每篇文章都有必要的元数据，构建时就能发现数据问题。

### 布局层

所有页面共享同一个 `BaseLayout`，包含导航栏和页脚。页面只需提供 `<main>` 内容：

```astro
<BaseLayout title="页面标题">
  <main>页面内容</main>
</BaseLayout>
```

这避免了 4 个页面重复 40 行导航和页脚代码。

### 暗色模式

暗色模式最大的坑是 **FOUC（闪烁）**。如果主题脚本延迟执行，用户会先看到亮色页面再闪到暗色。

解决方案：在 `<head>` 中用 `is:inline` 脚本阻塞式读取 `localStorage`，在任何内容渲染前就设置好 `dark` class：

```html
<script is:inline>
  (function() {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

## 代码审查：发现 15 个问题

在项目初版完成后，我做了一次全面的代码审查，发现了 15 个问题：

### 严重问题（4个）

1. **favicon.svg 缺失** — 每个页面 404 请求
2. **暗色模式闪烁** — 模块脚本延迟执行导致白屏闪烁
3. **@astrojs/tailwind 废弃** — Astro 5 中已标记 deprecated
4. **Content Collection 废弃 API** — `type: 'content'` 在 Astro 5 中为 legacy

### 中等问题（5个）

5. **Footer 样式不一致** — 4 个页面中 2 种不同的暗色边框
6. **PostCard 标签不可点击** — 在链接外部但有 hover 效果，误导用户
7. **导航高亮不生效** — 文章详情页无高亮指示
8. **prose 样式不生效** — 缺少 `@tailwindcss/typography` 插件
9. **占位链接** — projects.json 中 5 个项目指向 `github.com/example/*`

### 轻微问题（6个）

10. **手动 line-clamp-2** — Tailwind 3.3+ 已内置
11. **未使用的 CSS 变量** — 定义了但组件中全部用 Tailwind 类名
12. **冗余 `.dark body`** — CSS 变量继承已处理
13. **slug 中文处理** — 中文字符被移除后可能生成空 slug
14. **冗余 @astrojs/prism** — Astro 内置 Prism，不需要显式安装
15. **冗余 prismjs** — 同上

全部修复后，CSS 从 213 行精简到 62 行，依赖从 5 个减到 4 个。

## 部署

博客使用 Vercel 部署，零配置：

1. 将代码推送到 GitHub
2. 在 Vercel 导入仓库
3. Vercel 自动识别 Astro 项目，每次 push 自动构建部署
4. 全球 CDN 分发，访问速度极快

`vercel.json` 中配置了 cleanUrls，让 URL 更简洁（`/posts/xxx` 而非 `/posts/xxx.html`）。

## GitHub Issues 作为 CMS

写博客最痛苦的不是写文章，而是发布流程。Tarvis Blog 的方案：

1. 在 GitHub 创建 Issue，使用「📝 博客文章」模板
2. CI 自动将 Issue 同步为 Markdown 文件
3. 重新构建部署

这意味着你可以在手机上打开 GitHub，写一个 Issue，文章就自动上线了。

## 最终成果

| 指标 | 数值 |
|------|------|
| 页面数量 | 8 个静态页面 |
| 运行时 JS | 仅主题切换 + 移动端菜单（~2KB） |
| 依赖数量 | 4 个（astro, tailwind, @astrojs/tailwind, @tailwindcss/typography） |
| 构建时间 | ~3 秒 |

## 写在最后

搭建博客不是目的，持续输出才是。Tarvis Blog 的设计哲学是：**把基础设施做到足够简单，让你把时间花在写作上，而不是维护上**。

如果你也想搭一个自己的博客，欢迎 Fork [Tarvis Blog](https://github.com/Tong-Haoqwei/Tarvis-blog)，改改配置就能用。
