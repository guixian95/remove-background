"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles, ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react"
import { uploadImage } from "@/app/actions/upload"
import { processImage } from "@/app/actions/process"
import { toast } from "sonner"

interface UploadedImage {
  id: string
  url: string
  fileName: string
}

export function Hero() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadImage(formData)
      setUploadedImage(result)
      toast.success("上传成功")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "上传失败")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleProcess = useCallback(async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    try {
      const result = await processImage(uploadedImage.id)
      toast.success("抠图完成")
      router.push(`/dashboard?image=${uploadedImage.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "处理失败")
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedImage, router])

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI 驱动 · 秒级处理</span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            一键智能抠图
            <br />
            <span className="text-primary">释放创意无限可能</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            专业级 AI 抠图工具，自动识别主体，精准移除背景。无论是人像、商品还是复杂场景，都能轻松处理。
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group bg-primary text-primary-foreground hover:bg-primary/90">
              立即开始
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary">
              查看演示
            </Button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative mx-auto aspect-video max-w-md overflow-hidden rounded-lg">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                {isUploading ? (
                  <Button disabled className="bg-primary text-primary-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    上传中...
                  </Button>
                ) : uploadedImage ? (
                  <Button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        开始抠图
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Upload className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  拖放图片到此处
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  或点击选择文件上传
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    支持 JPG, PNG, WebP
                  </span>
                  <span>最大 10MB</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: "500万+", label: "处理图片数" },
            { value: "98%", label: "用户满意度" },
            { value: "3秒", label: "平均处理速度" },
            { value: "50万+", label: "活跃用户" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
