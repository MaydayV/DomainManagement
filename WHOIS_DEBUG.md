# WHOIS 查询调试指南

## 🔍 问题排查步骤

### 1. 检查 Vercel 环境变量配置

在 Vercel 项目设置中确认以下环境变量已正确配置：

1. 访问：https://vercel.com/你的项目/settings/environment-variables
2. 确认存在以下变量：
   - ✅ `WHOIS_API_ID` = `10008890`
   - ✅ `WHOIS_API_KEY` = `f7f0bd282634ff8f4271b6380700c387`
3. 确保已选择 **所有环境**（Production, Preview, Development）

### 2. 重新部署

环境变量更新后必须重新部署：
1. 进入 Deployments 页面
2. 点击最新部署右侧的 `...` 菜单
3. 选择 `Redeploy`
4. 等待部署完成

### 3. 查看实时日志

在 Vercel 部署页面查看实时日志：
1. 点击最新的部署
2. 选择 `Functions` 标签
3. 找到并点击 `/api/whois` 函数
4. 查看日志输出，应该看到类似：
   ```
   🔍 Querying WHOIS for: apple.com
   🔑 API Credentials check: { hasApiId: true, hasApiKey: true, ... }
   📡 Using optimal endpoint: http://...
   ✅ WHOIS query completed in 1.2s using apihz.cn (whoisall)
   📄 WHOIS text length: 3421
   🔍 Parsed data: { domain: "APPLE.COM", ... }
   📊 Response data: { domain: "APPLE.COM", registrar: "custom-...", ... }
   ```

### 4. 常见错误及解决方案

#### ❌ 错误：WHOIS API credentials not configured
**原因**：环境变量未配置或未生效  
**解决**：
1. 重新检查环境变量设置
2. 确保重新部署了项目
3. 检查变量名是否正确（区分大小写）

#### ❌ 错误：通讯秘钥错误
**原因**：API Key 不正确  
**解决**：
1. 确认 API Key 是否正确：`f7f0bd282634ff8f4271b6380700c387`
2. 检查是否有多余的空格或引号
3. 登录 apihz.cn 确认密钥

#### ❌ 错误：暂不支持该域名后缀
**原因**：域名后缀不支持  
**解决**：
1. 确认域名格式正确（如 `example.com`，不要带 `http://`）
2. 尝试其他常见后缀（.com, .net, .org）
3. 查看支持列表：https://apihz.cn/api/wangzhanwhoisall.html

#### ❌ 错误：WHOIS query timeout
**原因**：网络超时  
**解决**：
1. 稍后重试
2. 检查 Vercel 地区设置
3. 联系 API 提供商

### 5. 浏览器调试

打开浏览器开发者工具：
1. 按 F12 打开开发者工具
2. 切换到 `Network` 标签
3. 点击 WHOIS 按钮
4. 查找 `/api/whois?domain=xxx` 请求
5. 检查响应内容：
   - 状态码应该是 200
   - 响应应该包含 `{ success: true, data: {...} }`

### 6. 测试 API 接口

使用以下命令直接测试 API：

```bash
curl "https://cn.apihz.cn/api/wangzhan/whoisall.php?id=10008890&key=f7f0bd282634ff8f4271b6380700c387&domain=apple.com&type=1"
```

应该返回：
```json
{
  "code": 200,
  "whois": "..."
}
```

### 7. 联系支持

如果以上步骤都无法解决：
1. 收集错误日志
2. 截图错误信息
3. 提供测试的域名
4. 在项目 Issues 中反馈

## 📝 环境变量配置模板

```env
# Vercel 环境变量设置
WHOIS_API_ID=10008890
WHOIS_API_KEY=f7f0bd282634ff8f4271b6380700c387
```

## 🔗 相关链接

- API 文档：https://apihz.cn/api/wangzhanwhoisall.html
- API 注册：https://apihz.cn/
- Vercel 文档：https://vercel.com/docs/environment-variables

## ✅ 成功标志

WHOIS 查询成功后，应该看到：
- ✅ 域名自动填充到输入框
- ✅ 注册商自动选择
- ✅ 注册时间和到期时间自动填充
- ✅ 表单其他字段保持可编辑状态

