import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的语言列表
  locales: ['zh', 'en'],
  
  // 默认语言
  defaultLocale: 'zh',
  
  // 自动语言检测（基于浏览器 Accept-Language 头）
  localeDetection: true,
  
  // 语言路径策略
  localePrefix: 'always',
});

export const config = {
  // 匹配所有路径，除了静态资源和 PWA 文件
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|sw.js|icon-.*\\.png).*)'],
};

