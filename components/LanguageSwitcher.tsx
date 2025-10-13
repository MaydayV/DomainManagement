'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  locale: string;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // 替换路径中的语言代码
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
      <button
        onClick={() => switchLanguage('zh')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          locale === 'zh'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>
    </div>
  );
}

