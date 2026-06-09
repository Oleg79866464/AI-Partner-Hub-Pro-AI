import type { Metadata } from 'next';
import { ToolCard } from '@/components/ToolCard';
import { supabasePublic, type ToolRow } from '@/lib/supabase';

export const revalidate = 3600;

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const category = typeof searchParams.category === 'string' ? searchParams.category : '';
  const pricing = typeof searchParams.pricing === 'string' ? searchParams.pricing : '';
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const titleBase = 'AI Catalog — нейросети для маркетинга';
  const suffix = [search, category, pricing].filter(Boolean).join(' • ');
  const title = suffix ? `${suffix} | ${titleBase}` : titleBase;
  const description =
    'Проверенные ИИ-инструменты для создания контента, SEO и performance-маркетинга. Найдите нейросети для текста, видео, изображений и аналитики с фильтрами по цене и категории.';

  return {
    title,
    description,
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
      languages: {
        'ru-RU': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
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

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            AI Catalog RU • каталог нейросетей для маркетинга
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Найти ИИ-инструмент для маркетинга и контента</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Каталог проверенных нейросетей для текста, видео, изображений, SEO, аналитики и автоматизации контента. Подборки для маркетологов, копирайтеров, SMM-специалистов и блогеров, которым важен ROI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">Партнёрские скидки</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">Проверенные инструменты</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">SEO + Performance</span>
          </div>
        </div>

        <form className="mt-10 grid gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)] backdrop-blur md:grid-cols-4">
          <input name="search" defaultValue={search} placeholder="Поиск: Jasper, SEO, видео, контент" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500" />
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
          <button type="submit" className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-sky-500">Найти ИИ-инструмент</button>
        </form>

        {error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error.message}</p> : null}

        <section className="mt-10">
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Сейчас в каталоге</p><p className="mt-2 text-2xl font-bold">{tools.length}</p><p className="mt-1 text-sm text-slate-600">инструментов для роста контента</p></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Фокус</p><p className="mt-2 text-2xl font-bold">SEO + AI</p><p className="mt-1 text-sm text-slate-600">поиск, тексты, видео, креатив</p></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Монетизация</p><p className="mt-2 text-2xl font-bold">RevShare</p><p className="mt-1 text-sm text-slate-600">а не устаревший CPC</p></div>
          </div>

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
