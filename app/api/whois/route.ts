import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeader, validateSession } from '@/lib/auth';

// WHOIS 查询 API - 使用 apihz.cn whoisall 接口实现（支持全球1000+域名后缀）
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const session = getSessionFromHeader(authHeader);
  const isValid = validateSession(session);

  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    // 验证域名格式
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // 检查本地缓存（避免重复查询）
    const cacheKey = `whois_${domain}`;
    const cached = globalThis.whoisCache?.[cacheKey];
    
    if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1小时缓存
      return NextResponse.json({
        success: true,
        data: { ...cached.data, cached: true },
      });
    }

    const startTime = Date.now();

    const apiId = process.env.WHOIS_API_ID;
    const apiKey = process.env.WHOIS_API_KEY;
    
    if (!apiId || !apiKey) {
      throw new Error('WHOIS API credentials not configured. Please set WHOIS_API_ID and WHOIS_API_KEY environment variables.');
    }
    
    const apiEndpoint = 'https://cn.apihz.cn/api/wangzhan/whoisall.php';

    // type=1 表示优先使用缓存，type=2 直接查询官方
    const whoisUrl = `${apiEndpoint}?id=${apiId}&key=${apiKey}&domain=${domain}&type=1`;
    const whoisResponse = await fetch(whoisUrl, {
      headers: {
        'User-Agent': 'DomainManagement/2.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15秒超时
    });

    if (!whoisResponse.ok) {
      throw new Error(`WHOIS API returned ${whoisResponse.status}: ${whoisResponse.statusText}`);
    }

    // 先获取文本，然后手动解析 JSON（API 返回的 JSON 包含未转义的控制字符）
    const responseText = await whoisResponse.text();
    
    let whoisData;
    try {
      // 修复 API 返回的格式问题：将 JSON 字符串中的实际控制字符转义
      // API 返回的 "whois" 字段包含未转义的 \r\n 等控制字符
      // 使用更强大的正则来匹配整个 whois 字段（包括跨行内容）
      const fixedText = responseText.replace(
        /"whois":\s*"([\s\S]*?)"\s*\}/,
        (match, content) => {
          // 转义JSON字符串中的特殊字符（注意顺序：先转义反斜杠）
          const escaped = content
            .replace(/\\/g, '\\\\')   // 先转义反斜杠（避免后续替换被影响）
            .replace(/"/g, '\\"')     // 转义双引号
            .replace(/\r/g, '\\r')    // 转义回车
            .replace(/\n/g, '\\n')    // 转义换行
            .replace(/\t/g, '\\t');   // 转义制表符
          return `"whois": "${escaped}"\n}`;
        }
      );
      
      whoisData = JSON.parse(fixedText);
    } catch (parseError: any) {
      console.error('❌ JSON parse error:', parseError.message);
      console.error('Response sample:', responseText.substring(0, 500));
      throw new Error(`Failed to parse WHOIS response: ${parseError.message}`);
    }
    
    const queryTime = (Date.now() - startTime) / 1000;
    
    // 检查API返回状态
    if (whoisData.code !== 200) {
      throw new Error(whoisData.msg || 'WHOIS lookup failed');
    }

    const whoisText = whoisData.whois || '';
    const parsedData = parseWhoisText(whoisText);
    
    const registrarId = mapRegistrarToId(parsedData.registrar || '');
    
    const responseData = {
      domain: parsedData.domain || domain.toUpperCase(),
      registrar: registrarId,
      registrationDate: parsedData.creationDate || null,
      expiryDate: parsedData.expirationDate || null,
      registrarName: parsedData.registrar || '',
      nameServers: parsedData.nameServers || [],
      queryTime,
      source: 'apihz.cn-whoisall',
    };
    
    // 缓存结果
    if (!globalThis.whoisCache) globalThis.whoisCache = {};
    globalThis.whoisCache[cacheKey] = {
      data: responseData,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error: any) {
    console.error('WHOIS lookup error:', error);
    
    // 处理常见错误
    let errorMessage = 'WHOIS query failed';
    if (error.message?.includes('timeout')) {
      errorMessage = 'WHOIS query timeout, please try again';
    } else if (error.message?.includes('通讯秘钥错误')) {
      errorMessage = 'API authentication failed';
    } else if (error.message?.includes('暂不支持该域名后缀')) {
      errorMessage = 'Domain suffix not supported (only top-level domains are supported)';
    } else if (error.message?.includes('not found') || error.message?.includes('域名不存在')) {
      errorMessage = 'Domain not found or not registered';
    } else if (error.message?.includes('rate limit') || error.message?.includes('频次')) {
      errorMessage = 'Rate limit exceeded, please wait a moment';
    } else if (error.message) {
      // 如果有具体的错误消息，直接使用
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}


// 解析 WHOIS 原始文本（支持全球多种格式）
function parseWhoisText(whoisText: string) {
  // 处理不同的换行符格式 (\r\n, \n, \r)
  const lines = whoisText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const data: any = {};

  // 提取关键信息的正则表达式（扩展支持更多格式）
  const patterns = {
    domain: [
      /Domain Name:\s*(.+)/i,
      /域名:\s*(.+)/i,
    ],
    registrar: [
      /Registrar:\s*(.+)/i,
      /Sponsoring Registrar:\s*(.+)/i,
      /Registrar Name:\s*(.+)/i,
      /注册商:\s*(.+)/i,
      /注册局:\s*(.+)/i,
    ],
    creationDate: [
      /Creation Date:\s*(.+)/i,
      /Created On:\s*(.+)/i,
      /Created:\s*(.+)/i,
      /Registration Time:\s*(.+)/i,
      /Registration Date:\s*(.+)/i,
      /注册时间:\s*(.+)/i,
      /创建时间:\s*(.+)/i,
    ],
    expirationDate: [
      /Registry Expiry Date:\s*(.+)/i,
      /Registrar Registration Expiration Date:\s*(.+)/i,
      /Expiration Date:\s*(.+)/i,
      /Expiration Time:\s*(.+)/i,
      /Expires On:\s*(.+)/i,
      /Expiry Date:\s*(.+)/i,
      /Expire Date:\s*(.+)/i,
      /过期时间:\s*(.+)/i,
      /到期时间:\s*(.+)/i,
    ],
    nameServers: [
      /Name Server:\s*(.+)/i,
      /nserver:\s*(.+)/i,
      /DNS:\s*(.+)/i,
      /Nameserver:\s*(.+)/i,
    ],
  };

  // 解析每一行
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('%') || trimmedLine.startsWith('#')) continue;

    // 域名
    for (const pattern of patterns.domain) {
      const match = trimmedLine.match(pattern);
      if (match && !data.domain) {
        data.domain = match[1].trim().toUpperCase();
        break;
      }
    }

    // 注册商
    for (const pattern of patterns.registrar) {
      const match = trimmedLine.match(pattern);
      if (match && !data.registrar) {
        data.registrar = match[1].trim();
        break;
      }
    }

    // 创建时间
    for (const pattern of patterns.creationDate) {
      const match = trimmedLine.match(pattern);
      if (match && !data.creationDate) {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          data.creationDate = date.toISOString();
        }
        break;
      }
    }

    // 到期时间
    for (const pattern of patterns.expirationDate) {
      const match = trimmedLine.match(pattern);
      if (match && !data.expirationDate) {
        const dateStr = match[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          data.expirationDate = date.toISOString();
        }
        break;
      }
    }

    // DNS 服务器
    for (const pattern of patterns.nameServers) {
      const match = trimmedLine.match(pattern);
      if (match) {
        if (!data.nameServers) data.nameServers = [];
        const ns = match[1].trim().toLowerCase();
        // 去重
        if (!data.nameServers.includes(ns)) {
          data.nameServers.push(ns);
        }
      }
    }
  }

  return data;
}

