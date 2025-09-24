// jest.setup.js
import '@testing-library/jest-dom'

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/dashboard'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  createSupabaseClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  })),
  createSupabaseServerClient: jest.fn(),
}))

// Mock de react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock de date-fns
const dateFns = jest.requireActual('date-fns')
jest.mock('date-fns', () => ({
  ...dateFns,
  format: jest.fn(),
  formatDistanceToNow: jest.fn(),
}))

jest.mock('date-fns/locale', () => ({
  ptBR: {},
}))

// Mock de file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

// Mock de xlsx
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(() => []),
  },
}))

// Mock de papaparse
jest.mock('papaparse', () => ({
  parse: jest.fn(() => ({
    data: [],
    meta: { fields: [] },
  })),
}))

// Mock de @dnd-kit/core
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => children,
  DragOverlay: ({ children }) => children,
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
  closestCorners: jest.fn(),
}))

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock do IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Configurar variáveis de ambiente para testes
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// Configurar timeout para testes assíncronos
jest.setTimeout(10000)
