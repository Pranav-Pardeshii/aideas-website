'use client'

import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'pan-y',
      }}
    >
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
          style={{ touchAction: 'pan-y' }}
        />
      </Suspense>
    </div>
  )
}

