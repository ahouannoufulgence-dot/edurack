
import HomeClient from '@/components/dashboard/home-client';

/**
 * Configuration Serveur pour Next.js 15.
 * maxDuration est indispensable pour les flux IA lents sur mobile.
 */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export default function Page() {
  return <HomeClient />;
}
