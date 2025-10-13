import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css';

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 验证语言
  const locales = ['zh', 'en'];
  if (!locales.includes(locale)) {
    notFound();
  }

  // 设置请求语言环境（修复 next-intl 静态渲染问题）
  setRequestLocale(locale);

  // 获取消息
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <title>Domain Management</title>
        <meta name="description" content="优雅的域名管理工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

