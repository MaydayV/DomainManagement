# 数据存储详解 | Data Storage Guide

## 📦 存储方式概述

域名管理工具目前使用 **JSON 文件存储** 方式，数据保存在本地文件系统中。

## 🗂️ 存储位置

### 文件路径
```
DomainManagement/
└── data/
    └── domains.json  ← 所有域名数据都存在这里
```

### 完整路径
```
/Users/colin/Documents/GitHub/DomainManagement/data/domains.json
```

## 📄 数据结构

### JSON 文件格式

```json
[
  {
    "id": "domain-1760341716623-boo07fg36",
    "name": "ok.com",
    "registrar": "aliyun",
    "expiryDate": "2025-10-30T00:00:00.000Z",
    "registrationDate": "2016-03-08T00:00:00.000Z",
    "price": 80,
    "currency": "CNY",
    "filingStatus": "",
    "renewalUrl": "",
    "notes": "",
    "createdAt": "2025-10-13T07:48:36.623Z",
    "updatedAt": "2025-10-13T07:52:11.342Z"
  },
  {
    "id": "domain-1760342000000-abc123def",
    "name": "example.com",
    "registrar": "cloudflare",
    "expiryDate": "2026-05-15T00:00:00.000Z",
    "registrationDate": "2020-05-15T00:00:00.000Z",
    "price": 12.5,
    "currency": "USD",
    "filingStatus": "filed",
    "renewalUrl": "https://dash.cloudflare.com/...",
    "notes": "公司主域名",
    "createdAt": "2025-10-13T08:00:00.000Z",
    "updatedAt": "2025-10-13T08:00:00.000Z"
  }
]
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | string | ✅ | 唯一标识符，自动生成 | `domain-1760341716623-boo07fg36` |
| `name` | string | ✅ | 域名 | `example.com` |
| `registrar` | string | ✅ | 注册商 ID | `aliyun`, `cloudflare` |
| `expiryDate` | string | ✅ | 到期时间（ISO 8601） | `2025-10-30T00:00:00.000Z` |
| `registrationDate` | string | ❌ | 注册时间（ISO 8601） | `2020-01-15T00:00:00.000Z` |
| `price` | number | ❌ | 价格 | `80`, `12.5` |
| `currency` | string | ❌ | 币种代码 | `CNY`, `USD`, `EUR` |
| `filingStatus` | string | ❌ | 备案状态 | `filed`, `not-filed`, `filing`, `` |
| `renewalUrl` | string | ❌ | 自定义续费链接 | `https://...` |
| `notes` | string | ❌ | 备注 | `公司主域名` |
| `createdAt` | string | ✅ | 创建时间（自动） | `2025-10-13T08:00:00.000Z` |
| `updatedAt` | string | ✅ | 更新时间（自动） | `2025-10-13T08:00:00.000Z` |

## 🔄 数据操作流程

### 1. 读取数据（查看域名列表）

```
用户访问页面
    ↓
前端发起请求: GET /api/domains
    ↓
API 路由检查认证
    ↓
调用 lib/domains.ts → getDomains()
    ↓
读取 data/domains.json 文件
    ↓
解析 JSON → Domain[] 数组
    ↓
应用筛选和排序
    ↓
返回给前端
    ↓
渲染卡片列表
```

**代码实现** (`lib/domains.ts`):
```typescript
export async function getDomains(): Promise<Domain[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 文件不存在时返回空数组
    return [];
  }
}
```

### 2. 添加域名

```
用户填写表单
    ↓
前端发起请求: POST /api/domains
    ↓
API 路由验证数据
    ↓
调用 lib/domains.ts → addDomain()
    ↓
读取现有数据
    ↓
生成新域名对象（含 ID、时间戳）
    ↓
添加到数组
    ↓
写入 data/domains.json
    ↓
返回新域名
    ↓
前端刷新列表
```

**代码实现**:
```typescript
export async function addDomain(domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>): Promise<Domain> {
  const domains = await getDomains();
  const now = new Date().toISOString();
  
  const newDomain: Domain = {
    ...domain,
    id: `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  domains.push(newDomain);
  await saveDomains(domains);
  
  return newDomain;
}
```

### 3. 更新域名

```
用户点击编辑 → 修改信息 → 保存
    ↓
