# 🌍 域名管理工具 | Domain Management Tool

<div align="center">

![Domain Management](https://img.shields.io/badge/Domain-Management-6366F1?style=for-the-badge&logo=globe&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel KV](https://img.shields.io/badge/Vercel-KV-000?style=for-the-badge&logo=vercel&logoColor=white)

**优雅的域名管理工具，支持多注册商、到期提醒、云端存储**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/domain-management)

[🚀 快速部署](#快速部署) | [📖 English](#english) | [🎯 功能特性](#功能特性)

</div>

---

---

## 中文

### ✨ 功能特性

- 🌐 **多注册商支持**
  - 阿里云、腾讯云、华为云
  - 西部数码、火山引擎
  - Cloudflare、AWS、Spaceship、Porkbun
  - 支持自定义注册商

- ⏰ **到期管理**
  - 域名到期时间显示
  - 距离到期天数计算
  - 30天内到期高亮提醒
  - 已过期状态标记

- 💰 **价格管理**
  - 记录购买/续费价格
  - 支持多币种（CNY、USD、EUR 等）
  - 价格展示与币种符号

- 🔍 **搜索与筛选**
  - 域名模糊搜索
  - 按注册商筛选
  - 按备案状态筛选
  - 多维度排序（到期时间、域名名称、创建时间）

- 🏷️ **备案状态**
  - 已备案、未备案、备案中
  - 可选记录，不填不显示
  - 默认未备案状态

- 🔄 **快速续费**
  - 一键跳转注册商续费页面
  - 支持自定义续费链接

- 🌍 **多语言支持**
  - 中文（简体）
  - English

- 🎨 **优美 UI**
  - 响应式设计
  - 卡片式布局
  - 流畅动画效果
  - 暗色主题支持（规划中）

### 🚀 快速开始

#### 1. 克隆项目

```bash
git clone <repository-url>
cd DomainManagement
```

#### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

#### 3. 配置环境变量

创建 `.env.local` 文件：

```env
# 访问密码（必须设置）
ACCESS_PASSWORD=your_secure_password_here
```

**注意**：生产环境使用 Vercel KV 存储，无需本地数据库配置。

#### 4. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 🚀 快速部署

### 方式一：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/domain-management)

点击按钮后：
1. 导入 GitHub 仓库
2. 创建 Vercel KV 数据库
3. 设置访问密码
4. 一键部署完成！

### 方式二：手动部署

#### Step 1: 推送到 GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

#### Step 2: 在 Vercel 创建项目
1. 访问 [vercel.com](https://vercel.com)
2. 新建项目，选择你的仓库
3. 点击 Deploy

#### Step 3: 创建 KV 数据库 🔑
1. 项目部署后，进入 **Storage** 标签
2. 点击 **Create Database**
3. 选择 **Upstash** → **Redis**
4. 创建数据库并连接到项目

#### Step 4: 设置环境变量
在项目设置中添加：
- **Name**: `ACCESS_PASSWORD`
- **Value**: 你的安全密码
- **Environment**: Production, Preview, Development

#### Step 5: 重新部署
设置完成后重新部署项目。

### 方式三：Vercel CLI

```bash
# 安装 CLI
npm i -g vercel

# 登录并部署
vercel login
vercel

# 创建 KV 数据库（在 Dashboard 中）
# 设置密码并重新部署
vercel --prod
```

### 📁 项目结构

```
DomainManagement/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 多语言路由
│   │   ├── page.tsx       # 主页
│   │   ├── login/         # 登录页
│   │   └── layout.tsx     # 布局
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证接口
│   │   └── domains/       # 域名 CRUD
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── DomainCard.tsx    # 域名卡片
│   ├── DomainForm.tsx    # 域名表单
│   ├── DomainList.tsx    # 域名列表
│   ├── FilterBar.tsx     # 筛选栏
│   ├── SearchBar.tsx     # 搜索栏
│   └── Header.tsx        # 页头
├── lib/                  # 工具函数
│   ├── domains.ts        # 域名数据操作
│   ├── registrars.ts     # 注册商配置
│   ├── currencies.ts     # 币种配置
│   ├── auth.ts          # 认证逻辑
│   └── utils.ts         # 通用工具
├── types/               # TypeScript 类型定义
├── messages/            # 多语言文件
│   ├── zh.json         # 中文
│   └── en.json         # 英文
├── data/               # 数据存储
│   └── domains.json    # 域名数据
└── public/             # 静态资源
```

### 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 14 | React 全栈框架 (App Router) |
| **TypeScript** | 5.0 | 类型安全的 JavaScript |
| **Tailwind CSS** | 3.4 | 实用优先的 CSS 框架 |
| **Vercel KV** | Latest | 云端键值数据库 (Upstash) |
| **next-intl** | 3.19 | 国际化解决方案 |
| **Lucide React** | Latest | 精美的图标库 |
| **date-fns** | 3.6 | 现代化日期处理库 |

### 📝 使用说明

#### 添加域名

1. 点击右上角"添加域名"按钮
2. 填写域名信息：
   - 域名名称（必填）
   - 注册商（必填）
   - 到期时间（必填）
   - 价格和币种（可选）
   - 备案状态（可选）
   - 自定义续费链接（可选）
   - 备注（可选）
3. 点击保存

#### 编辑域名

1. 在域名卡片上点击"编辑"按钮
2. 修改相关信息
3. 点击保存

#### 删除域名

1. 在域名卡片上点击"删除"按钮
2. 确认删除操作

#### 续费域名

点击域名卡片上的"续费"按钮，将自动跳转到对应注册商的续费页面

### 🔐 安全说明

- 使用环境变量存储访问密码
- API 路由添加认证中间件
- 会话管理（24小时有效期）
- 建议使用强密码（16+ 字符）

### 💾 数据存储

#### 存储方式

- **本地开发**: JSON 文件存储 (`data/domains.json`)
- **生产环境**: Vercel KV (Upstash Redis)

#### 数据安全

- ✅ **云端存储**: 数据保存在 Upstash 云数据库
- ✅ **自动备份**: KV 数据库自动备份和容灾
- ✅ **永不丢失**: 重新部署不会丢失数据
- ✅ **高性能**: Redis 级别的读写速度

#### 数据迁移

项目自动检测环境并切换存储方式：
- 本地开发时使用文件存储
- 部署到 Vercel 时自动使用 KV 存储

### 🛣️ Roadmap

- [ ] 数据导入/导出功能
- [ ] 批量操作
- [ ] 邮件到期提醒
- [ ] 数据统计面板
- [ ] PWA 支持
- [ ] 暗黑模式
- [ ] Vercel Blob Storage 集成
- [ ] 移动端 App

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📄 许可证

MIT License

---

## English

### ✨ Features

- 🌐 **Multi-Registrar Support**
  - Alibaba Cloud, Tencent Cloud, Huawei Cloud
  - West.cn, Volcengine
  - Cloudflare, AWS, Spaceship, Porkbun
  - Custom registrar support

- ⏰ **Expiry Management**
  - Domain expiry date display
  - Days until expiry calculation
  - Highlight domains expiring within 30 days
  - Expired status indicator

- 💰 **Price Management**
  - Record purchase/renewal price
  - Multi-currency support (CNY, USD, EUR, etc.)
  - Price display with currency symbols

- 🔍 **Search & Filter**
  - Fuzzy domain search
  - Filter by registrar
  - Filter by filing status
  - Multi-dimensional sorting (expiry date, domain name, created date)

- 🏷️ **Filing Status**
  - Filed, Not Filed, Filing
  - Optional field, hidden if not set
  - Default: Not Filed

- 🔄 **Quick Renewal**
  - One-click jump to registrar renewal page
  - Custom renewal URL support

- 🌍 **Multi-language**
  - Chinese (Simplified)
  - English

- 🎨 **Beautiful UI**
  - Responsive design
  - Card-based layout
  - Smooth animations
  - Dark theme (planned)

### 🚀 Quick Start

#### 1. Clone the repository

```bash
git clone <repository-url>
cd DomainManagement
```

#### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3. Configure environment variables

Create `.env.local` file:

```env
# Access password (required)
ACCESS_PASSWORD=your_secure_password_here

# App config (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Run development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 📦 Deploy to Vercel

#### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

#### Option 2: CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

#### Configure Environment Variables

Add in Vercel project settings:

1. Go to Project Settings → Environment Variables
2. Add `ACCESS_PASSWORD` with your password
3. Redeploy the project

### 🔐 Security

- Access password stored in environment variables
- API routes with authentication middleware
- Session management (24-hour validity)
- Use strong passwords recommended

### 📊 Data Management

#### Data Storage

Domain data is stored in `data/domains.json`.

#### Data Backup

**Important**: Vercel deployments reset the data file. Recommendations:

1. Regular data export (feature in development)
2. Use Vercel Blob Storage (upgrade plan)
3. Manual download of `data/domains.json` for backup

### 🤝 Contributing

Issues and Pull Requests are welcome!

### 📄 License

MIT License

---

<div align="center">

Made with ❤️ using Next.js

</div>

