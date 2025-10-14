import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeader, validateSession } from '@/lib/auth';

// WHOIS 查询 API - 使用本地库实现
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const session = getSessionFromHeader(authHeader);

  if (!validateSession(session)) {
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
      console.log('🎯 Using cached WHOIS data for:', domain);
      return NextResponse.json({
        success: true,
        data: { ...cached.data, cached: true },
      });
    }

    console.log(`🔍 Querying WHOIS for: ${domain}`);
    const startTime = Date.now();

    // 使用 next-whois API（更稳定，支持 RDAP）
    const whoisResponse = await fetch(`https://who.zmh.me/api/lookup?query=${domain}`, {
      headers: {
        'User-Agent': 'DomainManagement/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15秒超时
    });

    if (!whoisResponse.ok) {
      throw new Error(`WHOIS API returned ${whoisResponse.status}: ${whoisResponse.statusText}`);
    }

    const whoisData = await whoisResponse.json();
    const queryTime = (Date.now() - startTime) / 1000;
    
    if (!whoisData.status) {
      throw new Error(whoisData.error || 'WHOIS lookup failed');
    }

    console.log(`✅ WHOIS query completed in ${queryTime}s using ${whoisData.source || 'whois'}`);

    // 解析数据
    const result = whoisData.result;
    const registrarId = mapRegistrarToId(result.registrar || '');
    
    const responseData = {
      domain: result.domain || domain.toUpperCase(),
      registrar: registrarId,
      registrationDate: result.creationDate || result.created || null,
      expiryDate: result.expirationDate || result.expires || null,
      registrarName: result.registrar || '',
      nameServers: result.nameServers || [],
      queryTime,
      source: whoisData.source || 'whois',
    };

    // 缓存结果
    if (!globalThis.whoisCache) globalThis.whoisCache = {};
    globalThis.whoisCache[cacheKey] = {
      data: responseData,
      timestamp: Date.now(),
    };

    console.log('📊 WHOIS data processed:', {
      domain: responseData.domain,
      registrar: responseData.registrarName,
      registrarId,
      created: responseData.registrationDate,
      expires: responseData.expiryDate,
    });
    
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
    } else if (error.message?.includes('No whois server') || error.message?.includes('not found')) {
      errorMessage = 'Domain not found or not registered';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded, please wait a moment';
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}


// 解析 WHOIS 原始文本
function parseWhoisText(whoisText: string) {
  const lines = whoisText.split('\n');
  const data: any = {};

  // 提取关键信息的正则表达式
  const patterns = {
    registrar: [
      /Registrar:\s*(.+)/i,
      /Sponsoring Registrar:\s*(.+)/i,
      /Registrar Name:\s*(.+)/i,
      /注册商:\s*(.+)/i,
    ],
    creationDate: [
      /Creation Date:\s*(.+)/i,
      /Created On:\s*(.+)/i,
      /Created:\s*(.+)/i,
      /Registration Time:\s*(.+)/i,
      /注册时间:\s*(.+)/i,
      /创建时间:\s*(.+)/i,
    ],
    expirationDate: [
      /Registry Expiry Date:\s*(.+)/i,
      /Expiration Date:\s*(.+)/i,
      /Expires On:\s*(.+)/i,
      /Expiry Date:\s*(.+)/i,
      /过期时间:\s*(.+)/i,
      /到期时间:\s*(.+)/i,
    ],
    nameServers: [
      /Name Server:\s*(.+)/i,
      /nserver:\s*(.+)/i,
      /DNS:\s*(.+)/i,
    ],
  };

  // 解析每一行
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

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
        data.nameServers.push(match[1].trim().toLowerCase());
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
