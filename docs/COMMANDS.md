# 命令备忘单 | Command Cheatsheet

## 📦 包管理

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 更新依赖
```bash
npm update
# 或
yarn upgrade
# 或
pnpm update
```

## 🛠️ 开发命令

### 启动开发服务器
```bash
npm run dev
# 访问 http://localhost:3000
```

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

### 代码检查
```bash
npm run lint
```

## 🚀 部署命令

### Vercel CLI 部署

#### 安装 Vercel CLI
```bash
npm i -g vercel
```

#### 登录
```bash
vercel login
```

#### 预览部署
```bash
vercel
```

#### 生产部署
```bash
vercel --prod
```

#### 查看部署列表
```bash
vercel ls
```

#### 查看部署日志
```bash
vercel logs <deployment-url>
```

### 环境变量管理

#### 添加环境变量
```bash
vercel env add ACCESS_PASSWORD
```

#### 查看环境变量
```bash
vercel env ls
```

#### 拉取环境变量
```bash
vercel env pull .env.local
```

#### 删除环境变量
```bash
vercel env rm ACCESS_PASSWORD
```

## 🔧 Git 命令

### 初始化仓库
```bash
git init
```

### 添加远程仓库
```bash
git remote add origin <repository-url>
```

### 提交代码
```bash
git add .
git commit -m "Your commit message"
git push -u origin main
```

### 查看状态
```bash
git status
```

### 查看日志
```bash
git log --oneline
```

## 🌍 多语言

### 添加新语言

1. 在 `messages/` 目录添加语言文件（如 `ja.json`）
2. 复制 `zh.json` 内容并翻译
3. 更新 `middleware.ts`:
```ts
locales: ['zh', 'en', 'ja']
```
4. 更新 `app/[locale]/layout.tsx`:
```ts
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }, { locale: 'ja' }];
}
```

## 📊 数据管理

### 备份数据
```bash
cp data/domains.json data/domains.backup.json
```

### 恢复数据
```bash
cp data/domains.backup.json data/domains.json
```

### 导出数据（需要先下载）
```bash
# 如果部署在 Vercel，需要通过 SSH 或 API
vercel logs <deployment-url> | grep domains.json
```

## 🎨 自定义

### 修改主题颜色

编辑 `tailwind.config.ts`:
```ts
colors: {
  primary: {
    50: '#f0f9ff',   // 最浅
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',  // 主色
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',  // 最深
  },
}
```

### 添加新的注册商

编辑 `lib/registrars.ts`:
```ts
{
  id: 'new-registrar',
  name: 'new-registrar',
  displayName: {
    zh: '新注册商',
    en: 'New Registrar',
  },
  website: 'https://example.com',
  renewalUrlTemplate: 'https://example.com/renew',
}
```

### 添加新的币种

编辑 `lib/currencies.ts`:
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

## 🔍 调试

### 查看 Next.js 日志
```bash
npm run dev
# 或
DEBUG=* npm run dev
```

### 查看 Vercel 日志
```bash
vercel logs <deployment-url>
# 或实时查看
vercel logs <deployment-url> --follow
```

### 清除 Next.js 缓存
```bash
rm -rf .next
npm run dev
```

## 📱 测试

### 移动端测试（局域网）

1. 启动开发服务器:
```bash
npm run dev
```

2. 查找本机 IP:
```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

3. 在手机访问: `http://<your-ip>:3000`

### 生产环境测试
```bash
npm run build
npm start
```

## 🔒 安全

### 生成强密码
```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 检查密码强度
```bash
# 密码长度至少 16 位
# 包含大小写字母、数字、特殊字符
```

## 📦 导出项目

### 创建发布包
```bash
git archive -o domain-management.zip HEAD
```

### 排除敏感文件
```bash
git archive -o domain-management.zip HEAD \
  --exclude='.env.local' \
  --exclude='data/domains.json' \
  --exclude='node_modules'
```

## 🆘 故障排除

### 端口被占用
```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)

# 或使用其他端口
PORT=3001 npm run dev
```

### 依赖冲突
```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 构建失败
```bash
# 清除缓存
rm -rf .next

# 重新构建
npm run build
```

## 📊 性能分析

### 分析包大小
```bash
npm run build
```

查看输出中的包大小信息。

### 生成源代码映射
在 `next.config.js` 添加:
```js
productionBrowserSourceMaps: true,
```

## 🔄 更新

### 更新 Next.js
```bash
npm install next@latest react@latest react-dom@latest
```

### 更新所有依赖
```bash
npm update
```

### 检查过期包
```bash
npm outdated
```

## 📚 有用的脚本

### 在 package.json 添加自定义脚本
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "backup": "cp data/domains.json data/backup-$(date +%Y%m%d).json",
    "restore": "cp data/backup-*.json data/domains.json",
    "clean": "rm -rf .next node_modules"
  }
}
```

### 运行自定义脚本
```bash
npm run backup
npm run restore
npm run clean
```

## 🎯 快速参考

| 操作 | 命令 |
|------|------|
| 安装依赖 | `npm install` |
| 开发服务器 | `npm run dev` |
| 构建项目 | `npm run build` |
| 生产服务器 | `npm start` |
| 代码检查 | `npm run lint` |
| Vercel 部署 | `vercel --prod` |
| 查看日志 | `vercel logs <url>` |
| 备份数据 | `cp data/domains.json backup.json` |

---

**提示**: 将此文件加入书签，方便随时查阅！

