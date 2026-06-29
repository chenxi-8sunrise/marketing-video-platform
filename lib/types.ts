export type AspectRatio = "9:16";

export type MarketingType = "product_launch" | "pain_point" | "limited_offer" | "brand_story" | "event_invite";

export type ProductInput = {
  marketingType: MarketingType;
  productName: string;
  sellingPoints: string[];
  targetAudience: string;
  styleKeywords: string[];
  aspectRatio: AspectRatio;
};

export type MarketingScene = {
  id: string;
  start: number;
  end: number;
  headline: string;
  subtitle: string;
  voiceover: string;
  visualDirection: string;
  imagePrompt: string;
  videoPrompt: string;
};

export type MarketingScript = {
  title: string;
  hook: string;
  cta: string;
  totalDurationSeconds: 15;
  scenes: MarketingScene[];
};

export type GeneratedAsset = {
  sceneId: string;
  type: "image" | "video";
  path: string;
  publicUrl: string;
};

export type VideoJobStatus = "queued" | "generating" | "rendering" | "done" | "failed";

export type VideoJob = {
  id: string;
  status: VideoJobStatus;
  message: string;
  input: ProductInput;
  script?: MarketingScript;
  assets?: GeneratedAsset[];
  outputUrl?: string;
  outputPath?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};