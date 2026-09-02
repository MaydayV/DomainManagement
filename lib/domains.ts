import { Domain } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';
import { generateId } from './utils';
import { filterAndSortDomains } from './domain-query';

export { filterAndSortDomains };

// 检测是否在 Vercel 环境 - 更准确的检测
const IS_VERCEL = !!(process.env.VERCEL || process.env.VERCEL_ENV);
const DATA_FILE = path.join(process.cwd(), 'data', 'domains.json');
const KV_KEY = 'domains';

// 动态导入 KV
let kv: any = null;
try {
  kv = require('@vercel/kv').kv;
} catch {
  kv = null;
}

const hasKvConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

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
  if (IS_VERCEL && kv && hasKvConfig) {
    try {
      const data = await kv.get(KV_KEY);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to read from KV:', error);
    }
  }

  if (!IS_VERCEL) {
    try {
      await ensureDataDirectory();
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  console.error('Vercel environment but KV is not available');
  return [];
}

// 保存域名数据
export async function saveDomains(domains: Domain[]): Promise<void> {
  if (IS_VERCEL && kv && hasKvConfig) {
    try {
      await kv.set(KV_KEY, domains);
      return;
    } catch (error: any) {
      throw new Error(`KV save failed: ${error?.message || 'Unknown error'}`);
    }
  }

  if (!IS_VERCEL) {
    try {
      await ensureDataDirectory();
      await fs.writeFile(DATA_FILE, JSON.stringify(domains, null, 2), 'utf-8');
      return;
    } catch (error: any) {
      throw new Error(`File save failed: ${error?.message || 'Unknown error'}`);
    }
  }

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
    throw new Error(`Domain "${domain.name}" already exists in the database`);
  }
  
  const now = new Date().toISOString();
  
  const newDomain: Domain = {
    ...domain,
    id: `domain-${generateId()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  domains.push(newDomain);
  await saveDomains(domains);
  return newDomain;
}

export async function addDomainsBulk(
  items: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<{ added: Domain[]; skipped: string[] }> {
  const domains = await getDomains();
  const existing = new Set(domains.map((d) => d.name.toLowerCase()));
  const added: Domain[] = [];
  const skipped: string[] = [];
  const now = new Date().toISOString();

  for (const item of items) {
    const name = item.name?.trim();
    if (!name) continue;
    if (existing.has(name.toLowerCase())) {
      skipped.push(name);
      continue;
    }

    const newDomain: Domain = {
      ...item,
      name,
      id: `domain-${generateId()}`,
      createdAt: now,
      updatedAt: now,
    };
    domains.push(newDomain);
    existing.add(name.toLowerCase());
    added.push(newDomain);
  }

  if (added.length > 0) {
    await saveDomains(domains);
  }

  return { added, skipped };
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

