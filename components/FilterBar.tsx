'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Filter, ArrowUpDown } from 'lucide-react';
import { SortOption, FilingStatus } from '@/types';
import { DEFAULT_REGISTRARS } from '@/lib/registrars';

interface FilterBarProps {
  registrar: string;
  filingStatus: FilingStatus;
  sortBy: SortOption;
  onRegistrarChange: (value: string) => void;
  onFilingStatusChange: (value: FilingStatus) => void;
  onSortChange: (value: SortOption) => void;
  locale: string;
}

export function FilterBar({
  registrar,
  filingStatus,
  sortBy,
  onRegistrarChange,
  onFilingStatusChange,
  onSortChange,
  locale,
}: FilterBarProps) {
  const t = useTranslations();

  const registrarOptions = [
    { value: '', label: t('domain.registrar') },
    ...DEFAULT_REGISTRARS.map(r => ({
      value: r.id,
      label: r.displayName[locale as 'zh' | 'en'],
    })),
  ];

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
    <div className="flex flex-wrap gap-3 items-center">
      {/* 筛选标签 */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">{t('common.filter')}:</span>
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
      <div className="hidden sm:block w-px h-6 bg-slate-200" />

      {/* 排序标签 */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <ArrowUpDown className="w-4 h-4" />
        <span className="hidden sm:inline">{t('common.sort')}:</span>
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
  );
}

