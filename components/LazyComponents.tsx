'use client'

import { lazy, Suspense, ComponentType } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

// Lazy loading para componentes pesados
export const LazyLeadDetailModal = lazy(() => 
  import('./LeadDetailModal').then(module => ({ default: module.LeadDetailModal }))
)

export const LazyNewLeadModal = lazy(() => 
  import('./NewLeadModal').then(module => ({ default: module.NewLeadModal }))
)

export const LazyAudioRecorder = lazy(() => 
  import('./AudioRecorder').then(module => ({ default: module.AudioRecorder }))
)

export const LazyAIAssistant = lazy(() => 
  import('./AIAssistant').then(module => ({ default: module.AIAssistant }))
)

export const LazyCalendarIntegration = lazy(() => 
  import('./CalendarIntegration').then(module => ({ default: module.CalendarIntegration }))
)

// HOC para adicionar Suspense com loading personalizado
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="md" />
          </div>
        )
      }
    >
      <Component {...props} />
    </Suspense>
  )
  
  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Componentes prontos para uso com Suspense
export const SuspenseLeadDetailModal = withSuspense(LazyLeadDetailModal)
export const SuspenseNewLeadModal = withSuspense(LazyNewLeadModal)
export const SuspenseAudioRecorder = withSuspense(LazyAudioRecorder)
export const SuspenseAIAssistant = withSuspense(LazyAIAssistant)
export const SuspenseCalendarIntegration = withSuspense(LazyCalendarIntegration)

// Loading skeleton para modais
export const ModalSkeleton = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] m-4">
      <div className="p-6 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
)

// Loading skeleton para cards
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-3 h-3 bg-gray-200 rounded-full ml-2"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-8"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-12"></div>
    </div>
  </div>
)

// Loading skeleton para dashboard
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>
      
      {/* KPIs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="card">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

