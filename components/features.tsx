import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Zap,
  Sparkles,
  Layers,
  Download,
  Palette,
  Shield,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "秒级处理",
    description: "强大的 AI 模型，3秒内完成复杂图片的抠图处理",
  },
  {
    icon: Sparkles,
    title: "智能识别",
    description: "自动识别主体边缘，发丝、毛发等细节精准处理",
  },
  {
    icon: Layers,
    title: "批量处理",
    description: "支持批量上传，一次处理多张图片，提升工作效率",
  },
  {
    icon: Download,
    title: "多格式导出",
    description: "支持 PNG、JPG、WebP 等多种格式，满足不同需求",
  },
  {
    icon: Palette,
    title: "背景替换",
    description: "内置海量背景模板，一键替换，创意无限",
  },
  {
    icon: Shield,
    title: "隐私保护",
    description: "所有图片处理完成后自动删除，保障数据安全",
  },
]

export function Features() {
  return (
    <section id="features" className="bg-secondary/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            功能特性
          </Badge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            为什么选择 CutOut AI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            我们提供业界领先的 AI 抠图技术，让图片处理变得简单高效。
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border bg-card transition-all hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
