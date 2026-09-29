'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import AuthenticatedImage from '@/components/authenticated-image'
import AuthenticatedVideo from '@/components/authenticated-video'

const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg|mov)$/i

interface RequestPhotoViewerProps {
  photos: string[]
  index: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

export default function RequestPhotoViewer({
  photos,
  index,
  open,
  onClose,
  onIndexChange,
}: RequestPhotoViewerProps) {
  if (photos.length === 0) return null

  const current = photos[index]
  const isVideo = VIDEO_EXTENSION_RE.test(current)

  const goPrev = () => onIndexChange((index - 1 + photos.length) % photos.length)
  const goNext = () => onIndexChange((index + 1) % photos.length)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-w-4xl flex-col items-center gap-4 bg-black p-4 sm:max-w-4xl" showCloseButton>
        <DialogTitle className="sr-only">
          Request photo {index + 1} of {photos.length}
        </DialogTitle>
        <div className="relative flex w-full items-center justify-center">
          {photos.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex max-h-[80vh] w-full items-center justify-center">
            {isVideo ? (
              <AuthenticatedVideo
                src={current}
                className="max-h-[80vh] w-auto max-w-full object-contain"
                controls
              />
            ) : (
              <AuthenticatedImage
                src={current}
                alt={`Request photo ${index + 1}`}
                className="max-h-[80vh] w-auto max-w-full object-contain"
              />
            )}
          </div>
          {photos.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
        {photos.length > 1 && (
          <p className="text-sm text-gray-300">
            {index + 1} / {photos.length}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
