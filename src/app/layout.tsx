import type { Metadata } from 'next';
import { JourneyProvider } from '@/context/journey-context';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '可能人生 | AI人生设计教练',
    template: '%s | 可能人生',
  },
  description:
    '通过45分钟的AI引导式对话，探索三种可能的人生方向，找到属于你的整合方案和行动建议。',
  keywords: [
    '人生设计',
    'AI教练',
    '自我探索',
    '职业规划',
    '人生规划',
    '可能人生',
  ],
  authors: [{ name: 'Possibly Life' }],
  generator: 'Coze Code',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <JourneyProvider>{children}</JourneyProvider>
      </body>
    </html>
  );
}
