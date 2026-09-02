'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
      <button
        type="button"
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
        type="button"
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
