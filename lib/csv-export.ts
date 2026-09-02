import { Domain, FilingStatus } from '@/types';
import { getRegistrarById } from './registrars';
import { dateOnlyPart, dateOnlyToISO } from './dates';

function escapeCSVCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportToCSV(domains: Domain[], locale: string = 'zh'): string {
  const headers = locale === 'zh'
    ? ['域名', '注册商', '注册时间', '到期时间', '续费价格', '币种', '备案状态', '续费链接', '备注']
    : ['Domain', 'Registrar', 'Registration Date', 'Expiry Date', 'Price', 'Currency', 'Filing Status', 'Renewal URL', 'Notes'];

  const rows = domains.map((domain) => {
    const registrar = getRegistrarById(domain.registrar);
    const registrarName = registrar?.displayName[locale as 'zh' | 'en'] || domain.registrar;

    return [
      domain.name,
      registrarName,
      domain.registrationDate ? dateOnlyPart(domain.registrationDate) : '',
      dateOnlyPart(domain.expiryDate),
      domain.price.toString(),
      domain.currency,
      mapFilingStatusOut(domain.filingStatus, locale),
      domain.renewalUrl || '',
      domain.notes || '',
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCSVCell(String(cell ?? ''))).join(','))
    .join('\n');
}

function parseCSVRecords(csvContent: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  const text = csvContent.replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(current.trim());
      current = '';
    } else if (char === '\n' || (char === '\r' && next === '\n') || char === '\r') {
      row.push(current.trim());
      current = '';
      if (row.some((cell) => cell !== '')) {
        rows.push(row);
      }
      row = [];
      if (char === '\r' && next === '\n') i++;
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

export function parseCSV(csvContent: string): Partial<Domain>[] {
  const records = parseCSVRecords(csvContent);
  if (records.length < 2) return [];

  return records
    .slice(1)
    .map((values) => {
      const domain: Partial<Domain> = {
        name: values[0] || '',
        registrar: mapRegistrarName(values[1] || ''),
        registrationDate: values[2] ? dateOnlyToISO(normalizeDate(values[2])) : undefined,
        expiryDate: values[3] ? dateOnlyToISO(normalizeDate(values[3])) : undefined,
        price: parseFloat(values[4]) || 0,
        currency: values[5] || 'CNY',
        filingStatus: mapFilingStatus(values[6]) as FilingStatus,
        renewalUrl: values[7] || undefined,
        notes: values[8] || undefined,
      };
      return domain;
    })
    .filter((domain) => domain.name);
}

function normalizeDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const zh = trimmed.match(/^(\d{4})[年/.-](\d{1,2})[月/.-](\d{1,2})/);
  if (zh) {
    return `${zh[1]}-${zh[2].padStart(2, '0')}-${zh[3].padStart(2, '0')}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

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
    Cloudflare: 'cloudflare',
    AWS: 'aws',
    'AWS Route 53': 'aws',
    GoDaddy: 'godaddy',
    Spaceship: 'spaceship',
    Porkbun: 'porkbun',
  };

  return mapping[name] || (name.startsWith('custom-') ? name : `custom-${name}`);
}

function mapFilingStatus(status: string): FilingStatus {
  const mapping: Record<string, FilingStatus> = {
    已备案: 'filed',
    Filed: 'filed',
    filed: 'filed',
    未备案: 'not-filed',
    'Not Filed': 'not-filed',
    'not-filed': 'not-filed',
    备案中: 'filing',
    Filing: 'filing',
    filing: 'filing',
  };

  return mapping[status] || '';
}

function mapFilingStatusOut(status: FilingStatus, locale: string): string {
  if (!status) return '';
  if (locale === 'zh') {
    if (status === 'filed') return '已备案';
    if (status === 'not-filed') return '未备案';
    if (status === 'filing') return '备案中';
  }
  if (status === 'filed') return 'Filed';
  if (status === 'not-filed') return 'Not Filed';
  if (status === 'filing') return 'Filing';
  return '';
}

export function downloadCSV(csvContent: string, filename: string = 'domains.csv'): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
