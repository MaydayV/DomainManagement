'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Globe, LogOut } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  locale: string;
  onLogout: () => void;
}

export function Header({ locale, onLogout }: HeaderProps) {
  const t = useTranslations();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group">
            <Globe className="w-8 h-8 text-primary-600 transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {t('common.appName')}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher locale={locale} />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

