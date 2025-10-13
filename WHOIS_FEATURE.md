# WHOIS 自动检测功能说明

## 功能说明

WHOIS 自动检测功能可以在添加域名时，自动查询域名的注册商和注册时间信息，无需手动输入。

## 实现方案

### 方案 1: 使用第三方 WHOIS API（推荐）

#### 可选的 WHOIS API 服务

1. **WHOIS XML API** (https://www.whoisxmlapi.com/)
   - 提供免费额度
   - 支持域名注册商查询
   - 支持注册时间查询

2. **IP2WHOIS** (https://www.ip2whois.com/)
   - 每月 500 次免费查询
   - 返回完整的 WHOIS 信息

3. **RDAP** (Registration Data Access Protocol)
   - 免费使用
   - 标准化的查询接口

#### 实现步骤

1. **注册 API 密钥**

```bash
# 在 .env.local 添加
WHOIS_API_KEY=your_api_key_here
WHOIS_API_URL=https://www.whoisxmlapi.com/whoisserver/WhoisService
```

2. **创建 WHOIS API 路由**

```typescript
// app/api/whois/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { domain } = await request.json();
  
  try {
    const response = await fetch(
      `${process.env.WHOIS_API_URL}?apiKey=${process.env.WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`
    );
    
    const data = await response.json();
    
    // 解析注册商和注册时间
    const registrar = data.WhoisRecord?.registrarName || '';
    const registrationDate = data.WhoisRecord?.createdDate || '';
    
    // 匹配到我们的注册商 ID
    const registrarId = matchRegistrar(registrar);
    
    return NextResponse.json({
      success: true,
      data: {
        registrar: registrarId,
        registrationDate,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'WHOIS query failed' },
      { status: 500 }
    );
  }
}

function matchRegistrar(registrarName: string): string {
  const mapping: Record<string, string> = {
    'Alibaba': 'aliyun',
    'Aliyun': 'aliyun',
    'Tencent': 'tencent',
    'Huawei': 'huawei',
    'West.cn': 'west',
    'Cloudflare': 'cloudflare',
    'Amazon': 'aws',
    'Spaceship': 'spaceship',
    'Porkbun': 'porkbun',
  };
  
  for (const [key, value] of Object.entries(mapping)) {
    if (registrarName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'aliyun'; // 默认返回阿里云
}
```

3. **在表单中添加自动检测按钮**

```typescript
// components/DomainForm.tsx
const [loading, setLoading] = useState(false);

const handleAutoDetect = async () => {
  if (!formData.name) {
    return;
  }
  
  setLoading(true);
  try {
    const response = await fetch('/api/whois', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: formData.name }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      setFormData({
        ...formData,
        registrar: result.data.registrar,
        registrationDate: result.data.registrationDate?.split('T')[0] || '',
      });
    }
  } catch (error) {
    console.error('Auto detect failed:', error);
  } finally {
    setLoading(false);
  }
};

// 在域名输入框旁边添加按钮
<div className="flex gap-2">
  <Input
    label={t('domain.domainName')}
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="flex-1"
  />
  <button
    type="button"
    onClick={handleAutoDetect}
    disabled={loading || !formData.name}
    className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
  >
    {loading ? '检测中...' : '自动检测'}
  </button>
</div>
```

### 方案 2: 使用免费的 WHOIS 库（Node.js）

#### 安装依赖

```bash
npm install whois-json
```

#### 实现代码

```typescript
// app/api/whois/route.ts
import { NextRequest, NextResponse } from 'next/server';
import whoiser from 'whoiser';

export async function POST(request: NextRequest) {
  const { domain } = await request.json();
  
  try {
    const whoisData = await whoiser(domain);
    
    // 解析第一个有效的 WHOIS 响应
    const firstKey = Object.keys(whoisData)[0];
    const data = whoisData[firstKey];
    
    // 提取注册商和注册时间
    const registrar = data['Registrar'] || data['Sponsoring Registrar'] || '';
    const createdDate = data['Created Date'] || data['Creation Date'] || '';
    
    const registrarId = matchRegistrar(registrar);
    
    return NextResponse.json({
      success: true,
      data: {
        registrar: registrarId,
        registrationDate: createdDate,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'WHOIS query failed' },
      { status: 500 }
    );
  }
}
```

### 方案 3: 客户端直接调用（受限）

由于浏览器的 CORS 限制，直接在客户端调用 WHOIS 服务通常不可行，建议使用后端代理。

## 注意事项

1. **频率限制**
   - 大多数 WHOIS 服务都有查询频率限制
   - 建议添加缓存机制
   - 考虑用户滥用的情况

2. **数据准确性**
   - WHOIS 数据可能不准确或过时
   - 建议允许用户手动修改
   - 仅作为辅助功能，不强制使用

3. **隐私保护**
   - 某些域名启用了隐私保护
   - WHOIS 信息可能被隐藏
   - 需要处理查询失败的情况

4. **费用考虑**
   - 免费服务有查询限制
   - 商业应用建议使用付费 API
   - 计算好每月的查询量

## 推荐实施步骤

1. **Phase 1**: 使用免费的 WHOIS 库进行测试
2. **Phase 2**: 集成付费 API（如 WHOIS XML API）
3. **Phase 3**: 添加缓存和错误处理
4. **Phase 4**: 优化用户体验（loading、重试等）

## 使用示例

```typescript
// 用户输入域名后，点击"自动检测"按钮
// 系统自动填充：
// - 注册商: cloudflare
// - 注册时间: 2020-01-15

// 用户可以：
// 1. 接受自动检测的结果
// 2. 手动修改任何字段
// 3. 重新检测
```

## 替代方案

如果不想使用 WHOIS API，可以：

1. **手动输入**: 用户自己查询并输入
2. **批量导入**: 提供 CSV 导入功能，一次性导入多个域名
3. **浏览器扩展**: 开发浏览器扩展，在注册商网站自动提取信息

## 总结

WHOIS 自动检测功能可以极大提升用户体验，但需要考虑成本、准确性和实现复杂度。建议从简单的免费方案开始，根据实际使用情况逐步优化。

