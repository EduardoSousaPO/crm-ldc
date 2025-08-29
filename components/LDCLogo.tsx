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

  // Ícone SVG inspirado no logo LDC Capital - versão mais fiel
  const IconSVG = () => (
    <svg
      viewBox="0 0 120 120"
      className={`${currentSize.icon} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circular sutil */}
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="#F8FAFC"
        stroke="#E2E8F0"
        strokeWidth="1"
      />
      
      {/* Base verde (representando crescimento sustentável) */}
      <ellipse
        cx="60"
        cy="85"
        rx="40"
        ry="15"
        fill="#84CC16"
        opacity="0.6"
      />
      
      {/* Vela/Folha principal - formato mais elegante */}
      <path
        d="M40 85 Q40 50 60 25 Q80 50 80 85 Q80 95 60 95 Q40 95 40 85 Z"
        fill="#F1F5F9"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      
      {/* Nervura central da folha/vela */}
      <line
        x1="60"
        y1="30"
        x2="60"
        y2="90"
        stroke="#94A3B8"
        strokeWidth="1"
      />
      
      {/* Nervuras laterais */}
      <path
        d="M50 75 Q55 55 60 40"
        stroke="#CBD5E1"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M70 75 Q65 55 60 40"
        stroke="#CBD5E1"
        strokeWidth="0.8"
        fill="none"
      />
      
      {/* Elemento adicional - folha menor */}
      <path
        d="M30 75 Q35 65 40 75 Q35 85 30 75 Z"
        fill="#A3E635"
        opacity="0.8"
      />
      
      {/* Detalhe adicional - folha do outro lado */}
      <path
        d="M90 70 Q85 60 80 70 Q85 80 90 70 Z"
        fill="#65A30D"
        opacity="0.6"
      />
      
      {/* Sombra muito sutil */}
      <ellipse
        cx="60"
        cy="100"
        rx="30"
        ry="8"
        fill="#000000"
        opacity="0.05"
      />
    </svg>
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circular sutil */}
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="#F8FAFC"
        stroke="#E2E8F0"
        strokeWidth="1"
      />
      
      {/* Base verde */}
      <ellipse
        cx="60"
        cy="85"
        rx="40"
        ry="15"
        fill="#84CC16"
        opacity="0.6"
      />
      
      {/* Vela/Folha principal */}
      <path
        d="M40 85 Q40 50 60 25 Q80 50 80 85 Q80 95 60 95 Q40 95 40 85 Z"
        fill="#F1F5F9"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      
      {/* Nervura central */}
      <line
        x1="60"
        y1="30"
        x2="60"
        y2="90"
        stroke="#94A3B8"
        strokeWidth="1"
      />
      
      {/* Nervuras laterais */}
      <path
        d="M50 75 Q55 55 60 40"
        stroke="#CBD5E1"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M70 75 Q65 55 60 40"
        stroke="#CBD5E1"
        strokeWidth="0.8"
        fill="none"
      />
      
      {/* Elementos adicionais */}
      <path
        d="M30 75 Q35 65 40 75 Q35 85 30 75 Z"
        fill="#A3E635"
        opacity="0.8"
      />
      <path
        d="M90 70 Q85 60 80 70 Q85 80 90 70 Z"
        fill="#65A30D"
        opacity="0.6"
      />
    </svg>
  )
}

// Versão ainda mais minimalista para favicon ou ícones muito pequenos
export function LDCMini({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base verde simples */}
      <ellipse
        cx="50"
        cy="75"
        rx="35"
        ry="12"
        fill="#84CC16"
        opacity="0.7"
      />
      
      {/* Folha/vela simplificada */}
      <path
        d="M35 75 Q35 45 50 25 Q65 45 65 75 Q65 85 50 85 Q35 85 35 75 Z"
        fill="#F1F5F9"
        stroke="#94A3B8"
        strokeWidth="1"
      />
      
      {/* Nervura central */}
      <line
        x1="50"
        y1="30"
        x2="50"
        y2="80"
        stroke="#94A3B8"
        strokeWidth="0.8"
      />
    </svg>
  )
}