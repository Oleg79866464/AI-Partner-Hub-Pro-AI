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
    'Проверенные нейросети для маркетинга, контента и SEO: генераторы текста, видео, изображений, аналитика и автоматизация. Каталог AI-сервисов с фильтрами по цене, категории и реальному поисковому intent. Подборка под запросы: ИИ для маркетолога, нейросети для контента, AI для SMM и генератор текста.';

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

  const totalFeatured = tools.filter((tool) => tool.featured).length;
  const totalVerified = tools.filter((tool) => tool.verified).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_right,_rgba(99,102,241,0.12),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_38%,_#f8fafc_100%)] text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="grid gap-10 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                AI Catalog RU • premium-каталог нейросетей для роста выручки
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">Нейросети для маркетинга и контента, которые выглядят как enterprise-выбор</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                Каталог AI-инструментов для маркетологов, копирайтеров, SEO-специалистов, SMM и блогеров: текст, видео, изображения, аналитика и автоматизация. Подбираем сервисы с сильным product-market fit, RevShare-потенциалом и понятной экономикой подписок $15–99/мес.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-700">
                <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">Партнёрские скидки</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">Проверенные AI-сервисы</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">SEO-лендинги под RU-запросы</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">ИИ для маркетолога</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">RevShare вместо CPC</span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">Нейросети для маркетолога</span>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/20">
                  <p className="text-sm text-slate-300">В каталоге</p>
                  <p className="mt-2 text-3xl font-bold">{tools.length}</p>
                  <p className="mt-1 text-sm text-slate-300">AI tools для роста</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-300">Свежая база • SEO-ready</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Рекомендовано</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{totalFeatured}</p>
                  <p className="mt-1 text-sm text-slate-600">инструментов с высокой конверсией</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Отобрано вручную</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Проверено</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{totalVerified}</p>
                  <p className="mt-1 text-sm text-slate-600">с верификацией и партнёрками</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Trust signal</p>
                </div>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/30">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Premium stack</p>
              <h2 className="mt-3 text-2xl font-bold">Каталог, который выглядит как high-trust B2B asset</h2>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
                <li>• SEO под частотные запросы: «нейросети для маркетинга», «ИИ для копирайтинга», «AI для SMM», «генератор текста», «нейросеть для видео», «инструменты для SEO».</li>
                <li>• Ставка на RevShare и подписки $15–99/мес вместо устаревшего CPC и дешёвого кликового трафика.</li>
                <li>• Трекинг кликов, UTM и категории дают понятную аналитику по каждому партнёрскому инструменту.</li>
                <li>• Подборки закрывают intent по тексту, видео, изображениями, SEO, аналитике и автоматизации контента.</li>
              </ul>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Главный CTA</p>
                <p className="mt-2 text-lg font-semibold">Выбирайте AI-инструмент с понятной ценностью и высокой маржой.</p>
                <a href="#catalog" className="mt-4 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                  Смотреть каталог
                </a>
              </div>
            </aside>
          </div>
        </div>

        <form className="mt-10 grid gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur md:grid-cols-4">
          <input name="search" defaultValue={search} placeholder="Поиск: Jasper, SEO, видео, контент" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white" />
          <select name="category" defaultValue={category} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white">
            <option value="">Категории</option>
            {categories.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select name="pricing" defaultValue={pricing} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white">
            <option value="">Цена</option>
            {pricingOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button type="submit" className="rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:from-cyan-500 hover:to-indigo-500">Найти ИИ-инструмент</button>
        </form>

        {error ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error.message}</p> : null}

        <section className="mt-10 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Trust</p>
              <p className="mt-2 text-xl font-bold text-slate-950">Проверенные карточки</p>
              <p className="mt-1 text-sm text-slate-600">Публикуем только инструменты с понятным value prop, ценой и каналом монетизации.</p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Benefits</p>
              <p className="mt-2 text-xl font-bold text-slate-950">Сильный intent match</p>
              <p className="mt-1 text-sm text-slate-600">Категории и SEO-лендинги собраны под запросы маркетологов, копирайтеров и SMM.</p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Revenue</p>
              <p className="mt-2 text-xl font-bold text-slate-950">RevShare-first модель</p>
              <p className="mt-1 text-sm text-slate-600">Ставим партнёрские продукты и commission rate выше кликового мусора.</p>
            </div>
          </div>

          <div id="catalog" className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
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
