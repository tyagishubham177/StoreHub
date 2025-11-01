import { NextResponse } from 'next/server';
import { getRouteHandlerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = getRouteHandlerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const next = requestUrl.searchParams.get('next') ?? '/';
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
