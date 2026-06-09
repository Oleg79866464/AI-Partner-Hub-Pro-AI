import Link from 'next/link';
import type { ToolRow } from '@/lib/supabase';

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}…`;
}

export function ToolCard({ tool }: { tool: ToolRow }) {
  const score = Math.min(100, Math.round(tool.click_count * (tool.featured ? 0.18 : 0.12) + tool.commission_rate * 100));
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: tool.category,
    description: tool.description,
    operatingSystem: 'Web',
    url: tool.url,
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'Бесплатно' ? '0' : tool.pricing === 'Фримиум' ? 'Freemium' : 'Paid',
      priceCurrency: 'USD',
    },
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.4)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_32px_90px_-35px_rgba(8,145,178,0.35)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                {tool.domain}
              </span>
              {tool.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-900">Топ выбор</span> : null}
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950 transition group-hover:text-cyan-700">{tool.name}</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">Инструмент для {tool.category.toLowerCase()}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
            {tool.category}
          </span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{truncate(tool.description, 185)}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white shadow-sm">{tool.pricing}</span>
          {tool.verified ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">✓ Проверено</span> : null}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Score {score}/100</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tool.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-slate-500">Кликов</p>
            <p className="mt-1 text-lg font-bold text-slate-950">{tool.click_count}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-slate-500">Комиссия</p>
            <p className="mt-1 text-lg font-bold text-slate-950">{Math.round(tool.commission_rate * 100)}%</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500">Партнёрский редирект через /go</span>
          <Link
            href={`/go/${tool.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-cyan-600 hover:to-indigo-600"
            prefetch={false}
          >
            Перейти →
          </Link>
        </div>
      </div>
    </article>
  );
}
