'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { CheckCircle2, Loader2, Menu } from 'lucide-react';
import LoginForm from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type LoginStatus = 'idle' | 'loading' | 'success';

export default function Header() {
  const router = useRouter();
  const session = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [adminNavigating, setAdminNavigating] = useState(false);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    router.prefetch('/products');
  }, [router]);

  const handleAdminClick = useCallback(() => {
    if (session) {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      setAdminNavigating(true);
      router.push('/products');
      navigationTimeoutRef.current = setTimeout(() => {
        setAdminNavigating(false);
        navigationTimeoutRef.current = null;
      }, 4000);
      return;
    }
    setLoginStatus('idle');
    setLoginOpen(true);
  }, [router, session]);

  const clearSuccessTimeout = useCallback(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, []);

  const clearNavigationTimeout = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setLoginOpen(open);
      if (!open) {
        clearSuccessTimeout();
        setLoginStatus('idle');
      }
    },
    [clearSuccessTimeout]
  );

  useEffect(
    () => () => {
      clearSuccessTimeout();
      clearNavigationTimeout();
    },
    [clearSuccessTimeout, clearNavigationTimeout]
  );

  const handleLoginSuccess = useCallback(async () => {
    setLoginStatus('success');
    await new Promise<void>((resolve) => {
      clearSuccessTimeout();
      successTimeoutRef.current = setTimeout(() => {
        setLoginOpen(false);
        setAdminNavigating(true);
        router.replace('/products');
        router.refresh();
        resolve();
      }, 900);
    });
  }, [clearSuccessTimeout, router]);

  const overlayLabel = loginStatus === 'success' ? 'Success! Redirecting to admin…' : 'Authenticating…';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <StoreIcon className="h-6 w-6" />
          <span className="sr-only">StoreHub</span>
        </Link>
        <Link href="/" className="text-foreground transition-colors hover:text-foreground">
          Storefront
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <StoreIcon className="h-6 w-6" />
              <span className="sr-only">StoreHub</span>
            </Link>
            <Link href="/" className="hover:text-foreground">
              Storefront
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <Button onClick={handleAdminClick} disabled={adminNavigating} className="min-w-[8rem]">
            {adminNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening admin…
              </>
            ) : (
              'Admin'
            )}
          </Button>
        </div>
      </div>
      <Dialog open={loginOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to StoreHub</DialogTitle>
            <DialogDescription>
              Use your Supabase credentials to access the admin workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <LoginForm
              key={loginOpen ? 'open' : 'closed'}
              variant="plain"
              onStatusChange={setLoginStatus}
              onSuccess={handleLoginSuccess}
              className="w-full"
            />
            {loginStatus !== 'idle' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md bg-background/90 backdrop-blur">
                {loginStatus === 'success' ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600 animate-in zoom-in-95" />
                ) : (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                )}
                <p className="text-sm font-medium text-muted-foreground">{overlayLabel}</p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function StoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