前端发起请求: PUT /api/domains/[id]
    ↓
调用 lib/domains.ts → updateDomain()
    ↓
读取所有域名
    ↓
找到对应 ID 的域名
    ↓
更新字段（保留 ID 和创建时间）
    ↓
更新 updatedAt 时间戳
    ↓
写回 data/domains.json
    ↓
返回更新后的域名
```

**代码实现**:
```typescript
export async function updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | null> {
  const domains = await getDomains();
  const index = domains.findIndex(d => d.id === id);
  
  if (index === -1) {
    return null;
  }
  
  domains[index] = {
    ...domains[index],
    ...updates,
    id: domains[index].id,         // 保持不变
    createdAt: domains[index].createdAt, // 保持不变
    updatedAt: new Date().toISOString(), // 更新时间
  };
  
  await saveDomains(domains);
  return domains[index];
}
```

### 4. 删除域名

```
用户点击删除 → 确认
    ↓
前端发起请求: DELETE /api/domains/[id]
    ↓
调用 lib/domains.ts → deleteDomain()
    ↓
读取所有域名
    ↓
过滤掉要删除的域名
    ↓
写回 data/domains.json
    ↓
返回成功
```

**代码实现**:
```typescript
export async function deleteDomain(id: string): Promise<boolean> {
  const domains = await getDomains();
  const filteredDomains = domains.filter(d => d.id !== id);
  
  if (filteredDomains.length === domains.length) {
    return false; // 未找到
  }
  
  await saveDomains(filteredDomains);
  return true;
}
```

## 💾 文件读写机制

### 读取流程
```typescript
// 1. 确保目录存在
await ensureDataDirectory();

// 2. 读取文件
const data = await fs.readFile(DATA_FILE, 'utf-8');

// 3. 解析 JSON
const domains = JSON.parse(data);

// 4. 返回数组
return domains;
```

### 写入流程
```typescript
// 1. 确保目录存在
await ensureDataDirectory();

// 2. 序列化数据（格式化输出）
const jsonData = JSON.stringify(domains, null, 2);

// 3. 写入文件
await fs.writeFile(DATA_FILE, jsonData, 'utf-8');
```

### 目录检查
```typescript
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir); // 检查目录是否存在
  } catch {
    await fs.mkdir(dataDir, { recursive: true }); // 不存在则创建
  }
}
```

## 🔒 数据安全

### 认证保护
所有 API 都需要认证：

```typescript
function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const session = getSessionFromHeader(authHeader);

  if (!validateSession(session)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null;
}
```

### 数据验证
添加域名时会验证：
- 域名格式是否正确
- 必填字段是否完整
- 日期是否有效
- 价格是否为数字

## ⚠️ 重要限制

### 1. 数据持久性问题

**本地开发环境**：
- ✅ 数据持久保存
- ✅ 重启服务器后数据仍在
- ✅ 可以直接编辑 `domains.json`

**Vercel 生产环境**：
- ❌ **每次部署会重置数据**
- ❌ 数据不会持久保存
- ❌ 重新部署后丢失所有域名

### 为什么会这样？

Vercel 是 **无服务器（Serverless）** 平台：
- 每次部署创建新的构建版本
- 文件系统是只读的（构建时）
- 运行时的文件修改不会保存
- 下次部署会用新的代码替换

### 解决方案

#### 方案 1: Vercel Blob Storage（推荐）

```bash
npm install @vercel/blob
```

修改 `lib/domains.ts`:
```typescript
import { put, list, del } from '@vercel/blob';

export async function saveDomains(domains: Domain[]) {
  const blob = await put('domains.json', JSON.stringify(domains), {
    access: 'public',
  });
  return blob;
}

export async function getDomains() {
  const response = await fetch('https://your-blob-url/domains.json');
  return response.json();
}
```

#### 方案 2: Vercel Postgres

```bash
npm install @vercel/postgres
```

#### 方案 3: MongoDB Atlas（免费）

```bash
npm install mongodb
```

#### 方案 4: Supabase（推荐）

```bash
npm install @supabase/supabase-js
```

## 📊 数据流程图

### 完整的数据流

```
┌─────────────┐
│   用户界面   │
└──────┬──────┘
       │ 操作（增删改查）
       ↓
┌─────────────────┐
│   React State   │ ← 前端状态管理
└──────┬──────────┘
       │ fetch API
       ↓
