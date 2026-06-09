import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  const { data } = await supabaseAdmin.from('tools').select('slug,updated_at,category').order('updated_at', { ascending: false });

  const lastModified = data?.[0]?.updated_at ? new Date(data[0].updated_at) : new Date();
  const home = {
    url: siteUrl,
    lastModified,
    priority: 1,
    changeFrequency: 'daily' as const,
  };

  const categories = [...new Set((data ?? []).map((tool) => tool.category))].map((category) => ({
    url: `${siteUrl}/?category=${encodeURIComponent(category)}`,
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
