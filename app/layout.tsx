import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'),
  title: {
    default: 'AI Catalog RU',
    template: '%s | AI Catalog — нейросети для маркетинга',
  },
  description:
    'Проверенные ИИ-инструменты для создания контента: текст, видео, изображения. Бесплатно и с партнёрскими скидками.',
  alternates: {
    canonical: '/',
    languages: {
      'ru-RU': '/',
    },
  },
  openGraph: {
    title: 'AI Catalog RU',
    description:
      'Проверенные ИИ-инструменты для создания контента: текст, видео, изображения. Бесплатно и с партнёрскими скидками.',
    locale: 'ru_RU',
    siteName: 'AI Catalog RU',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ru'>
      <body>{children}</body>
    </html>
  );
}
