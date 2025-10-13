'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Globe, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { Domain } from '@/types';
import { getDaysUntilExpiry } from '@/lib/utils';
import { formatPrice, getCurrencyByCode } from '@/lib/currencies';

interface StatsPanelProps {
  domains: Domain[];
  locale: string;
}

export function StatsPanel({ domains, locale }: StatsPanelProps) {
  const t = useTranslations();

  // 计算统计数据
  const totalDomains = domains.length;
  const expiringSoon = domains.filter(d => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days >= 0 && days <= 30;
  }).length;
  
  const expired = domains.filter(d => getDaysUntilExpiry(d.expiryDate) < 0).length;
  
  // 计算累计支出：从注册时间开始的总花费
  const totalSpent = domains.reduce((sum, domain) => {
    if (!domain.price || domain.price <= 0) return sum;
    
    let years = 0;
    const now = new Date();
    const expiryDate = new Date(domain.expiryDate);
    
    if (domain.registrationDate) {
      const regDate = new Date(domain.registrationDate);
      
      // 如果域名已过期，计算到过期时间的年数
      if (getDaysUntilExpiry(domain.expiryDate) < 0) {
        years = Math.ceil((expiryDate.getTime() - regDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      } else {
        // 域名未过期，计算到现在的年数
        years = Math.ceil((now.getTime() - regDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
    } else {
      // 没有注册时间，默认按1年计算
      years = 1;
    }
    
    // 至少按1年计算
    years = Math.max(years, 1);
    
    // 计算总支出（续费价格 × 年数）
    let totalCost = domain.price * years;
    
    // 转换为人民币（简单汇率）
    if (domain.currency === 'USD') {
      totalCost *= 7.3;
    } else if (domain.currency === 'EUR') {
      totalCost *= 7.8;
    } else if (domain.currency === 'GBP') {
      totalCost *= 9.1;
    } else if (domain.currency === 'JPY') {
      totalCost *= 0.05;
    } else if (domain.currency === 'HKD') {
      totalCost *= 0.93;
    }
    
    return sum + totalCost;
  }, 0);

  const stats = [
    {
      icon: Globe,
      label: t('stats.totalDomains'),
      value: totalDomains,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: AlertTriangle,
      label: t('stats.expiringSoon'),
      value: expiringSoon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Calendar,
      label: t('stats.expired'),
      value: expired,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: DollarSign,
      label: t('stats.totalSpent'),
      value: `¥${totalSpent.toFixed(0)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (totalDomains === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-down">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all hover:-translate-y-0.5`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${stat.color} opacity-80`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
