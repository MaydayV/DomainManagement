'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Filter, ArrowUpDown } from 'lucide-react';
import { SortOption, FilingStatus, Domain } from '@/types';
import { DEFAULT_REGISTRARS, getRegistrarById } from '@/lib/registrars';

interface FilterBarProps {
  registrar: string;
  filingStatus: FilingStatus;
  sortBy: SortOption;
  onRegistrarChange: (value: string) => void;
  onFilingStatusChange: (value: FilingStatus) => void;
  onSortChange: (value: SortOption) => void;
  locale: string;
  domains: Domain[]; // 添加域名列表用于提取自定义注册商
}

export function FilterBar({
  registrar,
  filingStatus,
  sortBy,
  onRegistrarChange,
  onFilingStatusChange,
  onSortChange,
  locale,
  domains,
}: FilterBarProps) {
  const t = useTranslations();

  // 创建筛选用的注册商选项（包括自定义）
  const createRegistrarOptions = () => {
    const options = [
      { value: '', label: t('domain.registrar') },
      ...DEFAULT_REGISTRARS.map(r => ({
        value: r.id,
        label: r.displayName[locale as 'zh' | 'en'],
      }))
    ];
    
    // 从域名列表中提取自定义注册商
    const customRegistrars = new Set<string>();
    domains.forEach(domain => {
      if (domain.registrar.startsWith('custom-')) {
        customRegistrars.add(domain.registrar);
      }
    });
    
    // 添加自定义注册商选项
    customRegistrars.forEach(registrarId => {
      const registrarInfo = getRegistrarById(registrarId);
      if (registrarInfo) {
        options.push({
          value: registrarId,
          label: `${registrarInfo.displayName[locale as 'zh' | 'en']} (${t('registrar.custom')})`,
        });
      }
    });
    
    return options;
  };

  const registrarOptions = createRegistrarOptions();

  const filingOptions = [
    { value: '', label: t('domain.filingStatus') },
    { value: 'filed', label: t('filingStatus.filed') },
    { value: 'not-filed', label: t('filingStatus.notFiled') },
    { value: 'filing', label: t('filingStatus.filing') },
  ];

  const sortOptions = [
    { value: 'expiry-asc', label: t('sort.expiryAsc') },
    { value: 'expiry-desc', label: t('sort.expiryDesc') },
    { value: 'name-asc', label: t('sort.nameAsc') },
    { value: 'name-desc', label: t('sort.nameDesc') },
    { value: 'created-desc', label: t('sort.createdDesc') },
    { value: 'created-asc', label: t('sort.createdAsc') },
  ];

  return (
    <div className="w-full">
      {/* 桌面端：单行布局 */}
      <div className="hidden md:flex flex-wrap gap-3 items-center">
        {/* 筛选标签 */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="w-4 h-4" />
          <span>{t('common.filter')}:</span>
        </div>

        {/* 注册商筛选 */}
        <select
          value={registrar}
          onChange={(e) => onRegistrarChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:border-slate-300 transition-colors"
        >
          {registrarOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 备案状态筛选 */}
        <select
          value={filingStatus}
          onChange={(e) => onFilingStatusChange(e.target.value as FilingStatus)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:border-slate-300 transition-colors"
        >
          {filingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 分隔符 */}
        <div className="w-px h-6 bg-slate-200" />

        {/* 排序标签 */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowUpDown className="w-4 h-4" />
          <span>{t('common.sort')}:</span>
        </div>

        {/* 排序选择 */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:border-slate-300 transition-colors"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 移动端：网格布局 */}
      <div className="md:hidden space-y-3">
        {/* 第一行：筛选 */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <Filter className="w-4 h-4" />
          <span>{t('common.filter')}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <select
            value={registrar}
            onChange={(e) => onRegistrarChange(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {registrarOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filingStatus}
            onChange={(e) => onFilingStatusChange(e.target.value as FilingStatus)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {filingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 第二行：排序 */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <ArrowUpDown className="w-4 h-4" />
          <span>{t('common.sort')}</span>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

