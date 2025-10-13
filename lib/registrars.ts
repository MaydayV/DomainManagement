import { Registrar } from '@/types';

// 预设注册商列表
export const DEFAULT_REGISTRARS: Registrar[] = [
  {
    id: 'aliyun',
    name: 'aliyun',
    displayName: {
      zh: '阿里云',
      en: 'Alibaba Cloud',
    },
    website: 'https://wanwang.aliyun.com',
    renewalUrlTemplate: 'https://dc.console.aliyun.com/next/index#/domain/list/all-domain',
  },
  {
    id: 'tencent',
    name: 'tencent',
    displayName: {
      zh: '腾讯云',
      en: 'Tencent Cloud',
    },
    website: 'https://dnspod.cloud.tencent.com',
    renewalUrlTemplate: 'https://console.cloud.tencent.com/domain',
  },
  {
    id: 'huawei',
    name: 'huawei',
    displayName: {
      zh: '华为云',
      en: 'Huawei Cloud',
    },
    website: 'https://www.huaweicloud.com/product/domain.html',
    renewalUrlTemplate: 'https://console.huaweicloud.com/domain',
  },
  {
    id: 'west',
    name: 'west',
    displayName: {
      zh: '西部数码',
      en: 'West.cn',
    },
    website: 'https://www.west.cn',
    renewalUrlTemplate: 'https://www.west.cn/manager/domain/',
  },
  {
    id: 'volcengine',
    name: 'volcengine',
    displayName: {
      zh: '火山引擎',
      en: 'Volcengine',
    },
    website: 'https://www.volcengine.com/products/domain-service',
    renewalUrlTemplate: 'https://console.volcengine.com/domain/list',
  },
  {
    id: 'cloudflare',
    name: 'cloudflare',
    displayName: {
      zh: 'Cloudflare',
      en: 'Cloudflare',
    },
    website: 'https://www.cloudflare.com/products/registrar/',
    renewalUrlTemplate: 'https://dash.cloudflare.com/',
  },
  {
    id: 'aws',
    name: 'aws',
    displayName: {
      zh: 'AWS',
      en: 'AWS Route 53',
    },
    website: 'https://aws.amazon.com/route53/',
    renewalUrlTemplate: 'https://console.aws.amazon.com/route53/domains/home',
  },
  {
    id: 'spaceship',
    name: 'spaceship',
    displayName: {
      zh: 'Spaceship',
      en: 'Spaceship',
    },
    website: 'https://www.spaceship.com',
    renewalUrlTemplate: 'https://www.spaceship.com/domains',
  },
  {
    id: 'porkbun',
    name: 'porkbun',
    displayName: {
      zh: 'Porkbun',
      en: 'Porkbun',
    },
    website: 'https://porkbun.com',
    renewalUrlTemplate: 'https://porkbun.com/account/domainsSpeadsheet',
  },
];

// 获取所有注册商（包括自定义）
export function getAllRegistrars(customRegistrars: Registrar[] = []): Registrar[] {
  return [...DEFAULT_REGISTRARS, ...customRegistrars];
}

// 根据 ID 获取注册商
export function getRegistrarById(id: string, customRegistrars: Registrar[] = []): Registrar | undefined {
  return getAllRegistrars(customRegistrars).find(r => r.id === id);
}

// 获取续费 URL
export function getRenewalUrl(domain: { registrar: string; renewalUrl?: string }, customRegistrars: Registrar[] = []): string {
  // 如果有自定义续费链接，优先使用
  if (domain.renewalUrl) {
    return domain.renewalUrl;
  }

  // 否则使用注册商的默认续费链接
  const registrar = getRegistrarById(domain.registrar, customRegistrars);
  return registrar?.renewalUrlTemplate || registrar?.website || '#';
}

