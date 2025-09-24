import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-50 border-green-200'
  if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  if (score >= 40) return 'text-orange-700 bg-orange-50 border-orange-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'lead_qualificado':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'reuniao_agendada':
      return 'text-indigo-700 bg-indigo-50 border-indigo-200'
    case 'proposta_apresentada':
      return 'text-orange-700 bg-orange-50 border-orange-200'
    case 'cliente_ativo':
      return 'text-green-700 bg-green-50 border-green-200'
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

