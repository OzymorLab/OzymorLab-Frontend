import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://ozymorlab.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://ozymorlab.vercel.app/login',
      lastModified: new Date(),
    },
    {
      url: 'https://ozymorlab.vercel.app/dashboard',
      lastModified: new Date(),
    },
  ]
}
