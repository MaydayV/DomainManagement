# 域名管理工具 - 开发计划

## 📋 项目概述

一个优雅的域名管理工具，用于管理多个注册商的域名，支持到期提醒、价格记录和快速续费。

## 🛠 技术栈

### 前端框架
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**

### 样式方案
- **Tailwind CSS** - 现代化的样式方案
- **Headless UI** - 无障碍的 UI 组件
- **Lucide React** - 精美的图标库
- **Framer Motion** - 流畅的动画效果

### 国际化
- **next-intl** - Next.js 国际化解决方案
- 支持语言：中文、英文

### 数据存储
- **本地 JSON 文件** - 存储在 `/data/domains.json`
- **Vercel Blob Storage**（可选升级方案）
- 通过环境变量设置访问密码

### 认证方案
- **简单密码认证** - 基于环境变量 `ACCESS_PASSWORD`
- **Session Storage** - 客户端会话管理

### 部署平台
- **Vercel** - 一键部署，自动化 CI/CD

## 🎨 界面设计

### 布局结构
```
┌─────────────────────────────────────────┐
│           Header (Logo + 语言切换)        │
├─────────────────────────────────────────┤
│  搜索框 + 筛选器 + 排序选项 + 添加按钮      │
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 卡片1 │  │ 卡片2 │  │ 卡片3 │          │
│  └──────┘  └──────┘  └──────┘           │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 卡片4 │  │ 卡片5 │  │ 卡片6 │          │
│  └──────┘  └──────┘  └──────┘           │
└─────────────────────────────────────────┘
```

### 域名卡片设计
```
┌────────────────────────────────────┐
│ 📍 注册商图标  example.com         │
│                                    │
│ 📅 到期时间: 2025-12-31            │
│ ⏰ 剩余天数: 79天                   │
│ 🏷️ 价格: ¥99.00 CNY               │
│ ✅ 备案状态: 已备案                 │
│                                    │
│ [🔄 续费]  [✏️ 编辑]  [🗑️ 删除]    │
└────────────────────────────────────┘
```

### 颜色方案
- **主色调**: Indigo (蓝紫色)
- **成功**: Green (绿色)
- **警告**: Yellow (黄色，30天内到期)
- **危险**: Red (红色，已过期或即将过期)
- **背景**: Slate (灰色调)

## 📦 功能模块

### 1. 认证模块
- [ ] 登录页面（密码验证）
- [ ] 会话管理
- [ ] 自动登出

### 2. 域名列表模块
- [ ] 卡片式展示
- [ ] 响应式布局（移动端适配）
- [ ] 加载状态
- [ ] 空状态展示

### 3. 搜索与筛选
- [ ] 模糊搜索（域名、注册商）
- [ ] 按注册商筛选
- [ ] 按备案状态筛选
- [ ] 多维度排序
  - 到期时间（升序/降序）
  - 添加时间
  - 域名名称

### 4. 域名管理
- [ ] 添加域名
- [ ] 编辑域名信息
- [ ] 删除域名
- [ ] 批量操作（可选）

### 5. 注册商管理
- [ ] 预设注册商列表
  - 阿里云
  - 腾讯云
  - 华为云
  - 西部数码
  - 火山引擎
  - Cloudflare
  - AWS Route 53
  - Spaceship
  - Porkbun
- [ ] 自定义注册商
- [ ] 注册商图标/Logo

### 6. 续费功能
- [ ] 续费按钮跳转
- [ ] 注册商续费链接配置

### 7. 到期提醒
- [ ] 30天内到期高亮显示
- [ ] 已过期标记
- [ ] 距离到期天数计算

### 8. 多语言支持
- [ ] 中文（简体）
- [ ] English
- [ ] 语言切换器

### 9. 数据管理
- [ ] JSON 数据存储
- [ ] 数据导入/导出
- [ ] 数据备份

## 🗂 数据结构

### Domain 模型
```typescript
interface Domain {
  id: string;
  name: string; // 域名
  registrar: string; // 注册商
  expiryDate: string; // 到期时间 (ISO 8601)
  price: number; // 价格
  currency: string; // 币种 (CNY, USD, EUR)
  filingStatus: 'filed' | 'not-filed' | 'filing' | ''; // 备案状态
  renewalUrl?: string; // 续费链接
  notes?: string; // 备注
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}
```

### Registrar 配置
```typescript
interface Registrar {
  id: string;
  name: string;
  displayName: { zh: string; en: string };
  logo?: string;
  renewalUrlTemplate?: string;
  website: string;
}
```

## 📁 项目结构

```
DomainManagement/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── domains/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── auth/
│   │           └── route.ts
│   └── globals.css
├── components/
│   ├── DomainCard.tsx
│   ├── DomainList.tsx
│   ├── DomainForm.tsx
│   ├── SearchBar.tsx
│   ├── FilterBar.tsx
│   ├── LanguageSwitcher.tsx
│   ├── Header.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Modal.tsx
├── lib/
│   ├── domains.ts
│   ├── registrars.ts
│   ├── auth.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── data/
│   └── domains.json
├── messages/
│   ├── zh.json
│   └── en.json
├── public/
│   └── logos/
│       └── registrars/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 📅 开发计划

### Phase 1: 项目初始化（Day 1）
- [x] 创建 Next.js 项目
- [x] 配置 TypeScript
- [x] 安装依赖包
- [x] 配置 Tailwind CSS
- [x] 设置项目结构

### Phase 2: 基础功能（Day 2-3）
- [ ] 创建数据模型和类型定义
- [ ] 实现数据存储逻辑
- [ ] 开发 API 路由
- [ ] 实现认证功能

### Phase 3: 核心 UI（Day 4-5）
- [ ] 开发域名卡片组件
- [ ] 实现域名列表展示
- [ ] 创建添加/编辑表单
- [ ] 搜索和筛选功能

### Phase 4: 高级功能（Day 6-7）
- [ ] 多语言支持
- [ ] 排序功能
- [ ] 到期提醒逻辑
- [ ] 续费跳转功能

### Phase 5: 优化与部署（Day 8-9）
- [ ] UI/UX 优化
- [ ] 响应式适配
- [ ] 性能优化
- [ ] Vercel 部署配置
- [ ] 测试与调试

### Phase 6: 文档与完善（Day 10）
- [ ] 编写使用文档
- [ ] 环境变量配置说明
- [ ] 部署指南
- [ ] README 完善

## 🚀 部署配置

### 环境变量
```env
# 访问密码
ACCESS_PASSWORD=your_secure_password

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Vercel 部署步骤
1. 连接 GitHub 仓库
2. 配置环境变量 `ACCESS_PASSWORD`
3. 部署设置：
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. 一键部署

## 🔐 安全考虑

- 密码使用环境变量存储
- API 路由添加认证中间件
- 输入验证和 XSS 防护
- HTTPS 强制使用

## 📝 注意事项

1. 数据存储在本地 JSON 文件，重新部署时需要备份
2. 可以升级到 Vercel Blob Storage 实现持久化
3. 建议定期导出数据备份
4. 密码修改需要重新部署

## 🎯 后续优化方向

- [ ] 支持更多注册商
- [ ] 邮件到期提醒
- [ ] 数据统计面板
- [ ] 批量导入功能
- [ ] PWA 支持
- [ ] 暗黑模式
- [ ] 移动端 App

---

**开发开始日期**: 2025-10-13
**预计完成日期**: 2025-10-23

