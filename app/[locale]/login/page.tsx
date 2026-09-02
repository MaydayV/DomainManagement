'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarClock, FileSpreadsheet, Globe, Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { isTokenValid, readAuthToken, writeAuthToken } from '@/lib/auth-client';

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = readAuthToken();
    if (isTokenValid(token)) {
      router.replace(`/${locale}`);
    }
  }, [locale, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        writeAuthToken(data.data.token);
        router.replace(`/${locale}`);
      } else {
        setError(t('auth.incorrectPassword'));
      }
    } catch {
      setError(t('message.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: CalendarClock, text: t('auth.featureExpiry') },
    { icon: Search, text: t('auth.featureWhois') },
    { icon: FileSpreadsheet, text: t('auth.featureExport') },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <aside className="relative hidden lg:flex flex-col justify-between bg-slate-900 text-white px-14 py-12 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-52 w-52 rounded-full border border-white/10" />

        <div className="relative">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Globe className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold tracking-tight">{t('common.appName')}</span>
          </div>
        </div>

        <div className="relative max-w-md space-y-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 mb-4">
              {t('auth.eyebrow')}
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight">
              {t('auth.panelTitle')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">{t('auth.tagline')}</p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} {t('common.appName')}</p>
      </aside>

      <main className="relative flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <Globe className="h-6 w-6 text-primary-600" />
            <span className="text-base font-semibold text-slate-900">{t('common.appName')}</span>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex flex-1 items-start lg:items-center justify-center px-6 pt-10 pb-16 lg:py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {t('auth.welcomeBack')}
              </h1>
              <p className="mt-2 text-sm text-slate-500">{t('auth.enterPassword')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <input
                type="text"
                name="username"
                autoComplete="username"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
              <div>
                <label htmlFor="password" className="label">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input h-11 pl-10"
                    required
                    autoFocus
                    autoComplete="current-password"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full h-11" disabled={loading}>
                {loading ? t('common.loading') : t('auth.login')}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
