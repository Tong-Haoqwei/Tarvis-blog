import { writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const POSTS_DIR = './src/content/posts';
const BLOG_LABEL = 'blog';
const BLOG_TITLE_PREFIX = '[Blog]';

function isBlogIssue(issue) {
  const hasLabel = issue.labels.some(l => l.name.toLowerCase() === BLOG_LABEL);
  const hasPrefix = issue.title.startsWith(BLOG_TITLE_PREFIX);
  return hasLabel || hasPrefix;
}

function getRepoInfo() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    throw new Error('GITHUB_REPOSITORY environment variable is not set');
  }
  const [owner, repoName] = repo.split('/');
  return { owner, repo: repoName };
}

async function fetchIssues(owner, repo, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&sort=created&direction=desc&per_page=100`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'sync-issues-script'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch issues: ${response.status} ${response.statusText}`);
  }

  const allIssues = await response.json();
  return allIssues.filter(isBlogIssue);
}

function parseIssueBody(body) {
  if (!body) {
    return {};
  }

  const sections = {};
  const sectionRegex = /^### (.+?)\s*$/gm;
  const matches = [];

  let match;
  while ((match = sectionRegex.exec(body)) !== null) {
    matches.push({ title: match[1].trim(), start: match.index + match[0].length });
  }

  for (let i = 0; i < matches.length; i++) {
    const sectionTitle = matches[i].title;
    const contentStart = matches[i].start;
    const contentEnd = i + 1 < matches.length ? matches[i + 1].start - matches[i + 1].title.length - 4 : body.length;
    const content = body.slice(contentStart, contentEnd).trim();
    sections[sectionTitle] = content;
  }

  return sections;
}

function generateSlug(title, issueNumber) {
  let cleanTitle = title.replace(/^\[Blog\]\s*/i, '');
  const slug = cleanTitle
    .toLowerCase()
    .replace(/[\u4e00-\u9fff]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  if (!slug || slug === '-') {
    return `post-${issueNumber}`;
  }
  return `${slug}-${issueNumber}`;
}

function generateMarkdown(issue) {
  const sections = parseIssueBody(issue.body);
  
  const title = sections['文章标题'] || issue.title.replace(/^\[Blog\]\s*/i, '');
  const date = sections['发布日期'] || issue.created_at.split('T')[0];
  const tagsStr = sections['标签'] || '';
  const tags = tagsStr ? tagsStr.split(/[,，]/).map(t => t.trim()).filter(Boolean) : 
    issue.labels.filter(l => l.name.toLowerCase() !== BLOG_LABEL).map(l => l.name);
  const excerpt = sections['文章摘要'] || '';
  const issueNumber = issue.number;
  const content = sections['文章正文'] || '';

  const cleanContent = content
    .replace(/^```markdown\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '');

  const frontmatterStr = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
tags: [${tags.map(t => `"${t}"`).join(', ')}]
${excerpt ? `excerpt: "${excerpt.replace(/"/g, '\\"')}"` : ''}
issueNumber: ${issueNumber}
---`;

  return `${frontmatterStr}\n\n${cleanContent}`;
}

function ensurePostsDir() {
  if (!existsSync(POSTS_DIR)) {
    mkdirSync(POSTS_DIR, { recursive: true });
  }
}

function getExistingIssueNumbers() {
  if (!existsSync(POSTS_DIR)) {
    return new Set();
  }
  
  const files = readdirSync(POSTS_DIR);
  const issueNumbers = new Set();
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const match = file.match(/-(\d+)\.md$/);
      if (match) {
        issueNumbers.add(parseInt(match[1], 10));
      }
    }
  });
  
  return issueNumbers;
}

function syncIssues(issues) {
  ensurePostsDir();
  
  const existingIssueNumbers = getExistingIssueNumbers();
  const currentIssueNumbers = new Set(issues.map(i => i.number));
  
  for (const issue of issues) {
    const slug = generateSlug(issue.title, issue.number);
    const filename = `${slug}.md`;
    const filepath = join(POSTS_DIR, filename);
    const markdown = generateMarkdown(issue);
    
    writeFileSync(filepath, markdown, 'utf-8');
    console.log(`✓ Synced issue #${issue.number}: ${issue.title}`);
  }
  
  for (const issueNumber of existingIssueNumbers) {
    if (!currentIssueNumbers.has(issueNumber)) {
      const files = readdirSync(POSTS_DIR);
      const fileToDelete = files.find(f => f.endsWith(`-${issueNumber}.md`));
      if (fileToDelete) {
        unlinkSync(join(POSTS_DIR, fileToDelete));
        console.log(`✗ Removed closed issue #${issueNumber}`);
      }
    }
  }
}

async function main() {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is not set');
    }

    const { owner, repo } = getRepoInfo();
    console.log(`Fetching issues from ${owner}/${repo}...`);
    
    const issues = await fetchIssues(owner, repo, token);
    console.log(`Found ${issues.length} blog issues`);
    
    syncIssues(issues);
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Error syncing issues:', error.message);
    process.exit(1);
  }
}

main();
