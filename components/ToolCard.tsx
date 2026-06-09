import Link from 'next/link';
import type { ToolRow } from '@/lib/supabase';

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}…`;
}

export function ToolCard({ tool }: { tool: ToolRow }) {
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
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{tool.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{tool.domain}</p>
        </div>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
          {tool.category}
        </span>
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-slate-600">{truncate(tool.description, 180)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {tool.pricing}
        </span>
        {tool.featured ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Рекомендовано</span>
        ) : null}
        {tool.verified ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">Проверено</span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tool.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 pt-4">
        <span className="text-sm text-slate-500">Кликов: {tool.click_count}</span>
        <Link
          href={`/go/${tool.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          prefetch={false}
        >
          Перейти
        </Link>
      </div>
    </article>
  );
}
