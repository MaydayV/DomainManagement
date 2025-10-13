import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的语言列表
  locales: ['zh', 'en'],
  
  // 默认语言
  defaultLocale: 'zh',
  
  // 语言检测
  localeDetection: true,
});

export const config = {
  // 匹配所有路径，除了 api、_next/static、_next/image、favicon.ico
  matcher: ['/', '/(zh|en)/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

