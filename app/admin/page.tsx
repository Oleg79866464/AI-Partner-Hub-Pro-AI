import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

export default async function AdminPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const key = typeof searchParams.key === 'string' ? searchParams.key : '';
  const adminSecret = process.env.ADMIN_SECRET_KEY ?? '';

  if (!adminSecret || key !== adminSecret) {
    redirect('/');
  }

  const [{ data: tools, error: toolsError }, { data: clicks, error: clicksError }] = await Promise.all([
    supabaseAdmin.from('tools').select('id,name,category,click_count,commission_rate,featured,verified').order('click_count', { ascending: false }),
    supabaseAdmin.from('clicks').select('device_type,country,tool_id'),
  ]);

  if (toolsError) console.error('Admin tools query failed', toolsError);
  if (clicksError) console.error('Admin clicks query failed', clicksError);

  const totalTools = tools?.length ?? 0;
  const totalClicks = clicks?.length ?? 0;
  const estimatedRevenue = (tools ?? []).reduce((sum, tool) => sum + tool.click_count * 0.15 * 29 * tool.commission_rate, 0);
  const revenuePerClick = totalClicks > 0 ? estimatedRevenue / totalClicks : 0;

  const deviceBreakdown = (clicks ?? []).reduce(
    (acc, click) => {
      if (click.device_type === 'mobile') acc.mobile += 1;
      else if (click.device_type === 'desktop') acc.desktop += 1;
      return acc;
    },
    { mobile: 0, desktop: 0 },
  );

  const countryBreakdown = Array.from(
    (clicks ?? []).reduce((map, click) => {
      const country = click.country ?? 'unknown';
      map.set(country, (map.get(country) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topTools = [...(tools ?? [])].slice(0, 10);
  const csvKey = key;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">Admin dashboard</p>
          <h1 className="mt-3 text-3xl font-bold">Панель монетизации и трафика</h1>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Всего инструментов" value={String(totalTools)} />
          <MetricCard label="Всего кликов" value={String(totalClicks)} />
          <MetricCard label="Оценка выручки" value={money(estimatedRevenue)} />
          <MetricCard label="Revenue per click" value={money(revenuePerClick)} />
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Top tools</h2>
              <a href={`/api/export?key=${encodeURIComponent(csvKey)}`} className="text-sm font-medium text-cyan-700 hover:text-cyan-600">
                CSV export
              </a>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Clicks</th>
                    <th className="py-2">Commission</th>
                    <th className="py-2">Est. revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topTools.map((tool) => (
                    <tr key={tool.id} className="border-t border-slate-100">
                      <td className="py-3 font-medium">{tool.name}</td>
                      <td className="py-3 text-slate-600">{tool.category}</td>
                      <td className="py-3">{tool.click_count}</td>
                      <td className="py-3">{(tool.commission_rate * 100).toFixed(0)}%</td>
                      <td className="py-3">{money(tool.click_count * 0.15 * 29 * tool.commission_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Device breakdown</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">Mobile: {deviceBreakdown.mobile}</div>
                <div className="rounded-2xl bg-slate-50 p-4">Desktop: {deviceBreakdown.desktop}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Country distribution</h2>
              <div className="mt-4 space-y-3 text-sm">
                {countryBreakdown.length > 0 ? countryBreakdown.map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span>{country}</span>
                    <span>{count}</span>
                  </div>
                )) : <p className="text-slate-500">Нет данных по странам</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Почему $0.05/клик — мёртвая модель</h2>
          <p className="mt-3 leading-7 text-amber-950">
            Мы считаем RevShare, а не CPC. Формула: <strong>estimated_revenue = clicks × conversion_rate (0.15) × avg_product_price ($29) × commission_rate</strong>.
            Пример: 1000 кликов × 0.15 × $29 × 0.20 = <strong>$870/мес</strong>. Это существенно выше, чем устаревший CPC-подход.
          </p>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
