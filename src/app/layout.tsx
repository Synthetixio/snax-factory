import type { Metadata, Viewport } from 'next';

import Providers from '~/app/providers';
import Layout from '~/lib/layout';
import '~/lib/styles/globals.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = 'SNAX Factory';

export const metadata: Metadata = {
  title: { default: APP_NAME, template: '%s | SNAX Factory' },
  description: '',
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {},
  twitter: {},
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
