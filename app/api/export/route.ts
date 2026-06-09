import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key') ?? '';
  if (!process.env.ADMIN_SECRET_KEY || key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.from('tools_analytics').select('*').order('clicks', { ascending: false });
  if (error) {
    console.error('Export query failed', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }

  const header = ['name', 'category', 'clicks', 'unique_visitors', 'commission_rate', 'estimated_revenue', 'mobile_clicks', 'desktop_clicks'];
  const rows = (data ?? []).map((row) => [
    row.name,
    row.category,
    row.clicks,
    row.unique_visitors,
    row.commission_rate,
    row.estimated_revenue,
    row.mobile_clicks,
    row.desktop_clicks,
  ]);

  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tools-analytics.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
