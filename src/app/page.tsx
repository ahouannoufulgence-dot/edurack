
import HomeClient from '@/components/dashboard/home-client';

/**
 * Configuration du segment de route (Server Side).
 * Augmentation du timeout pour les Server Actions (IA) sur mobile.
 */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export default function Page() {
  return <HomeClient />;
}
