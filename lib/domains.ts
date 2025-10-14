import { Domain, FilterOptions, SortOption } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

// 检测是否在 Vercel 环境 - 更准确的检测
const IS_VERCEL = !!(process.env.VERCEL || process.env.VERCEL_ENV);
const DATA_FILE = path.join(process.cwd(), 'data', 'domains.json');
const KV_KEY = 'domains';

// 动态导入 KV
let kv: any = null;
try {
  kv = require('@vercel/kv').kv;
  console.log('✅ Vercel KV imported successfully');
} catch (error) {
  console.warn('⚠️ Vercel KV not available:', error);
}

// 验证 KV 配置
const hasKvConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
console.log('🔍 Environment check:', {
  IS_VERCEL,
  hasKvConfig,
  hasKV: !!kv,
});

// 确保数据目录存在
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// 读取域名数据
export async function getDomains(): Promise<Domain[]> {
  console.log('📖 Reading domains, environment:', { IS_VERCEL, hasKV: !!kv, hasKvConfig });
  
  // Vercel 环境且有 KV：从 KV 读取
  if (IS_VERCEL && kv && hasKvConfig) {
    try {
      console.log('📡 Reading from KV...');
      const data = await kv.get(KV_KEY);
      console.log('✅ KV read success:', Array.isArray(data) ? `${data.length} domains` : 'no data');
      return data || [];
    } catch (error) {
      console.error('❌ Failed to read from KV:', error);
      console.error('🔧 Attempting file storage fallback...');
    }
  }

  // 本地环境或 KV 失败时：从文件读取
  if (!IS_VERCEL) {
    try {
      await ensureDataDirectory();
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      console.log('📄 File read success');
      return JSON.parse(data);
    } catch (error) {
      console.log('📄 File not found, returning empty array');
      return [];
    }
  } else {
    // Vercel 环境但 KV 不可用
    console.error('🚨 CRITICAL: In Vercel but KV not available!');
    return [];
  }
}

// 保存域名数据
export async function saveDomains(domains: Domain[]): Promise<void> {
  console.log('💾 Saving domains, environment:', { IS_VERCEL, hasKV: !!kv, hasKvConfig, count: domains.length });
  
  // Vercel 环境：必须使用 KV
  if (IS_VERCEL && kv && hasKvConfig) {
    try {
      console.log('📡 Saving to KV...');
      await kv.set(KV_KEY, domains);
      console.log(`✅ Saved ${domains.length} domains to KV successfully`);
      return;
    } catch (error: any) {
      console.error('❌ Failed to save to KV:', error);
      throw new Error(`KV save failed: ${error?.message || 'Unknown error'}`);
    }
  }

  // 本地环境：使用文件存储
  if (!IS_VERCEL) {
    try {
      await ensureDataDirectory();
      await fs.writeFile(DATA_FILE, JSON.stringify(domains, null, 2), 'utf-8');
      console.log(`✅ Saved ${domains.length} domains to file`);
      return;
    } catch (error: any) {
      console.error('❌ Failed to save to file:', error);
      throw new Error(`File save failed: ${error?.message || 'Unknown error'}`);
    }
  }

  // Vercel 环境但 KV 不可用
  console.error('🚨 CRITICAL ERROR: In Vercel environment but KV is not available!');
  console.error('🔧 KV Configuration:', {
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    KV_URL: !!process.env.KV_URL,
  });
  throw new Error('KV database not available in Vercel environment');
}

// 获取单个域名
export async function getDomainById(id: string): Promise<Domain | null> {
  const domains = await getDomains();
  return domains.find(d => d.id === id) || null;
}

// 添加域名（包含去重检查）
export async function addDomain(domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>): Promise<Domain> {
  const domains = await getDomains();
  
  // 检查域名是否已存在
  const existingDomain = domains.find(d => d.name.toLowerCase() === domain.name.toLowerCase());
  if (existingDomain) {
    console.log('⚠️ Domain already exists:', domain.name);
    throw new Error(`Domain "${domain.name}" already exists in the database`);
  }
  
  const now = new Date().toISOString();
  
  const newDomain: Domain = {
    ...domain,
    id: `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  console.log('➕ Adding new domain:', newDomain.name);
  domains.push(newDomain);
  await saveDomains(domains);
  
  console.log('✅ Domain added successfully:', newDomain.name);
  return newDomain;
}

// 更新域名
export async function updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | null> {
  const domains = await getDomains();
  const index = domains.findIndex(d => d.id === id);
  
  if (index === -1) {
    return null;
  }
  
  domains[index] = {
    ...domains[index],
    ...updates,
    id: domains[index].id, // 保持 ID 不变
    createdAt: domains[index].createdAt, // 保持创建时间不变
    updatedAt: new Date().toISOString(),
  };
  
  await saveDomains(domains);
  return domains[index];
}

// 删除域名
export async function deleteDomain(id: string): Promise<boolean> {
  const domains = await getDomains();
  const filteredDomains = domains.filter(d => d.id !== id);
  
  if (filteredDomains.length === domains.length) {
    return false; // 未找到要删除的域名
  }
  
  await saveDomains(filteredDomains);
  return true;
}

// 筛选和排序域名
export function filterAndSortDomains(
  domains: Domain[],
  filters: FilterOptions = {},
  sort: SortOption = 'expiry-asc'
): Domain[] {
  let result = [...domains];
  
  // 应用筛选
  if (filters.registrar) {
    result = result.filter(d => d.registrar === filters.registrar);
  }
  
  if (filters.filingStatus) {
    result = result.filter(d => d.filingStatus === filters.filingStatus);
  }
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.registrar.toLowerCase().includes(query) ||
      d.notes?.toLowerCase().includes(query)
    );
  }
  
  // 应用排序
  result.sort((a, b) => {
    switch (sort) {
      case 'expiry-asc':
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      case 'expiry-desc':
        return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'created-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
  
  return result;
}

