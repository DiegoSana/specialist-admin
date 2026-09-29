'use client'

import { useEffect, useState } from 'react'

interface AuthenticatedVideoProps {
  src: string
  className?: string
  controls?: boolean
  muted?: boolean
  playsInline?: boolean
}

// Same rationale as authenticated-image.tsx: private storage URLs need a bearer token that a
// plain <video src> can't send. Fetches the bytes and renders them as a blob URL instead.
export default function AuthenticatedVideo({ src, className, controls, muted, playsInline }: AuthenticatedVideoProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src.includes('/private/')) {
      setVideoUrl(src)
      return
    }

    let objectUrl: string | null = null

    const loadVideo = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        if (!token) {
          setError(true)
          return
        }

        const response = await fetch(src, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          throw new Error('Failed to load video')
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setVideoUrl(objectUrl)
      } catch (err) {
        console.error('Error loading authenticated video:', err)
        setError(true)
      }
    }

    loadVideo()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [src])

  if (error || !videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className || ''}`}>
        <span className="text-xs text-gray-400">
          {error ? 'Error al cargar video' : 'Cargando...'}
        </span>
      </div>
    )
  }

  return (
    <video
      src={videoUrl}
      className={className}
      controls={controls}
      muted={muted}
      playsInline={playsInline}
    />
  )
}
