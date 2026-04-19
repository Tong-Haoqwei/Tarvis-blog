import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const PICKS_DIR = './src/content/picks';

function extractWechatArticle(html) {
  const titleMatch = html.match(/<h1[^>]*id="activity-name"[^>]*>([\s\S]*?)<\/h1>/);
  const authorMatch = html.match(/<span[^>]*class="rich_media_meta_nickname"[^>]*>([\s\S]*?)<\/span>/);
  const contentMatch = html.match(/<div[^>]*id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<script/);

  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
  const author = authorMatch ? authorMatch[1].replace(/<[^>]*>/g, '').trim() : '';
  const contentHtml = contentMatch ? contentMatch[1] : '';

  let summary = contentHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  if (summary.length >= 300) {
    const lastPunctuation = summary.lastIndexOf('。');
    if (lastPunctuation > 100) {
      summary = summary.slice(0, lastPunctuation + 1);
    } else {
      summary = summary.slice(0, 297) + '...';
    }
  }

  return { title, author, summary };
}

function extractGenericArticle(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

  let contentHtml = '';
  const contentSelectors = [
    /<article[^>]*>([\s\S]*?)<\/article>/,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    /<div[^>]*class="[^"]*post-body[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    /<main[^>]*>([\s\S]*?)<\/main>/,
  ];

  for (const pattern of contentSelectors) {
    const match = html.match(pattern);
    if (match) {
      contentHtml = match[1];
      break;
    }
  }

  if (!contentHtml) {
    contentHtml = html.replace(/<head[\s\S]*?<\/head>/i, '');
  }

  let summary = contentHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  if (summary.length >= 300) {
    const lastPunctuation = summary.lastIndexOf('。');
    if (lastPunctuation > 100) {
      summary = summary.slice(0, lastPunctuation + 1);
    } else {
      summary = summary.slice(0, 297) + '...';
    }
  }

  return { title, author: '', summary };
}

async function fetchArticle(url) {
  console.log(`正在获取文章: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`获取文章失败: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  const isWechat = url.includes('mp.weixin.qq.com');
  const { title, author, summary } = isWechat
    ? extractWechatArticle(html)
    : extractGenericArticle(html);

  if (!title) {
    throw new Error('无法提取文章标题，请检查链接是否正确');
  }

  return { title, author, summary };
}

function generateSlug(title) {
  const slug = title
    .replace(/[^\u4e00-\u9fff\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  if (!slug) return `pick-${Date.now()}`;
  return slug;
}

function generateMarkdown(title, date, source, author, tags, summary) {
  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
source: "${source}"
${author ? `author: "${author.replace(/"/g, '\\"')}"` : '# author: ""'}
tags: [${tags.map(t => `"${t}"`).join(', ')}]
summary: "${summary.replace(/"/g, '\\"')}"
---`;

  return frontmatter;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法: node scripts/fetch-pick.mjs <公众号文章链接> [标签1,标签2]');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/fetch-pick.mjs https://mp.weixin.qq.com/s/xxxxx');
    console.log('  node scripts/fetch-pick.mjs https://mp.weixin.qq.com/s/xxxxx "AI,LLM"');
    process.exit(1);
  }

  const url = args[0];
  const tags = args[1] ? args[1].split(',').map(t => t.trim()) : [];

  try {
    const { title, author, summary } = await fetchArticle(url);

    const date = new Date().toISOString().split('T')[0];
    const slug = generateSlug(title);

    const fullMarkdown = generateMarkdown(title, date, url, author, tags, summary);

    if (!existsSync(PICKS_DIR)) {
      mkdirSync(PICKS_DIR, { recursive: true });
    }

    const filepath = join(PICKS_DIR, `${slug}.md`);
    writeFileSync(filepath, fullMarkdown, 'utf-8');

    console.log(`\n✓ 文章已保存到: ${filepath}`);
    console.log(`  标题: ${title}`);
    console.log(`  作者: ${author || '未知'}`);
    console.log(`  标签: ${tags.join(', ') || '无'}`);
    console.log(`  概述: ${summary.slice(0, 50)}...`);
    console.log(`  日期: ${date}`);
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

main();
