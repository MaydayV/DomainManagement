import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '域名管理工具 | Domain Management',
  description: '优雅的域名管理工具，支持多注册商、到期提醒、多语言等功能',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>{children}</body>
    </html>
  );
}
