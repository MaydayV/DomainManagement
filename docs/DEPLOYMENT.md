# 部署指南 | Deployment Guide

## 部署到 Vercel

### 方法 1: 通过 GitHub（推荐）

#### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/MaydayV/DomainManagement.git
git push -u origin main
```

#### 2. 导入到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. 配置环境变量

在 Vercel 项目设置中：

1. 进入 **Settings** → **Environment Variables**
2. 添加以下变量：

```
ACCESS_PASSWORD=your_secure_password_here
```

3. 点击 **Save**

#### 4. 重新部署

环境变量添加后，需要重新部署：

1. 进入 **Deployments**
2. 点击最新部署的 **⋯** 菜单
3. 选择 **Redeploy**

### 方法 2: 使用 Vercel CLI

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录

```bash
vercel login
```

#### 3. 部署

```bash
# 预览部署
vercel

# 生产环境部署
vercel --prod
```

#### 4. 设置环境变量

```bash
vercel env add ACCESS_PASSWORD
```

输入你的密码后，选择环境（Production、Preview、Development）。

### 方法 3: 一键部署

点击下方按钮一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MaydayV/DomainManagement&env=ACCESS_PASSWORD&envDescription=访问密码&envLink=https://github.com/MaydayV/DomainManagement)

## 环境变量说明

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ACCESS_PASSWORD` | 访问密码，用于登录系统 | `your_secure_password` |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_APP_URL` | 应用的公开 URL | Vercel 自动设置 |

## 域名配置

### 1. 添加自定义域名

在 Vercel 项目设置中：

1. 进入 **Settings** → **Domains**
2. 输入你的域名，例如 `domain.example.com`
3. 点击 **Add**

### 2. 配置 DNS

根据 Vercel 的提示配置 DNS 记录：

**A 记录方式:**
```
Type: A
Name: @ 或 domain
Value: 76.76.21.21
```

**CNAME 记录方式:**
```
Type: CNAME
Name: domain
Value: cname.vercel-dns.com
```

### 3. 等待生效

DNS 配置通常需要几分钟到几小时生效。

## 数据备份

### 重要提示

⚠️ **Vercel 每次重新部署会重置 `data/domains.json` 文件！**

### 备份方案

#### 方案 1: 手动备份（临时方案）

1. 通过 Vercel CLI 下载数据：

```bash
vercel env pull .env.local
```

2. 或通过 API 导出（需要实现导出功能）

#### 方案 2: 升级到 Vercel Blob Storage（推荐）

修改 `lib/domains.ts` 使用 Vercel Blob：

```bash
npm install @vercel/blob
```

详见: [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)

#### 方案 3: 使用外部数据库

- Vercel Postgres
- MongoDB Atlas
- Supabase
- PlanetScale

## 性能优化

### 1. 图片优化

使用 Next.js Image 组件：

```tsx
import Image from 'next/image';

<Image src="/logo.png" width={100} height={100} alt="Logo" />
```

### 2. 路由缓存

在 `next.config.js` 中配置：

```js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
};
```

### 3. CDN 配置

Vercel 自动使用全球 CDN，无需额外配置。

## 监控与日志

### 1. Vercel Analytics

在 Vercel 项目中启用：

1. 进入 **Analytics** 标签
2. 点击 **Enable**

### 2. 错误监控

查看运行时日志：

1. 进入 **Deployments**
2. 点击部署
3. 查看 **Runtime Logs**

### 3. 性能监控

使用 Vercel Speed Insights：

```bash
npm install @vercel/speed-insights
```

## 安全建议

### 1. 强密码

使用强密码作为 `ACCESS_PASSWORD`：

- 至少 16 个字符
- 包含大小写字母、数字、特殊字符
- 避免使用常见词汇

### 2. HTTPS

Vercel 自动启用 HTTPS，确保：

- 不要禁用 HTTPS
- 使用 HSTS 头部

### 3. 环境变量

- 不要在代码中硬编码密码
- 不要将 `.env.local` 提交到 Git
- 定期更换密码

## 故障排查

### 问题 1: 部署失败

**解决方案:**

1. 检查 build 日志
2. 确保 `package.json` 中的依赖正确
3. 本地运行 `npm run build` 测试

### 问题 2: 环境变量未生效

**解决方案:**

1. 确认环境变量已保存
2. 重新部署项目
3. 检查变量名是否正确

### 问题 3: 登录失败

**解决方案:**

1. 确认 `ACCESS_PASSWORD` 已设置
2. 清除浏览器缓存
3. 检查密码是否正确

### 问题 4: 数据丢失

**解决方案:**

1. 恢复备份的 `domains.json`
2. 考虑升级到持久化存储方案

## 更新应用

### 1. 通过 Git 更新

```bash
git pull origin main
git add .
git commit -m "Update"
git push
```

Vercel 会自动重新部署。

### 2. 通过 Vercel CLI 更新

```bash
vercel --prod
```

### 3. 回滚版本

在 Vercel Dashboard：

1. 进入 **Deployments**
2. 找到要回滚的版本
3. 点击 **Promote to Production**

## 成本说明

### Vercel 免费计划

- ✅ 100GB 带宽/月
- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ Serverless Functions

### 付费计划

如需更多资源，可升级到 Pro 或 Enterprise 计划。

详见: [Vercel Pricing](https://vercel.com/pricing)

## 技术支持

- **Vercel 文档**: https://vercel.com/docs
- **Next.js 文档**: https://nextjs.org/docs
- **GitHub Issues**: <your-repo-issues-url>

---

**部署完成后，别忘了设置访问密码和备份数据！**

