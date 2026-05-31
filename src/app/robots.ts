import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/feature',
          '/pricing',
          '/waitlist',
          '/osm-evaluator',
          '/blog',
          '/blog/*',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/admin',
          '/admin/*',
          '/product_admin',
          '/product_admin/*',
          '/api',
          '/api/*',
          '/context',
          '/context/*',
        ],
      },
    ],
    sitemap: 'https://ozymorlab.vercel.app/sitemap.xml',
  }
}
