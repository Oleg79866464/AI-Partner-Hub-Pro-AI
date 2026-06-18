import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ToolCard } from '@/components/ToolCard';
import { supabasePublic, type ToolRow } from '@/lib/supabase';

export const revalidate = 3600;

const categoryLabels: Record<string, { title: string; description: string; keywords: string[] }> = {
  'generatsiya-teksta': {
    title: 'Генерация текста',
    description:
      'Лучшие AI-инструменты для генерации текста, копирайтинга, email-рассылок, лендингов и контент-планов для маркетологов и создателей контента. Подходит для SEO-статей, лид-магнитов, прогревов и продающих воронок. Частотные запросы: ИИ для копирайтинга, нейросети для текста, генератор текста, маркетинговые тексты, AI для лендингов.',
    keywords: ['ИИ для копирайтинга', 'нейросети для текста', 'генератор текста', 'маркетинговые тексты', 'AI для лендингов'],
  },
  seo: {
    title: 'SEO',
    description:
      'AI-инструменты для SEO: оптимизация статей, семантика, кластеризация, SERP-анализ и рост органического трафика. Подборка для тех, кто продвигает сайты, блоги и landing pages в Яндексе и Google. Частотные запросы: инструменты для SEO, нейросети для SEO, семантическое ядро, контент для поиска, AI для Яндекса.',
    keywords: ['инструменты для SEO', 'нейросети для SEO', 'семантическое ядро', 'контент для поиска', 'AI для Яндекса'],
  },
  video: {
    title: 'Видео',
    description:
      'Нейросети для видео: нарезки, shorts, reels, подкасты, монтаж и repurposing контента для соцсетей и рекламы. Используйте для быстрого производства креативов и роста охватов без большой продакшн-команды. Частотные запросы: AI для видео, нейросети для reels, инструменты для видео, видео для SMM, генератор shorts.',
    keywords: ['AI для видео', 'нейросети для reels', 'инструменты для видео', 'видео для SMM', 'генератор shorts'],
  },
  izobrazheniya: {
    title: 'Изображения',
    description:
      'AI-инструменты для генерации изображений, креативов, баннеров, обложек и визуалов для брендов и рекламных кампаний. Подходит для performance-креативов, соцсетей и быстрой проверки гипотез. Частотные запросы: генератор изображений, нейросети для баннеров, AI для дизайна, визуалы для рекламы, креативы для таргета.',
    keywords: ['генератор изображений', 'нейросети для баннеров', 'AI для дизайна', 'визуалы для рекламы', 'креативы для таргета'],
  },
  assistenty: {
    title: 'Ассистенты',
    description:
      'Универсальные AI-ассистенты для стратегий, исследований, аналитики, идей и автоматизации рабочих задач маркетолога. Помогают быстрее запускать кампании, собирать инсайты и масштабировать контент-производство. Частотные запросы: AI ассистент, нейросети для маркетолога, чат-бот для работы, assistant AI, AI для автоматизации.',
    keywords: ['AI ассистент', 'нейросети для маркетолога', 'чат-бот для работы', 'assistant AI', 'AI для автоматизации'],
  },
};

function slugifyCategory(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

async function getCategoryTools(slug: string) {
  const { data, error } = await supabasePublic
    .from('tools')
    .select('*')
    .order('featured', { ascending: false })
    .order('click_count', { ascending: false });

  if (error) {
    console.error('Category page query failed', error);
    return [] as ToolRow[];
  }

  return (data ?? []).filter((tool) => slugifyCategory(tool.category) === slug) as ToolRow[];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const info = categoryLabels[params.slug];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

  if (!info) {
    return {
      title: 'Категория не найдена | AI Catalog — нейросети для маркетинга',
      description: 'Страница категории не найдена.',
    };
  }

  const title = `${info.title} — нейросети для маркетинга и контента`;
  const description = `${info.description} Ключевые запросы: ${info.keywords.join(', ')}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/categories/${params.slug}`,
      languages: {
        'ru-RU': `${siteUrl}/categories/${params.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      locale: 'ru_RU',
      siteName: 'AI Catalog RU',
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const info = categoryLabels[params.slug];
  if (!info) notFound();

  const tools = await getCategoryTools(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: info.title,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: tool.name,
        applicationCategory: tool.category,
        description: tool.description,
        url: tool.url,
        operatingSystem: 'Web',
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.3)] lg:p-10">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">SEO-лендинг категории</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{info.title} — лучшие AI-инструменты для маркетинга и контента</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{info.description}</p>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-500">
              Здесь собраны нейросети и AI-сервисы, которые чаще всего ищут по запросам из этой категории: {info.keywords.join(', ')}. Мы отбираем инструменты по цене, качеству результата, наличию trial и потенциалу для подписочной монетизации.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
              {info.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1.5">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Категория</p>
              <p className="mt-2 text-2xl font-bold">{info.title}</p>
              <p className="mt-1 text-sm text-slate-300">Сегментированная подборка под intent поиска</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Инструментов</p>
              <p className="mt-2 text-2xl font-bold">{tools.length}</p>
              <p className="mt-1 text-sm text-slate-600">с фильтрацией по категории</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">URL</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-800">{`${siteUrl}/categories/${params.slug}`}</p>
              <p className="mt-1 text-sm text-slate-600">канонический SEO-лендинг</p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-medium text-cyan-700 hover:text-cyan-600">
              ← Назад к каталогу
            </Link>
            <p className="text-sm text-slate-500">Оптимизировано под запросы на русском языке</p>
          </div>

          <div className="mt-8">
            {tools.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">
                Ничего не найдено — попробуйте другую категорию
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
