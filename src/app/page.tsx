
import HomeClient from '@/components/dashboard/home-client';

/**
 * Configuration du segment de route (Server Side).
 * Indispensable pour éviter l'erreur 500 et autoriser les timeouts longs pour l'IA.
 */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export default function Page() {
  return <HomeClient />;
}
