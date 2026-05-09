'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Reveals children with a fade-up animation when they enter the viewport.
 *
 * Progressive enhancement — the server renders content fully visible.
 * JavaScript sets opacity:0 immediately on mount, then IntersectionObserver
 * restores visibility when the element enters the viewport.
 * If JS is slow or fails, users always see the content.
 */
export default function ScrollReveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Hide immediately now that JS is running
    el.style.opacity = '0'
    el.style.transform = 'translateY(26px)'
    el.style.transition = `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )

    // Small delay so the initial hidden state renders before we start observing
    const t = setTimeout(() => observer.observe(el), 60)
    return () => {
      clearTimeout(t)
      observer.disconnect()
    }
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
