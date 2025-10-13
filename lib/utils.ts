import { type ClassValue, clsx } from 'clsx';
import { differenceInDays, parseISO, formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

// 合并 className
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// 计算距离到期天数
export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = parseISO(expiryDate);
  const today = new Date();
  return differenceInDays(expiry, today);
}

// 判断是否即将到期（30天内）
export function isExpiringSoon(expiryDate: string): boolean {
  const days = getDaysUntilExpiry(expiryDate);
  return days >= 0 && days <= 30;
}

// 判断是否已过期
export function isExpired(expiryDate: string): boolean {
  return getDaysUntilExpiry(expiryDate) < 0;
}

// 获取到期状态样式
export function getExpiryStatus(expiryDate: string): {
  status: 'expired' | 'expiring-soon' | 'normal';
  color: string;
  bgColor: string;
} {
  if (isExpired(expiryDate)) {
    return {
      status: 'expired',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
    };
  }
  
  if (isExpiringSoon(expiryDate)) {
    return {
      status: 'expiring-soon',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
    };
  }
  
  return {
    status: 'normal',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  };
}

// 格式化相对时间
export function formatRelativeTime(date: string, locale: 'zh' | 'en' = 'zh'): string {
  return formatDistanceToNow(parseISO(date), {
    addSuffix: true,
    locale: locale === 'zh' ? zhCN : enUS,
  });
}

// 生成唯一 ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 验证域名格式
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

