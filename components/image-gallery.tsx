'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Trash2, Loader2 } from 'lucide-react'
import { deleteImage } from '@/app/actions/process'
import { toast } from 'sonner'

interface Image {
  id: string
  original_url: string
  processed_url: string | null
  status: string
  file_name: string
  created_at: string
}

interface ImageGalleryProps {
  images: Image[]
}

export function ImageGallery({ images: initialImages }: ImageGalleryProps) {
  const [images, setImages] = useState(initialImages)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId)
    try {
      await deleteImage(imageId)
      setImages(images.filter(img => img.id !== imageId))
      toast.success('删除成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `processed_${fileName}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      toast.error('下载失败')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">已完成</Badge>
      case 'processing':
        return <Badge className="bg-blue-500">处理中</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">待处理</Badge>
      case 'failed':
        return <Badge className="bg-red-500">失败</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="border rounded-lg overflow-hidden bg-card"
        >
          <div className="aspect-video relative">
            <img
              src={image.processed_url || image.original_url}
              alt={image.file_name}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2">
              {getStatusBadge(image.status)}
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm font-medium truncate">{image.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(image.created_at).toLocaleString()}
            </p>
            <div className="flex gap-2 mt-3">
              {image.status === 'completed' && image.processed_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(image.processed_url!, image.file_name)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  下载
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
              >
                {deletingId === image.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
