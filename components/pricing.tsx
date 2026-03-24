"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "免费版",
    description: "适合个人用户体验",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "每月 10 张免费额度",
      "标准画质输出",
      "基础抠图功能",
      "支持 JPG/PNG 格式",
    ],
    cta: "免费开始",
    popular: false,
  },
  {
    name: "专业版",
    description: "适合设计师和小团队",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "每月 500 张额度",
      "高清画质输出",
      "高级抠图算法",
      "批量处理功能",
      "背景替换模板",
      "优先客服支持",
    ],
    cta: "升级专业版",
    popular: true,
  },
  {
    name: "企业版",
    description: "适合大型团队和企业",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "无限处理额度",
      "最高画质输出",
      "API 接口访问",
      "团队协作功能",
      "定制化服务",
      "专属客户经理",
      "SLA 服务保障",
    ],
    cta: "联系销售",
    popular: false,
  },
]

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            价格方案
          </Badge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            选择适合您的方案
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            灵活的定价方案，满足不同规模的需求。年付享受额外优惠。
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={cn("text-sm", !isYearly ? "text-foreground" : "text-muted-foreground")}>
              月付
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn("text-sm", isYearly ? "text-foreground" : "text-muted-foreground")}>
              年付
              <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20">
                省17%
              </Badge>
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col border-border bg-card transition-all",
                plan.popular && "border-primary ring-1 ring-primary"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  推荐
                </Badge>
              )}
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ¥{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{isYearly ? "年" : "月"}
                  </span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                需要更多定制化服务？
              </h3>
              <p className="mt-2 text-muted-foreground">
                我们提供企业级定制方案，包括私有化部署、API 集成等服务。
              </p>
            </div>
            <Button size="lg" variant="outline" className="shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              联系我们
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
