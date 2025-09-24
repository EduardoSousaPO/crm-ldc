'use client'

import { ArrowLeft, Construction } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: React.ComponentType<any>
  features?: string[]
  comingSoon?: boolean
}

export function PlaceholderPage({ 
  title, 
  description, 
  icon: Icon = Construction,
  features = [],
  comingSoon = true
}: PlaceholderPageProps) {
  const router = useRouter()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="notion-title text-2xl font-semibold text-gray-900">
            {title}
          </h1>
          <p className="notion-body text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="notion-subtitle text-xl font-semibold text-gray-900 mb-2">
              {comingSoon ? 'Em Breve' : 'Em Desenvolvimento'}
            </h2>
            <p className="notion-body text-gray-600 mb-6">
              {comingSoon 
                ? 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve.'
                : 'Esta página está em desenvolvimento ativo.'
              }
            </p>
          </div>

          {/* Features List */}
          {features.length > 0 && (
            <div className="mb-8">
              <h3 className="notion-subtitle text-lg font-semibold text-gray-900 mb-4 text-center">
                Funcionalidades Planejadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="notion-body text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
