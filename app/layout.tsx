import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '域名管理工具 | Domain Management',
  description: '优雅的域名管理工具，支持多注册商、到期提醒、多语言等功能',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 重定向到默认语言
  redirect('/zh');
}
