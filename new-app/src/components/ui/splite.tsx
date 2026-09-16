'use client'

import { Suspense, lazy, useEffect, useRef, useState } from 'react'
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
  const [shouldLoad, setShouldLoad] = useState(true)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting
        setInView(visible)
        if (visible) setShouldLoad(true)
      },
      { rootMargin: '120px', threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setSplineActive(appRef.current, inView && !document.hidden)
  }, [inView])

  useEffect(() => {
    const onVisibility = () => {
      setSplineActive(appRef.current, inView && !document.hidden)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [inView])

  return (
    <div ref={wrapRef} className={className} style={{ width: '100%', height: '100%' }}>
      {shouldLoad ? (
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
              setSplineActive(app, inView && !document.hidden)
            }}
          />
        </Suspense>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader" />
        </div>
      )}
    </div>
  )
}
