import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function getDeviceType(userAgent: string | null) {
  const value = (userAgent ?? '').toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(value)) return 'mobile';
  return 'desktop';
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const toolId = Number(id);

  if (!Number.isFinite(toolId)) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  const { data: tool, error } = await supabaseAdmin.from('tools').select('*').eq('id', toolId).single();
  if (error || !tool) {
    console.error('Tool lookup failed', error);
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');
  const referer = request.headers.get('referer') ?? '';
  const url = new URL(request.url);
  const targetUrl = tool.affiliate_url || tool.url;
  const device_type = getDeviceType(userAgent);
  const payload = {
    tool_id: tool.id,
    ip: ip ?? null,
    user_agent: userAgent,
    country:
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry') ??
      request.headers.get('x-country') ??
      request.headers.get('x-vercel-ip-country-region') ??
      null,
    device_type,
    utm_source: url.searchParams.get('utm_source') ?? request.headers.get('utm_source') ?? null,
    utm_medium: url.searchParams.get('utm_medium') ?? null,
    utm_campaign: url.searchParams.get('utm_campaign') ?? null,
  };

  void supabaseAdmin.from('clicks').insert(payload).then(({ error: insertError }) => {
    if (insertError) {
      console.error('Click logging failed', insertError, { referer, payload });
    }
  });

  return NextResponse.redirect(targetUrl, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
