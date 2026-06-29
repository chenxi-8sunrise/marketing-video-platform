import { Composition } from "remotion";
import { MarketingVideo } from "./MarketingVideo";
import type { RenderProps } from "@/lib/renderVideo";

const emptyProps: RenderProps = {
  input: {
    marketingType: "pain_point",
    productName: "Demo Product",
    sellingPoints: ["Clear value", "Fast result", "Made for teams"],
    targetAudience: "busy teams",
    styleKeywords: ["clean", "modern"],
    aspectRatio: "9:16"
  },
  script: {
    title: "Demo Product",
    hook: "A better way to work.",
    cta: "Start today.",
    totalDurationSeconds: 15,
    scenes: [
      { id: "scene-1", start: 0, end: 3, headline: "Demo Product", subtitle: "A better way to work", voiceover: "", visualDirection: "", imagePrompt: "", videoPrompt: "" },
      { id: "scene-2", start: 3, end: 7, headline: "Less manual work", subtitle: "More time for customers", voiceover: "", visualDirection: "", imagePrompt: "", videoPrompt: "" },
      { id: "scene-3", start: 7, end: 11, headline: "Built for focus", subtitle: "Every step stays clear", voiceover: "", visualDirection: "", imagePrompt: "", videoPrompt: "" },
      { id: "scene-4", start: 11, end: 15, headline: "Try it now", subtitle: "Turn ideas into results", voiceover: "", visualDirection: "", imagePrompt: "", videoPrompt: "" }
    ]
  },
  assets: []
};

export default function RemotionRoot() {
  return (
    <Composition
      id="MarketingVideo"
      component={MarketingVideo}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={emptyProps}
    />
  );
}
