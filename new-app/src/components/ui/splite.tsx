'use client'

import { Suspense, lazy, useEffect, useRef } from 'react'
import type { Application } from '@splinetool/runtime'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

function setSplineActive(app: Application | null, active: boolean) {
  if (!app) return
  try {
    if (active) app.play()
    else app.stop()
  } catch {
    /* ignore runtime API differences */
  }
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  useEffect(() => {
    const onVisibility = () => {
      setSplineActive(appRef.current, !document.hidden)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    const onScroll = () => {
      if (wrapRef.current) {
        if (wrapRef.current.style.pointerEvents !== 'none') {
          wrapRef.current.style.pointerEvents = 'none'
        }
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          if (wrapRef.current) {
            wrapRef.current.style.pointerEvents = 'auto'
          }
        }, 150)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <div ref={wrapRef} className={className} style={{ width: '100%', height: '100%' }}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader" />
          </div>
        }
      >
        <Spline
          scene={scene}
          className="w-full h-full"
          onLoad={(app) => {
            appRef.current = app
            setSplineActive(app, !document.hidden)
          }}
        />
      </Suspense>
    </div>
  )
}
