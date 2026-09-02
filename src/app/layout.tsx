import type { Metadata } from 'next';
import './globals.css';
import { RestaurantProvider } from '@/lib/store/restaurant-store';
import { AppHeader } from '@/components/layout/header';
import { AppAuthGuard } from '@/components/auth/app-auth-guard';

export const metadata: Metadata = {
  title: 'Duck Noodle Restaurant OS — ระบบปฏิบัติการร้านก๋วยเตี๋ยวเป็ด',
  description: 'Enterprise Multi-Branch Operating System for Duck Noodle & Food Establishments',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Duck POS',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='th' suppressHydrationWarning>
      <body suppressHydrationWarning className='min-h-screen bg-slate-100/70 text-slate-900 antialiased flex flex-col font-sans'>
        <RestaurantProvider>
          <AppAuthGuard>
            <AppHeader />
            <div className='flex-1 w-full flex flex-col'>{children}</div>
          </AppAuthGuard>
        </RestaurantProvider>
      </body>
    </html>
  );
}
