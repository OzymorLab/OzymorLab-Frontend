import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ozymorlab.vercel.app'
  const currentDate = new Date()

  const blogSlugs = [
    'the-pedagogy-of-rubric-grounded-grading-why-subjective-evaluations-demand-explainable-ai',
    'overcoming-handwriting-variability-in-digital-evaluations-multimodal-ocr-advances',
    'bridging-the-trust-gap-how-explainable-evaluation-traces-empower-teachers'
  ]

  const staticPages = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/osm-evaluator`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/pricing`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/feature`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/waitlist`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/login`, priority: 0.4, changeFrequency: 'monthly' as const }
  ]

  const sitemapEntries = [
    ...staticPages.map(page => ({
      url: page.url,
      lastModified: currentDate,
      changeFrequency: page.changeFrequency,
      priority: page.priority
    })),
    ...blogSlugs.map(slug => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7
    }))
  ]

  return sitemapEntries
}
