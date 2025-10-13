import { Domain, FilterOptions, SortOption } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

// 检测是否在 Vercel 环境
const IS_VERCEL = process.env.VERCEL === '1';
const DATA_FILE = path.join(process.cwd(), 'data', 'domains.json');
const KV_KEY = 'domains';

// 动态导入 KV（避免在本地环境出错）
let kv: any = null;
if (IS_VERCEL) {
  try {
    kv = require('@vercel/kv').kv;
  } catch (error) {
    console.warn('Vercel KV not available, falling back to file storage');
  }
}

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
  // Vercel 环境：优先从 KV 读取
  if (IS_VERCEL && kv) {
    try {
      const data = await kv.get(KV_KEY);
      return data || [];
    } catch (error) {
      console.error('Failed to read from KV:', error);
      // KV 失败时降级到文件读取
    }
  }

  // 本地环境或 KV 失败时：从文件读取
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 文件不存在时返回空数组
    return [];
  }
}

// 保存域名数据
export async function saveDomains(domains: Domain[]): Promise<void> {
  // Vercel 环境：保存到 KV
  if (IS_VERCEL && kv) {
    try {
      await kv.set(KV_KEY, domains);
      console.log(`Saved ${domains.length} domains to KV`);
      // 同时保存到文件作为备份（临时）
      await ensureDataDirectory();
      await fs.writeFile(DATA_FILE, JSON.stringify(domains, null, 2), 'utf-8');
      return;
    } catch (error) {
      console.error('Failed to save to KV:', error);
      // KV 失败时降级到文件保存
    }
  }

  // 本地环境或 KV 失败时：保存到文件
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(domains, null, 2), 'utf-8');
}

// 获取单个域名
export async function getDomainById(id: string): Promise<Domain | null> {
  const domains = await getDomains();
  return domains.find(d => d.id === id) || null;
}

// 添加域名
export async function addDomain(domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>): Promise<Domain> {
  const domains = await getDomains();
  const now = new Date().toISOString();
  
  const newDomain: Domain = {
    ...domain,
    id: `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  domains.push(newDomain);
  await saveDomains(domains);
  
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

