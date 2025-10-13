# 快速开始指南 | Quick Start Guide

## 🚀 5分钟快速部署

### Step 1: 克隆项目

```bash
git clone <your-repo-url>
cd DomainManagement
```

### Step 2: 安装依赖

```bash
npm install
```

### Step 3: 设置密码

创建 `.env.local` 文件：

```bash
echo "ACCESS_PASSWORD=your_password_here" > .env.local
```

或手动创建 `.env.local` 文件并添加：

```
ACCESS_PASSWORD=your_password_here
```

### Step 4: 启动开发服务器

```bash
npm run dev
```

### Step 5: 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

使用你设置的密码登录。

## 📦 一键部署到 Vercel

### 方法 1: GitHub + Vercel（推荐）

1. **将代码推送到 GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **在 Vercel 导入项目**

- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 选择你的仓库
- 点击 "Deploy"

3. **设置环境变量**

- 进入项目 Settings → Environment Variables
- 添加 `ACCESS_PASSWORD`
- 保存并重新部署

### 方法 2: Vercel CLI

```bash
# 安装 CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 设置密码
vercel env add ACCESS_PASSWORD

# 生产部署
vercel --prod
```

## 📝 首次使用

### 1. 登录

访问你的应用 URL，输入密码登录。

### 2. 添加第一个域名

1. 点击"添加域名"按钮
2. 填写信息：
   - 域名：`example.com`
   - 注册商：选择你的注册商
   - 到期时间：选择日期
   - 价格：（可选）
   - 备案状态：（可选）
3. 点击保存

### 3. 探索功能

- 🔍 **搜索**：在搜索框输入关键词
- 🎛️ **筛选**：按注册商或备案状态筛选
- 📊 **排序**：按到期时间、名称等排序
- 🔄 **续费**：点击续费按钮跳转到注册商
- ✏️ **编辑**：修改域名信息
- 🗑️ **删除**：删除不需要的域名

## 🌍 多语言

点击右上角的语言切换按钮，在中文和英文之间切换。

## ⚠️ 重要提示

### 数据备份

Vercel 重新部署会重置数据！建议：

1. **定期备份** `data/domains.json`
2. **使用持久化存储**（升级方案）
3. **实施导出功能**（开发中）

### 安全建议

1. 使用强密码（16+ 字符）
2. 不要在代码中硬编码密码
3. 定期更换密码
4. 不要分享你的访问链接和密码

## 🎨 自定义

### 修改主题色

编辑 `tailwind.config.ts`：

```ts
colors: {
  primary: {
    // 修改这里的颜色值
    600: '#your-color',
  },
}
```

### 添加注册商

编辑 `lib/registrars.ts`：

```ts
{
  id: 'your-registrar',
  name: 'your-registrar',
  displayName: {
    zh: '你的注册商',
    en: 'Your Registrar',
  },
  website: 'https://...',
  renewalUrlTemplate: 'https://...',
}
```

### 添加币种

编辑 `lib/currencies.ts`：

```ts
{
  code: 'XXX',
  symbol: 'X',
  name: {
    zh: '货币名称',
    en: 'Currency Name',
  },
}
```

## 📱 移动端访问

应用已适配移动端，可以直接在手机浏览器访问。

建议添加到主屏幕（PWA 功能开发中）：

- **iOS**: Safari → 分享 → 添加到主屏幕
- **Android**: Chrome → 菜单 → 添加到主屏幕

## 🆘 常见问题

### Q: 忘记密码怎么办？

A: 修改环境变量 `ACCESS_PASSWORD`，然后重新部署。

### Q: 数据丢失了怎么办？

A: 如果有备份，恢复 `data/domains.json`。建议定期备份。

### Q: 如何添加更多注册商？

A: 编辑 `lib/registrars.ts` 文件，添加新的注册商配置。

### Q: 如何更换语言？

A: 点击右上角的语言切换按钮。

### Q: 能否支持多用户？

A: 当前版本是单用户设计，多用户功能在规划中。

## 📚 更多资源

- [完整文档](./README.md)
- [部署指南](./DEPLOYMENT.md)
- [功能清单](./FEATURES.md)
- [开发计划](./DEVELOPMENT_PLAN.md)

## 🎉 开始使用

现在你已经准备好使用域名管理工具了！

如有问题，请查看文档或提交 Issue。

---

**祝你使用愉快！ Happy Managing! 🚀**

