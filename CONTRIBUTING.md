# 贡献指南 | Contributing Guide

感谢你考虑为域名管理工具做出贡献！

Thank you for considering contributing to Domain Management Tool!

## 🌟 如何贡献 | How to Contribute

### 🐛 报告 Bug | Reporting Bugs

1. 检查 [Issues](https://github.com/MaydayV/DomainManagement/issues) 确认问题未被报告
2. 使用 Bug Report 模板创建新 Issue
3. 提供详细的复现步骤
4. 如果可以，附上截图或日志

### ✨ 提交功能请求 | Suggesting Features

1. 在 [Discussions](https://github.com/MaydayV/DomainManagement/discussions) 讨论你的想法
2. 使用 Feature Request 模板创建 Issue
3. 描述使用场景和期望效果
4. 等待维护者反馈

### 💻 提交代码 | Submitting Code

#### 1. Fork 项目

点击右上角 **Fork** 按钮，复制项目到你的账户。

#### 2. 克隆到本地

```bash
git clone https://github.com/your-username/DomainManagement.git
cd DomainManagement
```

#### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

#### 4. 安装依赖

```bash
npm install
```

#### 5. 开发和测试

```bash
# 启动开发服务器
npm run dev

# 运行构建测试
npm run build

# 代码检查
npm run lint
```

#### 6. 提交更改

```bash
git add .
git commit -m "feat: add awesome feature"
# 或
git commit -m "fix: resolve issue #123"
```

**提交信息规范**：
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具更改

#### 7. 推送分支

```bash
git push origin feature/your-feature-name
```

#### 8. 创建 Pull Request

1. 访问你的 Fork 仓库
2. 点击 "Pull Request" 按钮
3. 填写 PR 模板
4. 等待审核

## 📋 开发规范 | Development Guidelines

### 代码风格 | Code Style

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式组件和 Hooks

### 命名规范 | Naming Conventions

```typescript
// 组件：PascalCase
export function DomainCard() {}

// 函数：camelCase
function formatPrice() {}

// 常量：UPPER_SNAKE_CASE
const API_BASE_URL = '';

// 文件：kebab-case.tsx
domain-card.tsx
```

### 目录规范 | Directory Structure

- `app/` - Next.js 页面和 API
- `components/` - React 组件
- `lib/` - 工具函数
- `types/` - TypeScript 类型
- `messages/` - 国际化翻译

## 🧪 测试 | Testing

在提交 PR 前，请确保：

```bash
# ✅ 构建成功
npm run build

# ✅ 无 ESLint 错误
npm run lint

# ✅ TypeScript 类型检查通过
npm run build

# ✅ 功能正常工作
# 手动测试所有修改的功能
```

## 📝 文档 | Documentation

如果你的更改涉及：

- **新功能**：更新 README.md 和相关文档
- **API 变更**：更新 API 文档
- **配置变更**：更新部署指南
- **破坏性变更**：在 PR 中明确说明

## 🎯 优先级 | Priority

我们特别欢迎以下贡献：

### 高优先级 | High Priority
- 🐛 Bug 修复
- 📱 移动端优化
- 🌍 新语言翻译
- ♿ 无障碍改进

### 中优先级 | Medium Priority
- ✨ 新功能实现
- 🎨 UI/UX 改进
- ⚡ 性能优化
- 📝 文档完善

### 低优先级 | Low Priority
- 🧹 代码清理
- 📦 依赖更新
- 🎭 样式调整

## 💬 交流 | Communication

- **GitHub Issues**: 提问、报告问题
- **GitHub Discussions**: 功能讨论、经验分享
- **Pull Requests**: 代码贡献

## 🎉 贡献者 | Contributors

感谢所有贡献者！

Thank you to all contributors!

<a href="https://github.com/MaydayV/DomainManagement/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MaydayV/DomainManagement" />
</a>

## 📄 许可证 | License

通过贡献代码，你同意你的贡献将在 MIT License 下授权。

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**再次感谢你的贡献！ | Thank you for your contribution!** 🎉
