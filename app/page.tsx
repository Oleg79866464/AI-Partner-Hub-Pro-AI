import type { Metadata } from 'next';
import { ToolCard } from '@/components/ToolCard';
import { supabasePublic, type ToolRow } from '@/lib/supabase';

export const revalidate = 3600;

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const category = typeof searchParams.category === 'string' ? searchParams.category : '';
  const pricing = typeof searchParams.pricing === 'string' ? searchParams.pricing : '';
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const titleBase = 'AI Catalog — нейросети для маркетинга';
  const suffix = [category, pricing, search].filter(Boolean).join(' • ');

  return {
    title: suffix ? `${suffix} | ${titleBase}` : titleBase,
    description:
      'Проверенные ИИ-инструменты для создания контента: текст, видео, изображения. Бесплатно и с партнёрскими скидками.',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
      languages: {
        'ru-RU': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
      },
    },
    openGraph: {
      title: suffix ? `${suffix} | ${titleBase}` : titleBase,
      description:
        'Проверенные ИИ-инструменты для создания контента: текст, видео, изображения. Бесплатно и с партнёрскими скидками.',
      locale: 'ru_RU',
      siteName: 'AI Catalog RU',
      type: 'website',
    },
  };
}

export default async function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : '';
  const pricing = typeof searchParams.pricing === 'string' ? searchParams.pricing : '';
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';

  let query = supabasePublic.from('tools').select('*').order('featured', { ascending: false }).order('click_count', { ascending: false });
  if (category) query = query.eq('category', category);
  if (pricing) query = query.eq('pricing', pricing);
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);

  const { data, error } = await query;

  const tools = (data ?? []) as ToolRow[];
  const categories = [...new Set(tools.map((tool) => tool.category))];
  const pricingOptions = [...new Set(tools.map((tool) => tool.pricing))];

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
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
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">AI Catalog RU</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Найти ИИ-инструмент для маркетинга и контента</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Каталог проверенных нейросетей для текста, видео, изображений, SEO и аналитики. Подборки для маркетологов, копирайтеров, SMM-специалистов и блогеров.
          </p>
        </div>

        <form className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
          <input name="search" defaultValue={search} placeholder="Поиск по инструментам" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500" />
          <select name="category" defaultValue={category} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500">
            <option value="">Категории</option>
            {categories.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select name="pricing" defaultValue={pricing} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500">
            <option value="">Цена</option>
            {pricingOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700">Найти ИИ-инструмент</button>
        </form>

        {error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error.message}</p> : null}

        <section className="mt-10">
          {tools.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600">
              Ничего не найдено — попробуйте изменить фильтры
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
