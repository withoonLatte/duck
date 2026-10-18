import type { Metadata } from 'next';
import './globals.css';
import { RestaurantProvider } from '@/lib/store/restaurant-store';
import { AppHeader } from '@/components/layout/header';
import { AppAuthGuard } from '@/components/auth/app-auth-guard';

export const metadata: Metadata = {
  title: 'เตี๋ยวเป็ด — Restaurant OS',
  description: 'Enterprise Multi-Branch Operating System for Duck Noodle & Food Establishments',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'เตี๋ยวเป็ด POS',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='th' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
        <meta name='apple-mobile-web-app-title' content='เตี๋ยวเป็ด POS' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
      </head>
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