// 映射注册商名称到我们的系统 ID
function mapRegistrarToId(registrarName: string): string {
  const name = registrarName.toLowerCase();
  
  const mapping: Record<string, string> = {
    // 阿里云相关
    'alibaba': 'aliyun',
    'hichina': 'aliyun', 
    'aliyun': 'aliyun',
    '阿里云': 'aliyun',
    
    // 腾讯云相关  
    'tencent': 'tencent',
    'dnspod': 'tencent',
    'dnspod, inc': 'tencent',
    '腾讯': 'tencent',
    
    // 华为云
    'huawei': 'huawei',
    '华为': 'huawei',
    
    // 西部数码
    'west.cn': 'west',
    'west': 'west',
    '西部数码': 'west',
    
    // 火山引擎
    'volcengine': 'volcengine',
    '火山': 'volcengine',
    
    // 国外注册商
    'cloudflare': 'cloudflare',
    'amazon': 'aws',
    'aws': 'aws',
    'godaddy': 'godaddy',
    'spaceship': 'spaceship',
    'porkbun': 'porkbun',
    
    // 其他常见注册商
    'markmonitor': 'custom-MarkMonitor',
    'namecheap': 'custom-Namecheap',
    'network solutions': 'custom-NetworkSolutions',
  };
  
  // 检查完全匹配
  for (const [key, value] of Object.entries(mapping)) {
    if (name.includes(key)) {
      return value;
    }
  }
  
  // 未匹配时返回自定义注册商格式
  return `custom-${registrarName}`;
}
