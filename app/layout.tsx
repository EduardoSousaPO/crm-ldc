import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/notion-inspired.css'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CRM - LDC Capital',
  description: 'CRM inteligente da LDC Capital - Gestão completa de clientes e investimentos',
  keywords: ['CRM', 'Consultoria', 'Investimentos', 'IA', 'Kanban'],
  authors: [{ name: 'CRM Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen h-full bg-white text-slate-900 antialiased overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
