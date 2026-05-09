'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Extra CSS class applied once in view — lets caller add transition-delay helpers */
  inViewClass?: string
}

/**
 * Adds the class `in-view` (plus optional inViewClass) when the element
 * enters the viewport. Works with the `.reveal` and `.reveal-scale` CSS
 * classes defined in globals.css — no inline styles, no layout shift.
 */
export default function ScrollReveal({ children, className = '', inViewClass = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view', ...inViewClass.split(' ').filter(Boolean))
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [inViewClass])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
