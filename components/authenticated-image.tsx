'use client'

import { useEffect, useState } from 'react'

interface AuthenticatedImageProps {
  src: string
  alt: string
  className?: string
}

// Private storage URLs (specialist-be's /storage/private/*) require a bearer token, which a plain
// <img src> can't send - the browser requests it unauthenticated and the backend returns 403. This
// fetches the bytes with the admin token and renders them as a blob URL instead. Mirrors
// specialist-fe's components/images/authenticated-image.tsx, adapted for this repo's admin_token
// key and lack of a shared getAuthToken() helper.
export default function AuthenticatedImage({ src, alt, className }: AuthenticatedImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src.includes('/private/')) {
      setImageUrl(src)
      return
    }

    let objectUrl: string | null = null

    const loadImage = async () => {
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
          throw new Error('Failed to load image')
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setImageUrl(objectUrl)
      } catch (err) {
        console.error('Error loading authenticated image:', err)
        setError(true)
      }
    }

    loadImage()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [src])

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className || ''}`}>
        <span className="text-xs text-gray-400">
          {error ? 'Error al cargar imagen' : 'Cargando...'}
        </span>
      </div>
    )
  }

  // eslint-disable-next-line @next/next/no-img-element -- blob: URL, next/image can't optimize it
  return <img src={imageUrl} alt={alt} className={className} />
}
