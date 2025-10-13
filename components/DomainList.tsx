'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Domain } from '@/types';
import { DomainCard } from './DomainCard';
import { FolderOpen } from 'lucide-react';

interface DomainListProps {
  domains: Domain[];
  onEdit: (domain: Domain) => void;
  onDelete: (domain: Domain) => void;
  locale: string;
}

export function DomainList({ domains, onEdit, onDelete, locale }: DomainListProps) {
  const t = useTranslations();

  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {t('domain.noDomains')}
        </h3>
        <p className="text-slate-500">{t('domain.addFirstDomain')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          onEdit={onEdit}
          onDelete={onDelete}
          locale={locale}
        />
      ))}
    </div>
  );
}

