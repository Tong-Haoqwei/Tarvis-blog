---
title: 深入理解 React Server Components
date: 2026-04-10
tags: [React, 前端, 架构]
excerpt: 从原理到实践，全面解析 React Server Components 的工作机制、适用场景以及与 SSR 的区别。
---

## 什么是 Server Components？

React Server Components (RSC) 是 React 18 引入的新特性，允许组件在服务器端渲染，并将结果流式传输到客户端。与传统 SSR 不同，RSC 的代码不会被打包到客户端 bundle 中。

## Server vs Client Components

```jsx
// ServerComponent.jsx - 默认为服务端组件
async function UserProfile({ userId }) {
  const user = await db.users.find(userId);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

```jsx
'use client';

// ClientComponent.jsx - 需要交互的组件
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

## 数据获取模式

Server Components 可以直接访问后端资源：

```tsx
// app/posts/page.tsx
async function PostsPage() {
  const posts = await fetchPosts(); // 直接在服务端获取
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}
```

## 与 SSR 的区别

| 特性 | SSR | Server Components |
|------|-----|-------------------|
| 渲染时机 | 请求时 | 请求时 + 流式 |
| JS Bundle | 包含所有组件代码 | 仅包含客户端组件 |
| 数据获取 | getServerSideProps | 组件内 async/await |
| 交互性 | 需要 hydration | 混合模式 |

## 最佳实践

### 1. 默认使用 Server Components

```tsx
// 推荐：服务端组件作为默认
async function ProductList() {
  const products = await getProducts();
  return <List items={products} />;
}
```

### 2. 需要交互时使用 'use client'

```tsx
'use client';

export function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    await addToCart(productId);
    setLoading(false);
  };
  
  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### 3. 组合模式

```tsx
// Server Component 包装 Client Component
async function ProductPage({ id }) {
  const product = await getProduct(id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={id} />
    </div>
  );
}
```

## 总结

Server Components 代表了 React 的未来方向，通过服务端渲染减少客户端 JavaScript 负担，同时保持组件化开发体验。理解何时使用 Server vs Client Components 是掌握 Next.js App Router 的关键。
