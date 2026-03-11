import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/scanner/',
                    '/login',
                    '/profile',
                    '/dashboard',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
            },
        ],
        sitemap: 'https://www.technovashardauniversity.in/sitemap.xml',
        host: 'https://www.technovashardauniversity.in',
    }
}
