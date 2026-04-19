# Tarvis Blog

> 一个极简、快速的技术博客，基于 Astro + Tailwind CSS 构建。

## 特性

- **静态生成** — Astro SSG，零 JS 运行时开销，首屏秒开
- **暗色模式** — 系统偏好自动检测 + 手动切换，无闪烁（FOUC-free）
- **代码高亮** — Prism 语法高亮，亮/暗双主题
- **响应式** — 移动端优先，汉堡菜单自适应
- **GitHub Issues CMS** — 通过 GitHub Issues 创建文章，CI 自动同步
- **精选集** — 收录外部优质技术文章

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Astro 5 |
| 样式 | Tailwind CSS 3 + @tailwindcss/typography |
| 高亮 | Prism（Astro 内置） |
| 部署 | Vercel |
| CMS | GitHub Issues → CI 同步 |

## 项目结构

```
blog/
├── public/              # 静态资源
│   └── favicon.svg
├── scripts/
│   └── sync-issues.mjs  # GitHub Issues 同步脚本
├── src/
│   ├── components/      # UI 组件
│   │   ├── Navbar.astro
│   │   ├── PostCard.astro
│   │   ├── ProjectCard.astro
│   │   └── PickCard.astro
│   ├── content/         # 内容集合
│   │   ├── config.ts    # 集合定义（glob loader）
│   │   ├── posts/       # 博客文章（Markdown）
│   │   └── picks/       # 精选文章
│   ├── data/
│   │   └── projects.json
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/           # 路由页面
│   ├── styles/
│   │   └── global.css
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 快速开始

### 本地开发

```bash
npm install
npm run dev
```

### 构建生产版本

```bash
npm run build
npm run preview
```

### Vercel 部署

直接导入仓库，Vercel 自动识别 `vercel.json` 配置。

## 通过 GitHub Issues 写文章

1. 在仓库中创建 Issue，选择「📝 博客文章」模板
2. 填写标题、日期、标签、摘要和正文
3. 提交后 CI 自动将 Issue 同步为 `src/content/posts/` 下的 Markdown 文件
4. 重新构建后文章自动上线

## 自定义

- **导航链接** — 编辑 `src/components/Navbar.astro` 中的 `navLinks` 数组
- **项目展示** — 编辑 `src/data/projects.json`
- **主题色** — 修改 `tailwind.config.mjs` 中的 `theme.extend`
- **代码高亮** — 修改 `src/styles/global.css` 中的 Prism token 颜色

## License

MIT
