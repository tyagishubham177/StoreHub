import { NextResponse } from 'next/server';
import { getRouteHandlerClient } from '@/lib/supabase/server';
import { reportError } from '@/lib/observability/report-error';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = getRouteHandlerClient();

  const { data, error } = await supabase
    .from('app_config')
    .select('writes_enabled')
    .order('id', { ascending: false })
    .limit(1)
    .returns<{ writes_enabled: boolean }[]>();

  if (error) {
    reportError('api.health.config', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development',
        writesEnabled: null,
      },
      { status: 503 }
    );
  }

  const writesEnabled = data?.[0]?.writes_enabled ?? true;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development',
    writesEnabled,
  });
}
