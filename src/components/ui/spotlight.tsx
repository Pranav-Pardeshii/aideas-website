'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useSpring, type SpringOptions } from 'framer-motion'
import { cn } from '@/lib/utils'

type SpotlightProps = {
  className?: string
  size?: number
  springOptions?: SpringOptions
}

export function Spotlight({
  className,
  size = 200,
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)
  const rafId = useRef<number | null>(null)

  const mouseX = useSpring(0, springOptions)
  const mouseY = useSpring(0, springOptions)

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement
      if (parent) {
        parent.style.position = 'relative'
        parent.style.overflow = 'hidden'
        setParentElement(parent)
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return
      const clientX = event.clientX
      const clientY = event.clientY

      if (rafId.current !== null) return
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
        const { left, top } = parentElement.getBoundingClientRect()
        mouseX.set(clientX - left - size / 2)
        mouseY.set(clientY - top - size / 2)
      })
    },
    [mouseX, mouseY, parentElement, size]
  )

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }, [])

  useEffect(() => {
    if (!parentElement) return
    parentElement.addEventListener('mousemove', handleMouseMove, { passive: true })
    parentElement.addEventListener('mouseenter', handleMouseEnter)
    parentElement.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove)
      parentElement.removeEventListener('mouseenter', handleMouseEnter)
      parentElement.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
    }
  }, [parentElement, handleMouseMove, handleMouseEnter, handleMouseLeave])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute top-0 left-0 rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_80%)] blur-xl transition-opacity duration-200',
        'from-zinc-50 via-zinc-100 to-zinc-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        x: mouseX,
        y: mouseY,
        willChange: 'transform, opacity',
      }}
    />
  )
}

