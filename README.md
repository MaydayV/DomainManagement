# 域名管理工具 | Domain Management

<div align="center">

![Domain Management](https://img.shields.io/badge/Domain-Management-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

优雅的域名管理工具，支持多注册商、到期提醒、多语言等功能

[English](#english) | [中文](#中文)

</div>

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

# 应用配置（可选）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 📦 部署到 Vercel

#### 方式一：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

#### 方式二：命令行部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

#### 配置环境变量

在 Vercel 项目设置中添加：

1. 进入项目 Settings → Environment Variables
2. 添加 `ACCESS_PASSWORD`，值为你的访问密码
3. 重新部署项目

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

### 🔧 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **国际化**: next-intl
- **图标**: Lucide React
- **动画**: Framer Motion
- **日期处理**: date-fns
- **部署**: Vercel

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
- 建议使用强密码

### 📊 数据管理

#### 数据存储

域名数据存储在 `data/domains.json` 文件中。

#### 数据备份

**重要**: Vercel 部署时，每次重新部署会重置数据文件。建议：

1. 定期导出数据（功能开发中）
2. 使用 Vercel Blob Storage（升级方案）
3. 手动下载 `data/domains.json` 文件备份

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

