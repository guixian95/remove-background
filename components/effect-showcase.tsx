"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const showcaseItems = [
  {
    id: 1,
    category: "人像",
    title: "人像抠图",
    description: "精准识别人物边缘，发丝级别细节处理",
    beforeBg: "bg-gradient-to-br from-blue-500/30 to-cyan-500/30",
    afterBg: "bg-[repeating-conic-gradient(#1a1a2e_0_25%,#16213e_0_50%)]",
  },
  {
    id: 2,
    category: "商品",
    title: "商品抠图",
    description: "电商必备，快速生成纯净背景商品图",
    beforeBg: "bg-gradient-to-br from-orange-500/30 to-red-500/30",
    afterBg: "bg-[repeating-conic-gradient(#1a1a2e_0_25%,#16213e_0_50%)]",
  },
  {
    id: 3,
    category: "动物",
    title: "宠物抠图",
    description: "智能识别毛发细节，还原自然边缘",
    beforeBg: "bg-gradient-to-br from-green-500/30 to-emerald-500/30",
    afterBg: "bg-[repeating-conic-gradient(#1a1a2e_0_25%,#16213e_0_50%)]",
  },
]

export function EffectShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)

  return (
    <section id="showcase" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            效果展示
          </Badge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            看看 AI 抠图的魔力
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            拖动滑块，对比原图与抠图效果。无论什么类型的图片，都能精准处理。
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-12 flex justify-center gap-2">
          {showcaseItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-all",
                activeIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {item.category}
            </button>
          ))}
        </div>

        {/* Comparison Slider */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-card">
            {/* Before Image */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                showcaseItems[activeIndex].beforeBg
              )}
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm">
                <span className="text-4xl">
                  {activeIndex === 0 ? "👤" : activeIndex === 1 ? "📦" : "🐕"}
                </span>
              </div>
              <span className="absolute left-4 top-4 rounded bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur-sm">
                原图
              </span>
            </div>

            {/* After Image */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-[length:20px_20px]"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                backgroundColor: "#1a1a2e",
                backgroundImage:
                  "linear-gradient(45deg, #16213e 25%, transparent 25%), linear-gradient(-45deg, #16213e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #16213e 75%), linear-gradient(-45deg, transparent 75%, #16213e 75%)",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <span className="text-4xl">
                  {activeIndex === 0 ? "👤" : activeIndex === 1 ? "📦" : "🐕"}
                </span>
              </div>
              <span className="absolute right-4 top-4 rounded bg-primary/80 px-2 py-1 text-xs text-primary-foreground backdrop-blur-sm">
                抠图后
              </span>
            </div>

            {/* Slider */}
            <div
              className="absolute inset-y-0 w-1 bg-primary"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-primary bg-background">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </div>
            </div>

            {/* Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 cursor-ew-resize opacity-0"
            />
          </div>

          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold text-foreground">
              {showcaseItems[activeIndex].title}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {showcaseItems[activeIndex].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
