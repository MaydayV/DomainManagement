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
        <title>域名管理工具 | Domain Management</title>
        <meta name="description" content="优雅的域名管理工具，支持多注册商、到期提醒、多语言等功能" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* PWA 相关 */}
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="域名管理" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* 图标 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="overflow-x-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        
        {/* PWA Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ SW registered successfully');
                      
                      // 检查更新
                      registration.addEventListener('updatefound', function() {
                        console.log('🔄 New SW version found, updating...');
                      });
                    })
                    .catch(function(registrationError) {
                      console.error('❌ SW registration failed:', registrationError);
                    });
                });
                
                // 监听网络状态
                window.addEventListener('online', function() {
                  console.log('🌐 Back online');
                });
                
                window.addEventListener('offline', function() {
                  console.log('📡 Gone offline, using cache');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

