import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  const { data, error } = await supabaseAdmin.from('tools').select('slug,updated_at,category').order('updated_at', { ascending: false });

  if (error) {
    console.error('Sitemap generation failed', error);
  }

  const lastModified = data?.[0]?.updated_at ? new Date(data[0].updated_at) : new Date();
  const home = {
    url: siteUrl,
    lastModified,
    priority: 1,
    changeFrequency: 'daily' as const,
  };

  const categorySlugs = [...new Set((data ?? []).map((tool) => tool.category))].map((category) =>
    category.toLowerCase().replace(/ё/g, 'е').replace(/[^a-z0-9а-я]+/gi, '-').replace(/^-+|-+$/g, ''),
  );

  const categories = categorySlugs.map((slug) => ({
    url: `${siteUrl}/categories/${encodeURIComponent(slug)}`,
    lastModified,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }));

  const tools = (data ?? [])
    .filter((tool): tool is { slug: string; updated_at: string | null; category: string } => Boolean(tool.slug))
    .map((tool) => ({
      url: `${siteUrl}/tools/${tool.slug}`,
      lastModified: tool.updated_at ? new Date(tool.updated_at) : new Date(),
      priority: 0.6,
      changeFrequency: 'weekly' as const,
    }));

  return [home, ...categories, ...tools];
}
