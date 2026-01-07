import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://pepo.app/',
      lastModified: new Date(),
    },
    {
      url: 'https://pepo.app/trust-score/leaderboard',
      lastModified: new Date(),
    },
    {
      url: 'https://pepo.app/admin/analytics',
      lastModified: new Date(),
    },
    // Add more static or dynamic routes as needed
  ];
}
