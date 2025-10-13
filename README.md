# 🌍 域名管理工具 | Domain Management Tool

<div align="center">

![Domain Management](https://img.shields.io/badge/Domain-Management-6366F1?style=for-the-badge&logo=globe&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel KV](https://img.shields.io/badge/Vercel-KV-000?style=for-the-badge&logo=vercel&logoColor=white)

**优雅的域名管理工具，支持多注册商、到期提醒、云端存储**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MaydayV/DomainManagement)

**🌐 语言版本 | Language Versions**

**[🇨🇳 中文文档](#chinese)** | **[🇺🇸 English Documentation](#english)** | **[📚 文档中心](./docs/)**

</div>

---

# Chinese

## 🎯 主要特性

- 🌐 **多注册商支持** - 阿里云、腾讯云、华为云、Cloudflare、AWS、GoDaddy 等 10 个预设
- ⏰ **智能到期提醒** - 30天内高亮，过期灰化，一目了然  
- 💾 **云端安全存储** - Vercel KV 数据库，永不丢失
- 🔍 **强大搜索筛选** - 模糊搜索、多维度筛选排序
- 💰 **价格统计管理** - 支持多币种，自动汇率换算
- 🏷️ **备案状态管理** - 可视化状态标签
- 🌍 **多语言支持** - 中文/English，自动检测浏览器语言
- 📱 **PWA 支持** - 可安装到桌面，原生应用体验
- 🎨 **响应式设计** - 完美适配移动端和桌面端

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/MaydayV/DomainManagement.git
cd DomainManagement

# 安装依赖
npm install

# 设置密码
echo "ACCESS_PASSWORD=your_password" > .env.local

# 启动应用
npm run dev
```

访问 http://localhost:3000，使用设置的密码登录。

### 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MaydayV/DomainManagement)

部署后：
1. 创建 **Upstash KV 数据库** 
2. 设置 **ACCESS_PASSWORD** 环境变量
3. 重新部署

**详细步骤**: [📚 部署指南](./docs/DEPLOYMENT.md)

## 📖 基本使用

### 添加域名
1. 点击"添加域名"按钮
2. 输入域名 → 点击 WHOIS 查询 → 自动填充信息
3. 设置价格和备案状态（可选）
4. 保存

### 管理域名  
- **访问网站**: 点击域名名称
- **快速续费**: 点击 🔄 图标
- **编辑删除**: 点击 ⚙️ 设置菜单

### 数据统计
顶部统计面板实时显示：
- 📊 域名总数 | ⚠️ 即将到期 | ❌ 已过期 | 💰 累计支出

## 🛠 技术栈

- **Next.js 14** - React 全栈框架
- **TypeScript** - 类型安全开发  
- **Tailwind CSS** - 现代化样式
- **Vercel KV** - 云端数据存储 (Upstash Redis)
- **PWA** - 可安装到桌面

## 📚 详细文档

- 📖 [快速开始指南](./docs/QUICKSTART.md) - 完整安装和使用教程
- 🚀 [部署指南](./docs/DEPLOYMENT.md) - Vercel + KV 完整部署流程
- 📋 [功能清单](./docs/FEATURES.md) - 所有功能详情和未来规划  
- 💻 [开发命令](./docs/COMMANDS.md) - 维护、自定义和故障排除
- 📚 [文档中心](./docs/) - 完整文档导航

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

# English

## 🎯 Key Features

- 🌐 **Multi-Registrar Support** - 9 preset registrars including Alibaba Cloud, Cloudflare, AWS
- ⏰ **Smart Expiry Alerts** - 30-day warnings, visual expired status
- 💾 **Cloud Storage** - Vercel KV database, never lose data
- 🔍 **Powerful Search** - Fuzzy search, multi-dimensional filtering
- 💰 **Price Management** - Multi-currency support, automatic conversion
- 🏷️ **Filing Status** - Visual status badges
- 🌍 **Internationalization** - Chinese/English, auto browser detection
- 📱 **PWA Support** - Installable desktop app experience
- 🎨 **Responsive Design** - Perfect for mobile and desktop

## 🚀 Quick Start

### Local Development

```bash
# Clone project
git clone https://github.com/MaydayV/DomainManagement.git
cd DomainManagement

# Install dependencies
npm install

# Set password
echo "ACCESS_PASSWORD=your_password" > .env.local

# Start application
npm run dev
```

Visit http://localhost:3000 and login with your password.

### One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MaydayV/DomainManagement)

After deployment:
1. Create **Upstash KV database**
2. Set **ACCESS_PASSWORD** environment variable
3. Redeploy

**Detailed Guide**: [📚 Deployment Guide](./docs/DEPLOYMENT.md)

## 📖 Basic Usage

### Adding Domains
1. Click "Add Domain" button
2. Enter domain → Click WHOIS lookup → Auto-fill information
3. Set pricing and filing status (optional)
4. Save

### Managing Domains
- **Visit Website**: Click domain name
- **Quick Renewal**: Click 🔄 icon  
- **Edit/Delete**: Click ⚙️ settings menu

### Data Statistics  
Top panel shows real-time stats:
- 📊 Total Domains | ⚠️ Expiring Soon | ❌ Expired | 💰 Total Spent (from registration)

## 🛠 Tech Stack

- **Next.js 14** - React full-stack framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Vercel KV** - Cloud data storage (Upstash Redis)
- **PWA** - Installable desktop app

## 📚 Documentation

- 📖 [Quick Start Guide](./docs/QUICKSTART.md) - Complete installation and usage tutorial
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md) - Full Vercel + KV deployment process
- 📋 [Feature List](./docs/FEATURES.md) - All features and future roadmap
- 💻 [Commands Reference](./docs/COMMANDS.md) - Development, customization and troubleshooting
- 📚 [Documentation Center](./docs/) - Complete documentation navigation

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

---

<div align="center">

**Made with ❤️ using Next.js & Vercel KV**

[⬆️ Back to Top](#域名管理工具--domain-management-tool) | [🇨🇳 中文](#chinese) | [🇺🇸 English](#english) | [📚 Docs](./docs/)

</div>