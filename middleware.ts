import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase environment variables are not configured. Skipping session check in middleware.'
    );
    return response;
  }

  const supabase = createMiddlewareClient<Database>({ req: request, res: response });

  try {
    await supabase.auth.getSession();
  } catch (error) {
    console.error('Failed to retrieve Supabase session in middleware:', error);
  }

  return response;
}
