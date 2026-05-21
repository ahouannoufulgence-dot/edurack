
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'EduTrack Pro',
  description: 'Portail de gestion scolaire intégré et sécurisé',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EduTrack Pro',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A6B4A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
