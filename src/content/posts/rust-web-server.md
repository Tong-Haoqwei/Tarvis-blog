---
title: 用 Rust 构建高性能 Web 服务器
date: 2026-04-15
tags: [Rust, Web, 后端]
excerpt: 探索如何使用 Rust 和 Tokio 构建一个高并发、低延迟的 Web 服务器，涵盖异步编程模型与性能优化技巧。
---

## 为什么选择 Rust？

Rust 以其零成本抽象和内存安全著称，非常适合构建高性能网络服务。结合 Tokio 异步运行时，我们可以轻松处理数万并发连接。

## 快速开始

首先，创建一个新的 Rust 项目并添加依赖：

```toml
# Cargo.toml
[dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.7"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

## 实现一个简单的 HTTP 服务器

下面是一个使用 Axum 框架的示例：

```rust
use axum::{
    routing::{get, post},
    http::StatusCode,
    Json, Router,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct CreateUser {
    username: String,
}

#[derive(Serialize)]
struct User {
    id: u64,
    username: String,
}

async fn health_check() -> &'static str {
    "OK"
}

async fn create_user(
    Json(payload): Json<CreateUser>,
) -> (StatusCode, Json<User>) {
    let user = User {
        id: 1337,
        username: payload.username,
    };
    (StatusCode::CREATED, Json(user))
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/users", post(create_user));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("Server running on http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
```

## 异步编程模型

Tokio 使用基于 `Future` 的异步模型。理解 `async/await` 语法至关重要：

```rust
async fn fetch_data(id: u64) -> Result<Data, Error> {
    let response = http_client::get(&format!("/api/data/{}", id)).await?;
    let data: Data = response.json().await?;
    Ok(data)
}
```

## 性能优化技巧

1. **使用连接池**：复用 TCP 连接减少握手开销
2. **零拷贝解析**：使用 `bytes::Bytes` 避免数据复制
3. **合理配置线程数**：通常等于 CPU 核心数

```rust
use std::thread;

fn optimal_threads() -> usize {
    thread::available_parallelism()
        .map(|p| p.get())
        .unwrap_or(4)
}
```

## 总结

Rust + Tokio 组合为构建高性能 Web 服务提供了坚实基础。通过零成本抽象和编译期安全检查，我们可以在保证性能的同时减少运行时错误。
