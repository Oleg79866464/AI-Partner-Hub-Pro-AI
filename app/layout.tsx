import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
const metadataBase = siteUrl.startsWith('http') ? new URL(siteUrl) : new URL('https://example.com');

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'AI Catalog RU',
    template: '%s | AI Catalog — нейросети для маркетинга',
  },
  description:
    'Проверенные ИИ-инструменты для маркетинга, контента и SEO: нейросети для текста, видео, изображений, аналитики и автоматизации. Бесплатно, с партнёрскими скидками и RevShare-подходом.',
  alternates: {
    canonical: '/',
    languages: {
      'ru-RU': '/',
    },
  },
  openGraph: {
    title: 'AI Catalog RU',
    description:
      'Проверенные ИИ-инструменты для маркетинга, контента и SEO: нейросети для текста, видео, изображений, аналитики и автоматизации. Бесплатно, с партнёрскими скидками и RevShare-подходом.',
    locale: 'ru_RU',
    siteName: 'AI Catalog RU',
    type: 'website',
    url: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Catalog RU',
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ru'>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
