import { cookies } from 'next/headers';
import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export const getServerComponentClient = () =>
  createServerComponentClient<Database>({ cookies });

export const getServerActionClient = () => createServerActionClient<Database>({ cookies });

export const getRouteHandlerClient = () => createRouteHandlerClient<Database>({ cookies });
