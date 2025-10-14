import { Domain, FilingStatus } from '@/types';
import { getRegistrarById } from './registrars';
import { formatPrice } from './currencies';

// CSV 导出功能
export function exportToCSV(domains: Domain[], locale: string = 'zh'): string {
  const headers = locale === 'zh' 
    ? ['域名', '注册商', '注册时间', '到期时间', '续费价格', '币种', '备案状态', '续费链接', '备注']
    : ['Domain', 'Registrar', 'Registration Date', 'Expiry Date', 'Price', 'Currency', 'Filing Status', 'Renewal URL', 'Notes'];

  const rows = domains.map(domain => {
    const registrar = getRegistrarById(domain.registrar);
    const registrarName = registrar?.displayName[locale as 'zh' | 'en'] || domain.registrar;
    
    return [
      domain.name,
      registrarName,
      domain.registrationDate ? new Date(domain.registrationDate).toLocaleDateString() : '',
      new Date(domain.expiryDate).toLocaleDateString(),
      domain.price.toString(),
      domain.currency,
      domain.filingStatus || '',
      domain.renewalUrl || '',
      domain.notes || ''
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

// CSV 导入功能
export function parseCSV(csvContent: string): Partial<Domain>[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data = lines.slice(1);

  return data.map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    
    // 基础映射（假设标准格式）
    const domain: Partial<Domain> = {
      name: values[0] || '',
      registrar: mapRegistrarName(values[1] || ''),
      registrationDate: values[2] ? new Date(values[2]).toISOString() : undefined,
      expiryDate: values[3] ? new Date(values[3]).toISOString() : new Date().toISOString(),
      price: parseFloat(values[4]) || 0,
      currency: values[5] || 'CNY',
      filingStatus: mapFilingStatus(values[6]) as FilingStatus,
      renewalUrl: values[7] || undefined,
      notes: values[8] || undefined,
    };

    return domain;
  }).filter(domain => domain.name); // 过滤空域名
}

// 映射注册商名称到 ID
function mapRegistrarName(name: string): string {
  const mapping: Record<string, string> = {
    '阿里云': 'aliyun',
    'Alibaba Cloud': 'aliyun',
    '腾讯云': 'tencent', 
    'Tencent Cloud': 'tencent',
    '华为云': 'huawei',
    'Huawei Cloud': 'huawei',
    '西部数码': 'west',
    'West.cn': 'west',
    '火山引擎': 'volcengine',
    'Volcengine': 'volcengine',
    'Cloudflare': 'cloudflare',
    'AWS': 'aws',
    'GoDaddy': 'godaddy',
    'Spaceship': 'spaceship',
    'Porkbun': 'porkbun',
  };

  return mapping[name] || `custom-${name}`;
}

// 映射备案状态
function mapFilingStatus(status: string): 'filed' | 'not-filed' | 'filing' | '' {
  const mapping: Record<string, 'filed' | 'not-filed' | 'filing'> = {
    '已备案': 'filed',
    'Filed': 'filed',
    '未备案': 'not-filed', 
    'Not Filed': 'not-filed',
    '备案中': 'filing',
    'Filing': 'filing',
  };

  return mapping[status] || '';
}

// 下载 CSV 文件
export function downloadCSV(csvContent: string, filename: string = 'domains.csv'): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
