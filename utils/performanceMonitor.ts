/**
 * Utilitário para monitoramento de performance do Drag & Drop
 * Usado apenas em desenvolvimento para identificar gargalos
 */

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  details?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private timers: Map<string, number> = new Map()
  private enabled: boolean = process.env.NODE_ENV === 'development'

  // Iniciar medição de performance
  startMeasure(name: string, details?: Record<string, any>): void {
    if (!this.enabled) return
    
    this.timers.set(name, performance.now())
    
    if (details) {
      console.log(`🚀 Performance: Iniciando ${name}`, details)
    }
  }

  // Finalizar medição de performance
  endMeasure(name: string, details?: Record<string, any>): number {
    if (!this.enabled) return 0
    
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`⚠️ Performance: Timer ${name} não encontrado`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      details
    }

    this.metrics.push(metric)

    // Log automático para operações lentas
    if (duration > 100) {
      console.warn(`🐌 Performance: ${name} demorou ${duration.toFixed(2)}ms`, details)
    } else if (duration > 50) {
      console.log(`⏱️ Performance: ${name} levou ${duration.toFixed(2)}ms`, details)
    }

    // Manter apenas os últimos 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    return duration
  }

  // Medir função automaticamente
  measureFunction<T>(name: string, fn: () => T, details?: Record<string, any>): T {
    if (!this.enabled) return fn()
    
    this.startMeasure(name, details)
    try {
      const result = fn()
      this.endMeasure(name)
      return result
    } catch (error) {
      this.endMeasure(name, { error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }

  // Medir função async automaticamente
  async measureAsyncFunction<T>(
    name: string, 
    fn: () => Promise<T>, 
    details?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) return fn()
    
    this.startMeasure(name, details)
    try {
      const result = await fn()
      this.endMeasure(name)
      return result
    } catch (error) {
      this.endMeasure(name, { error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }

  // Obter estatísticas de performance
  getStats(): {
    totalMeasures: number
    averageDuration: number
    slowestOperations: PerformanceMetric[]
    recentOperations: PerformanceMetric[]
  } | null {
    if (!this.enabled || this.metrics.length === 0) return null

    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0)
    const averageDuration = totalDuration / this.metrics.length

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)

    const recentOperations = [...this.metrics]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)

    return {
      totalMeasures: this.metrics.length,
      averageDuration,
      slowestOperations,
      recentOperations
    }
  }

  // Limpar métricas
  clear(): void {
    this.metrics = []
    this.timers.clear()
  }

  // Log de estatísticas no console
  logStats(): void {
    if (!this.enabled) return

    const stats = this.getStats()
    if (!stats) {
      console.log('📊 Performance: Nenhuma métrica coletada')
      return
    }

    console.group('📊 Performance Statistics')
    console.log(`Total de medições: ${stats.totalMeasures}`)
    console.log(`Duração média: ${stats.averageDuration.toFixed(2)}ms`)
    
    if (stats.slowestOperations.length > 0) {
      console.group('🐌 Operações mais lentas:')
      stats.slowestOperations.forEach((metric, index) => {
        console.log(`${index + 1}. ${metric.name}: ${metric.duration.toFixed(2)}ms`)
      })
      console.groupEnd()
    }

    if (stats.recentOperations.length > 0) {
      console.group('⏰ Operações recentes:')
      stats.recentOperations.forEach((metric) => {
        const timeAgo = Date.now() - metric.timestamp
        console.log(`${metric.name}: ${metric.duration.toFixed(2)}ms (há ${timeAgo}ms)`)
      })
      console.groupEnd()
    }

    console.groupEnd()
  }

  // Monitorar uso de memória
  logMemoryUsage(): void {
    if (!this.enabled || !(performance as any).memory) return

    const memory = (performance as any).memory
    console.group('🧠 Memory Usage')
    console.log(`Usado: ${Math.round(memory.usedJSHeapSize / 1048576)}MB`)
    console.log(`Total: ${Math.round(memory.totalJSHeapSize / 1048576)}MB`)
    console.log(`Limite: ${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`)
    console.log(`Uso: ${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`)
    console.groupEnd()
  }
}

// Instância singleton
export const performanceMonitor = new PerformanceMonitor()

// Utilitários específicos para Drag & Drop
export const dragDropPerformance = {
  // Medir tempo de drag
  measureDrag: (leadId: string, fromStatus: string, toStatus: string) => {
    performanceMonitor.startMeasure('drag-operation', {
      leadId,
      fromStatus,
      toStatus
    })
  },

  // Finalizar medição de drag
  completeDrag: (leadId: string) => {
    performanceMonitor.endMeasure('drag-operation', { leadId })
  },

  // Medir tempo de atualização de lead
  measureLeadUpdate: async (leadId: string, updateFn: () => Promise<void>) => {
    return performanceMonitor.measureAsyncFunction(
      'lead-update',
      updateFn,
      { leadId }
    )
  },

  // Medir tempo de criação de lead
  measureLeadCreate: async (leadData: any, createFn: () => Promise<void>) => {
    return performanceMonitor.measureAsyncFunction(
      'lead-create',
      createFn,
      { leadName: leadData.name }
    )
  },

  // Medir renderização de componentes
  measureRender: (componentName: string, renderFn: () => any) => {
    return performanceMonitor.measureFunction(
      `render-${componentName}`,
      renderFn
    )
  }
}

// Hook para usar o monitor em componentes React
export function usePerformanceMonitor() {
  const startMeasure = (name: string, details?: Record<string, any>) => {
    performanceMonitor.startMeasure(name, details)
  }

  const endMeasure = (name: string, details?: Record<string, any>) => {
    return performanceMonitor.endMeasure(name, details)
  }

  const getStats = () => {
    return performanceMonitor.getStats()
  }

  const logStats = () => {
    performanceMonitor.logStats()
  }

  const logMemory = () => {
    performanceMonitor.logMemoryUsage()
  }

  return {
    startMeasure,
    endMeasure,
    getStats,
    logStats,
    logMemory
  }
}

// Auto-log de estatísticas a cada 30 segundos em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceMonitor.logStats()
    performanceMonitor.logMemoryUsage()
  }, 30000)
}
