'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

// Animação de fade in suave
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.3,
  className = ""
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Animação de slide para modals
export const SlideUp = ({ 
  children, 
  isVisible = true,
  className = ""
}: { 
  children: ReactNode
  isVisible?: boolean
  className?: string
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

// Animação de scale para botões
export const ScaleOnHover = ({ 
  children, 
  className = "",
  scale = 1.02
}: { 
  children: ReactNode
  className?: string
  scale?: number
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.1 }}
    className={className}
  >
    {children}
  </motion.div>
)

// Animação stagger para listas
export const StaggerContainer = ({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: { 
  children: ReactNode
  className?: string
  staggerDelay?: number
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({ 
  children, 
  className = ""
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Animação de loading
export const Pulse = ({ 
  children, 
  className = ""
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Backdrop animado para modals
export const AnimatedBackdrop = ({ 
  onClick, 
  className = ""
}: { 
  onClick?: () => void
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 ${className}`}
  />
)

// Animação de drag para cards do Kanban
export const DragCard = ({ 
  children, 
  className = "",
  isDragging = false
}: { 
  children: ReactNode
  className?: string
  isDragging?: boolean
}) => (
  <motion.div
    layout
    animate={{
      scale: isDragging ? 1.05 : 1,
      rotate: isDragging ? 2 : 0,
      boxShadow: isDragging 
        ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
    }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Transição suave entre páginas
export const PageTransition = ({ 
  children, 
  className = ""
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

