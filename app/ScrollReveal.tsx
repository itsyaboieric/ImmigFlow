'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Fade-up scroll reveal — progressive enhancement.
 *
 * Server renders content fully visible so there is no blank page on slow JS.
 * After hydration:
 *   1. If the element is already on screen at page load → leave it visible (no animation).
 *   2. If the element is below the fold → hide it, then reveal with a fade-up
 *      transition when the user scrolls to it.
 *
 * Double-rAF before observing ensures the browser has actually painted the
 * hidden state before IntersectionObserver starts watching — without this,
 * the observer fires synchronously and the transition never runs.
 */
export default function ScrollReveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip animation for elements already visible at page load
    const { top, bottom } = el.getBoundingClientRect()
    const alreadyVisible = top < window.innerHeight && bottom > 0
    if (alreadyVisible) return

    // Hide the element now that JS is running
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = [
      `opacity  0.75s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      `transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    ].join(', ')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    // Double rAF: wait for the browser to paint the hidden state before
    // we start observing — otherwise the observer can fire in the same
    // frame and skip the transition entirely.
    let raf1: number
    let raf2: number
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        observer.observe(el)
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      observer.disconnect()
    }
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
