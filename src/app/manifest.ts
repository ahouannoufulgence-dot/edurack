
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduTrack Pro',
    short_name: 'EduTrack',
    description: 'Solution moderne de gestion pour établissements scolaires au Bénin.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F1F7F4',
    theme_color: '#1A6B4A',
    orientation: 'portrait',
    lang: 'fr',
    scope: '/',
    id: 'edutrack-pro',
    icons: [
      {
        src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=192&h=192&auto=format&fit=crop',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=512&h=512&auto=format&fit=crop',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
