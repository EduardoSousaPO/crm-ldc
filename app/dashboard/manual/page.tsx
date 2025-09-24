'use client'

import { BookOpen, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ManualPage() {
  const router = useRouter()

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="notion-title text-2xl font-semibold text-gray-900">
              Manual Interativo
            </h1>
            <p className="notion-body text-gray-500 mt-1">
              Guia completo para usar o CRM LDC Capital
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="notion-subtitle text-xl font-semibold text-gray-900 mb-2">
                Manual em Desenvolvimento
              </h2>
              <p className="notion-body text-gray-600 mb-6">
                O manual interativo está sendo preparado com conteúdo detalhado sobre:
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                'Como gerenciar leads no Kanban',
                'Importação e exportação de dados',
                'Atribuição de leads para consultores',
                'Integração com calendário',
                'Uso da IA para análise de leads',
                'Configuração de automações',
                'Relatórios e métricas',
                'Configurações avançadas'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="notion-body text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

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