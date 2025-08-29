/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações para produção
  poweredByHeader: false,
  compress: true,
  
  // Configurações do Supabase
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configurações de imagem
  images: {
    domains: ['nyexanwlwzdzceilxhhm.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Variáveis de ambiente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },
  
  // Configurações experimentais para performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },
}

module.exports = nextConfig
