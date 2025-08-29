'use client'

interface LDCLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'text'
  className?: string
}

export function LDCLogo({ size = 'md', variant = 'full', className = '' }: LDCLogoProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-8 h-8', text: 'text-sm' },
    md: { container: 'w-12 h-12', icon: 'w-12 h-12', text: 'text-base' },
    lg: { container: 'w-16 h-16', icon: 'w-16 h-16', text: 'text-lg' },
    xl: { container: 'w-20 h-20', icon: 'w-20 h-20', text: 'text-xl' }
  }

  const currentSize = sizes[size]

  // Ícone simples e elegante que combina com o design Notion
  const IconSVG = () => (
    <div className={`inline-flex items-center justify-center bg-gray-100 rounded-lg ${currentSize.container}`}>
      <div className="w-6 h-6 bg-gray-800 rounded-sm flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  )

  // Versão apenas ícone
  if (variant === 'icon') {
    return <IconSVG />
  }

  // Versão apenas texto
  if (variant === 'text') {
    return (
      <div className={`font-semibold text-gray-900 ${currentSize.text} ${className}`}>
        <span className="font-light tracking-wider">LDC</span>
        <span className="block text-xs font-normal text-gray-600 -mt-1 tracking-wide">Capital</span>
      </div>
    )
  }

  // Versão completa (ícone + texto)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <IconSVG />
      <div className={`font-semibold text-gray-900 ${currentSize.text}`}>
        <div className="font-light tracking-wider">LDC</div>
        <div className="text-xs font-normal text-gray-600 -mt-1 tracking-wide">Capital</div>
      </div>
    </div>
  )
}

// Versão simplificada para uso em espaços pequenos
export function LDCIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <div 
      className={`inline-flex items-center justify-center bg-gray-100 rounded-lg ${className}`} 
      style={{ width: size, height: size }}
    >
      <div 
        className="bg-gray-800 rounded-sm flex items-center justify-center" 
        style={{ 
          width: size * 0.6, 
          height: size * 0.6 
        }}
      >
        <div 
          className="bg-white rounded-full" 
          style={{ 
            width: size * 0.15, 
            height: size * 0.15 
          }}
        ></div>
      </div>
    </div>
  )
}