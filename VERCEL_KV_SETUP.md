# 🚀 Vercel KV 设置指南（5分钟搞定）

## ✅ 已完成的准备工作

- ✅ 安装了 `@vercel/kv` 依赖
- ✅ 修改了代码支持 KV 存储
- ✅ 智能切换：本地用文件，Vercel 用 KV

## 📋 部署步骤

### Step 1: 推送代码到 GitHub（2分钟）

```bash
cd /Users/colin/Documents/GitHub/DomainManagement

# 初始化 Git（如果还没做）
git init
git add .
git commit -m "Add Vercel KV support"

# 推送到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/DomainManagement.git
git branch -M main
git push -u origin main
```

### Step 2: 在 Vercel 创建项目（1分钟）

1. 访问 [vercel.com](https://vercel.com)
2. 登录账号
3. 点击 **"New Project"**
4. 选择你的 GitHub 仓库
5. 点击 **"Deploy"**

等待部署完成...

### Step 3: 创建 KV 数据库（1分钟）

在 Vercel 项目页面：

1. 点击 **"Storage"** 标签
2. 点击 **"Create Database"**
3. 选择 **"KV"**
4. 填写信息：
   - Database Name: `domains-kv`
   - Region: 选择就近区域
5. 点击 **"Create"**

### Step 4: 连接 KV 到项目（30秒）

KV 创建后：

1. 点击 **"Connect to Project"**
2. 选择你的项目
3. 选择环境：
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
4. 点击 **"Connect"**

### Step 5: 设置访问密码（30秒）

在项目设置中：

1. 点击 **"Settings"** 标签
2. 点击 **"Environment Variables"**
3. 添加变量：
   - **Name**: `ACCESS_PASSWORD`
   - **Value**: 你的密码（如：`mySecurePassword123`）
   - **Environments**: Production, Preview, Development
4. 点击 **"Save"**

### Step 6: 重新部署（30秒）

1. 点击 **"Deployments"** 标签
2. 点击最新部署的 **"⋯"** 菜单
3. 选择 **"Redeploy"**
4. 确认重新部署

## 🎉 完成！

**访问你的网站**：
1. 部署完成后，点击 **"Visit"** 按钮
2. 输入密码登录
3. 添加域名测试

**数据现在永久保存了！** ✨

## 🔍 验证是否成功

### 方法 1: 查看日志

在 Vercel Deployments → Runtime Logs 中查看：

```
✅ 成功的日志：
Saved 3 domains to KV

❌ 失败的日志：
Failed to save to KV: ...
```

### 方法 2: 测试数据持久性

1. 添加几个测试域名
2. 在 Vercel 手动触发重新部署：
   - Deployments → 最新部署 → Redeploy
3. 部署完成后访问网站
4. 如果域名还在 → ✅ KV 成功！
5. 如果域名丢失 → ❌ 还在用文件存储

## 🛠️ 代码工作原理

### 智能切换机制

```typescript
// 自动检测环境
const IS_VERCEL = process.env.VERCEL === '1';

// 读取数据
if (IS_VERCEL && kv) {
  // Vercel 环境：从 KV 读取
  const data = await kv.get('domains');
  return data || [];
} else {
  // 本地环境：从文件读取
  const data = await fs.readFile('data/domains.json', 'utf-8');
  return JSON.parse(data);
}
```

### 优点

- ✅ **本地开发**：继续用文件，无需配置 KV
- ✅ **Vercel 部署**：自动用 KV，数据永久保存
- ✅ **向下兼容**：KV 失败时降级到文件存储
- ✅ **零配置**：代码自动适应环境

## 📊 KV 存储详情

### 免费额度
- **存储空间**: 30MB
- **读取**: 100,000 次/月
- **写入**: 50,000 次/月
- **足够存储**: 约 10,000+ 个域名

### 数据格式

```
Key: "domains"
Value: [
  {
    "id": "domain-xxx",
    "name": "ok.com",
    ...
  },
  {
    "id": "domain-yyy", 
    "name": "example.com",
    ...
  }
]
```

## 🔧 如果遇到问题

### 问题 1: KV 连接失败

**解决**：
1. 确认 KV 数据库已创建
2. 确认已连接到项目
3. 检查环境变量：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 问题 2: 域名数据丢失

**原因**：可能 KV 没有正确设置

**解决**：
1. 查看 Vercel Logs
2. 重新连接 KV 到项目
3. 重新部署

### 问题 3: 本地开发出错

**原因**：本地没有 KV 环境

**解决**：代码已处理，会自动用文件存储

## 📈 数据迁移

### 如果你已有域名数据

#### 方法 1: 通过界面（推荐）

1. 在本地运行 `npm run dev`
2. 复制所有域名信息
3. 部署后重新添加

#### 方法 2: 直接迁移到 KV

部署后，在 Vercel Functions 中运行一次性脚本：

```typescript
// 创建 app/api/migrate/route.ts
import { kv } from '@vercel/kv';

export async function POST() {
  const initialData = [
    {
      "id": "domain-1760341716623-boo07fg36",
      "name": "ok.com",
      "registrar": "aliyun",
      "expiryDate": "2025-10-30T00:00:00.000Z",
      "price": 80,
      "currency": "CNY",
      // ... 你的其他域名
    }
  ];
  
  await kv.set('domains', initialData);
  return Response.json({ success: true });
}
```

访问 `your-app.vercel.app/api/migrate` 完成迁移。

## 🎯 简单总结

### 你需要做的：

1. **推送代码到 GitHub** （Git 操作）
2. **在 Vercel 创建项目** （点击几下）
3. **创建 KV 数据库** （点击几下）
4. **连接 KV** （点击几下）
5. **设置密码** （添加环境变量）
6. **重新部署** （点击一下）

### 做完后的效果：

- ✅ 本地开发：数据在 `domains.json`
- ✅ Vercel 部署：数据在 KV 数据库
- ✅ 永不丢失：重新部署无数次都不会丢失数据
- ✅ 高性能：Redis 级别的读写速度

### 费用：

- ✅ **完全免费**（在免费额度内）
- ✅ 免费额度对个人使用绰绰有余

**准备好了吗？按照上面的步骤操作，5分钟搞定！** 🚀
