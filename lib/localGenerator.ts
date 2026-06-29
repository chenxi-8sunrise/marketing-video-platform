import type { MarketingScript, MarketingType, ProductInput } from "./types";

const labels: Record<MarketingType, string> = {
  product_launch: "新品发布",
  pain_point: "痛点转化",
  limited_offer: "限时促销",
  brand_story: "品牌种草",
  event_invite: "活动招募"
};

function point(input: ProductInput, index: number) {
  return input.sellingPoints[index] || input.sellingPoints[0] || "核心优势";
}

function audience(input: ProductInput) {
  return input.targetAudience || "目标用户";
}

export function marketingTypeLabel(type: MarketingType) {
  return labels[type];
}

export function generateLocalMarketingScript(input: ProductInput): MarketingScript {
  const product = input.productName.trim();
  const p0 = point(input, 0);
  const p1 = point(input, 1);
  const p2 = point(input, 2);
  const target = audience(input);
  const typeLabel = marketingTypeLabel(input.marketingType);

  const templates: Record<MarketingType, MarketingScript> = {
    product_launch: {
      title: `${product} 新品发布`,
      hook: `${product}，为${target}而来`,
      cta: "立即了解",
      totalDurationSeconds: 15,
      scenes: [
        scene("scene-1", 0, 3, `${product}来了`, `专为${target}打造`),
        scene("scene-2", 3, 7, p0, "把复杂工作变简单"),
        scene("scene-3", 7, 11, p1, p2),
        scene("scene-4", 11, 15, "现在开始", "让每一步更高效")
      ]
    },
    pain_point: {
      title: `${product} 痛点解决方案`,
      hook: `${target}，还在被低效拖慢吗？`,
      cta: "马上试试",
      totalDurationSeconds: 15,
      scenes: [
        scene("scene-1", 0, 3, "还在手动处理？", `${target}每天都在浪费时间`),
        scene("scene-2", 3, 7, product, `用${p0}解决关键痛点`),
        scene("scene-3", 7, 11, p1, `再加上${p2}`),
        scene("scene-4", 11, 15, "少一点重复", "多一点真正的增长")
      ]
    },
    limited_offer: {
      title: `${product} 限时促销`,
      hook: `${product} 限时开启`,
      cta: "立即行动",
      totalDurationSeconds: 15,
      scenes: [
        scene("scene-1", 0, 3, "限时开启", `${product} 正在开放体验`),
        scene("scene-2", 3, 7, p0, `适合${target}`),
        scene("scene-3", 7, 11, p1, p2),
        scene("scene-4", 11, 15, "别错过", "现在就把效率拉满")
      ]
    },
    brand_story: {
      title: `${product} 品牌种草`,
      hook: `让${target}记住${product}`,
      cta: "收藏并体验",
      totalDurationSeconds: 15,
      scenes: [
        scene("scene-1", 0, 3, "真正好用", "不是多做一步，而是少走弯路"),
        scene("scene-2", 3, 7, product, p0),
        scene("scene-3", 7, 11, p1, `为${target}保持清爽体验`),
        scene("scene-4", 11, 15, "值得一试", p2)
      ]
    },
    event_invite: {
      title: `${product} 活动招募`,
      hook: `${target}，这次别错过`,
      cta: "立即报名",
      totalDurationSeconds: 15,
      scenes: [
        scene("scene-1", 0, 3, "活动开启", `${product} 邀请${target}`),
        scene("scene-2", 3, 7, p0, "现场快速理解核心价值"),
        scene("scene-3", 7, 11, p1, p2),
        scene("scene-4", 11, 15, "席位有限", "现在报名参与")
      ]
    }
  };

  const script = templates[input.marketingType];
  return {
    ...script,
    title: `${script.title} - ${typeLabel}`,
    scenes: script.scenes.map((item) => ({
      ...item,
      voiceover: `${item.headline}。${item.subtitle}。`,
      visualDirection: `${typeLabel}风格，${input.styleKeywords.join("、")}`,
      imagePrompt: "local-template",
      videoPrompt: "local-template"
    }))
  };
}

function scene(id: string, start: number, end: number, headline: string, subtitle: string) {
  return {
    id,
    start,
    end,
    headline,
    subtitle,
    voiceover: "",
    visualDirection: "",
    imagePrompt: "",
    videoPrompt: ""
  };
}
