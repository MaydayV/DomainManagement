import { CurrencyOption } from '@/types';

// 支持的币种列表
export const CURRENCIES: CurrencyOption[] = [
  {
    code: 'CNY',
    symbol: '¥',
    name: {
      zh: '人民币',
      en: 'Chinese Yuan',
    },
  },
  {
    code: 'USD',
    symbol: '$',
    name: {
      zh: '美元',
      en: 'US Dollar',
    },
  },
  {
    code: 'EUR',
    symbol: '€',
    name: {
      zh: '欧元',
      en: 'Euro',
    },
  },
  {
    code: 'GBP',
    symbol: '£',
    name: {
      zh: '英镑',
      en: 'British Pound',
    },
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: {
      zh: '日元',
      en: 'Japanese Yen',
    },
  },
  {
    code: 'HKD',
    symbol: 'HK$',
    name: {
      zh: '港币',
      en: 'Hong Kong Dollar',
    },
  },
];

// 根据币种代码获取币种信息
export function getCurrencyByCode(code: string): CurrencyOption | undefined {
  return CURRENCIES.find(c => c.code === code);
}

// 格式化价格显示
export function formatPrice(price: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) {
    return `${price} ${currencyCode}`;
  }
  
  return `${currency.symbol}${price.toFixed(2)}`;
}