┌─────────────────┐
│   API Routes    │ ← /api/domains/*
│  (认证检查)      │
└──────┬──────────┘
       │ 调用函数
       ↓
┌─────────────────┐
│  lib/domains.ts │ ← 数据操作层
└──────┬──────────┘
       │ 文件读写
       ↓
┌─────────────────┐
│ domains.json    │ ← JSON 文件存储
│  (本地文件)     │
└─────────────────┘
```

## 🔍 实际例子

### 当前你的数据文件内容

```json
[
  {
    "name": "ok.com",
    "registrar": "aliyun",
    "expiryDate": "2025-10-30T00:00:00.000Z",
    "price": 80,
    "currency": "CNY",
    "filingStatus": "",
    "id": "domain-1760341716623-boo07fg36",
    "createdAt": "2025-10-13T07:48:36.623Z",
    "updatedAt": "2025-10-13T07:52:11.342Z"
  }
]
```

### 添加新域名后

```json
[
  {
    "name": "ok.com",
    "registrar": "aliyun",
    "expiryDate": "2025-10-30T00:00:00.000Z",
    "price": 80,
    "currency": "CNY",
    "filingStatus": "",
    "id": "domain-1760341716623-boo07fg36",
    "createdAt": "2025-10-13T07:48:36.623Z",
    "updatedAt": "2025-10-13T07:52:11.342Z"
  },
  {
    "name": "example.com",          ← 新添加的域名
    "registrar": "cloudflare",
    "expiryDate": "2026-05-15T00:00:00.000Z",
    "registrationDate": "2020-05-15T00:00:00.000Z",
    "price": 12.5,
    "currency": "USD",
    "filingStatus": "filed",
    "renewalUrl": "",
    "notes": "",
    "id": "domain-1760342000000-xyz789abc",  ← 自动生成的 ID
    "createdAt": "2025-10-13T09:00:00.000Z", ← 自动记录创建时间
    "updatedAt": "2025-10-13T09:00:00.000Z"  ← 自动记录更新时间
  }
]
```

## 🎯 核心代码解析

### 文件位置定义

```typescript
// lib/domains.ts
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'domains.json');
```

- `process.cwd()` = 项目根目录
- 完整路径 = `/Users/colin/Documents/GitHub/DomainManagement/data/domains.json`

### 保存函数

```typescript
export async function saveDomains(domains: Domain[]): Promise<void> {
  // 1. 确保 data 目录存在
  await ensureDataDirectory();
  
  // 2. 序列化为格式化的 JSON
  const jsonData = JSON.stringify(domains, null, 2);
  
  // 3. 写入文件
  await fs.writeFile(DATA_FILE, jsonData, 'utf-8');
}
```

**JSON.stringify 参数说明**:
- 第一个参数：要序列化的对象
- `null`：不使用替换函数
- `2`：缩进空格数（格式化输出）

### ID 生成机制

```typescript
id: `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

**组成部分**:
- `domain-` : 前缀
- `Date.now()` : 当前时间戳（毫秒）→ `1760341716623`
- `Math.random().toString(36).substr(2, 9)` : 随机字符串 → `boo07fg36`

**示例**: `domain-1760341716623-boo07fg36`

## 📂 本地如何查看数据

### 方法 1: 直接打开文件

```bash
# macOS/Linux
cat data/domains.json

# 或使用编辑器
code data/domains.json
```

### 方法 2: 通过 API 查看

```bash
# 需要先获取 token
curl http://localhost:3000/api/domains \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 方法 3: 在 Cursor 中查看

直接打开 `data/domains.json` 文件查看和编辑。

## 🛡️ 数据备份

### 手动备份

```bash
# 备份到当前目录
cp data/domains.json domains-backup-$(date +%Y%m%d).json

# 备份到其他位置
cp data/domains.json ~/Backups/domains-backup.json
```

### 定时备份脚本

创建 `scripts/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp data/domains.json "backups/domains-${DATE}.json"
echo "Backup created: domains-${DATE}.json"
```

运行：
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### 恢复备份

```bash
cp domains-backup-20251013.json data/domains.json
```

## 🚀 部署环境的数据

### 本地开发（npm run dev）

- ✅ 数据存储在本地 `data/domains.json`
- ✅ 永久保存，不会丢失
- ✅ 可以直接编辑文件

### Vercel 生产环境

- ❌ 数据存储在临时文件系统
- ❌ **每次部署会重置**
- ❌ 运行时修改不会保存

**举例说明**:
```
第一次部署 → 添加 10 个域名 → 数据在运行时保存
    ↓
第二次部署 → 🚨 所有数据丢失！
    ↓
需要重新添加域名
```

### 为什么 Vercel 不能持久化文件？

Vercel 使用 **Serverless Functions**:
- 每个请求在独立的容器中运行
- 容器随时可能被销毁和重建
- 文件系统是临时的
- 只有构建时的文件会保留

## 💡 生产环境推荐方案

### 立即可用的方案

#### 1. Vercel KV（键值存储）

```bash
npm install @vercel/kv
```

```typescript
import { kv } from '@vercel/kv';

// 保存
await kv.set('domains', JSON.stringify(domains));

// 读取
const data = await kv.get('domains');
const domains = JSON.parse(data);
```

#### 2. Vercel Blob Storage

```bash
npm install @vercel/blob
```

```typescript
import { put, get } from '@vercel/blob';

// 保存
await put('domains.json', JSON.stringify(domains), {
  access: 'public',
});

// 读取
const blob = await get('domains.json');
const domains = JSON.parse(await blob.text());
```

### 为什么当前用 JSON 文件？

1. **简单**: 不需要额外配置
2. **快速**: 开发和测试方便
3. **可视**: 可以直接查看和编辑
4. **零成本**: 本地开发无需任何费用

### 升级到持久化存储的时机

当你准备正式部署到 Vercel 时，建议：
1. 先在本地完善所有功能
2. 添加一些测试数据
3. 导出数据备份
4. 升级到 Vercel Blob 或 KV
5. 导入数据
6. 部署上线

## 📝 数据管理最佳实践

### 本地开发时

1. **定期备份**
   ```bash
   cp data/domains.json backups/domains-$(date +%Y%m%d).json
   ```

2. **版本控制**
   - `domains.json` 已在 `.gitignore` 中
   - 不会提交到 Git
   - 个人数据更安全

3. **测试数据**
   - 创建 `data/domains.example.json` 作为示例
   - 提交到 Git 供参考

### 部署到 Vercel 时

1. **在 Vercel 部署前**
   - 导出当前数据
   - 升级到持久化存储
   - 测试读写功能

2. **部署后**
   - 导入备份的数据
   - 验证所有功能正常
   - 设置定期备份

## 🔄 如何查看实时数据

### 在浏览器开发者工具

```javascript
// 打开控制台（F12）

// 查看所有域名
fetch('/api/domains', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(console.log)

// 查看原始 JSON
fetch('/api/domains', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

## 📈 数据统计

### 当前存储情况

```bash
# 查看文件大小
ls -lh data/domains.json

# 统计域名数量
cat data/domains.json | jq 'length'

# 查看所有域名
cat data/domains.json | jq '.[].name'
```

### 估算存储容量

- 单个域名约 **300-500 字节**
- 100 个域名约 **30-50 KB**
- 1000 个域名约 **300-500 KB**

JSON 文件存储适合 **小于 1000 个域名** 的场景。

## 🎉 总结

### 当前存储方式

| 特性 | 说明 |
|------|------|
| **存储位置** | `data/domains.json` |
| **数据格式** | JSON 数组 |
| **读写方式** | Node.js fs 模块 |
| **持久性** | 本地开发 ✅ / Vercel 部署 ❌ |
| **容量** | 无限制（本地磁盘） |
| **性能** | 优秀（小数据量） |
| **成本** | 免费 |

### 优缺点

**优点**:
- ✅ 简单易懂
- ✅ 无需配置
- ✅ 本地开发完美
- ✅ 可直接编辑
- ✅ 零成本

**缺点**:
- ❌ Vercel 上不持久
- ❌ 无法多实例共享
- ❌ 大数据量性能下降
- ❌ 无事务支持

### 建议

**本地开发/个人使用**: 当前方案完美 ✅

**生产部署/团队使用**: 升级到 Vercel Blob 或数据库 🚀

---

**当前你的数据是安全的**，只要在本地开发，所有域名信息都会永久保存在 `data/domains.json` 中！

