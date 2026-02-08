'use client'

import { ReactNode, useEffect } from 'react'

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'auto'
    
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return <>{children}</>
}
