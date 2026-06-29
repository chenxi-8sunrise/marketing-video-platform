import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { GeneratedAsset, MarketingType } from "@/lib/types";
import type { RenderProps } from "@/lib/renderVideo";

const palettes: Record<MarketingType, { bg: string; accent: string; accent2: string; text: string }> = {
  product_launch: { bg: "#071b1a", accent: "#2dd4bf", accent2: "#60a5fa", text: "#ecfeff" },
  pain_point: { bg: "#170f12", accent: "#fb7185", accent2: "#f59e0b", text: "#fff7ed" },
  limited_offer: { bg: "#180f1d", accent: "#f472b6", accent2: "#facc15", text: "#fff7ed" },
  brand_story: { bg: "#0f1220", accent: "#a78bfa", accent2: "#22d3ee", text: "#eef2ff" },
  event_invite: { bg: "#0b1324", accent: "#60a5fa", accent2: "#34d399", text: "#eff6ff" }
};

function imageAssets(assets: GeneratedAsset[]) {
  return assets.filter((asset) => asset.type === "image");
}

function assetForIndex(assets: GeneratedAsset[], index: number) {
  const images = imageAssets(assets);
  if (images.length === 0) return undefined;
  return images[index % images.length];
}

function fitHeadline(text: string) {
  if (text.length > 20) return 54;
  if (text.length > 14) return 64;
  return 76;
}

function fitSubtitle(text: string) {
  if (text.length > 34) return 29;
  if (text.length > 22) return 33;
  return 36;
}

export function MarketingVideo({ input, script, assets }: RenderProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07090d", fontFamily: "Inter, Arial, sans-serif" }}>
      {script.scenes.map((scene, index) => {
        const from = Math.round(scene.start * 30);
        const duration = Math.round((scene.end - scene.start) * 30);
        const image = assetForIndex(assets, index);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration}>
            <SceneFrame
              index={index}
              marketingType={input.marketingType}
              productName={input.productName}
              headline={scene.headline}
              subtitle={scene.subtitle}
              imagePath={image?.path}
              cta={index === script.scenes.length - 1 ? script.cta : undefined}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

type SceneFrameProps = {
  index: number;
  marketingType: MarketingType;
  productName: string;
  headline: string;
  subtitle: string;
  imagePath?: string;
  cta?: string;
};

function SceneFrame({ index, marketingType, productName, headline, subtitle, imagePath, cta }: SceneFrameProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = palettes[marketingType];
  const intro = spring({ frame, fps, config: { damping: 20, stiffness: 92 } });
  const slow = interpolate(frame, [0, 4 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fade = interpolate(intro, [0, 1], [0, 1]);
  const lift = interpolate(intro, [0, 1], [38, 0]);
  const imageScale = interpolate(frame, [0, 4 * fps], [1.04, 1.12], { extrapolateRight: "clamp" });
  const imageY = interpolate(intro, [0, 1], [46, 0]);
  const lineShift = interpolate(frame, [0, 4 * fps], [-80, 80], { extrapolateRight: "clamp" });

  const headlineSize = fitHeadline(headline);
  const subtitleSize = fitSubtitle(subtitle);

  const sceneTitleStyle: React.CSSProperties = {
    color: palette.text,
    fontSize: headlineSize,
    lineHeight: 1.04,
    margin: 0,
    fontWeight: 950,
    letterSpacing: 0,
    overflowWrap: "anywhere",
    textShadow: "0 16px 42px rgba(0,0,0,0.35)"
  };

  const subtitleStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.78)",
    fontSize: subtitleSize,
    lineHeight: 1.25,
    margin: 0,
    fontWeight: 750,
    overflowWrap: "anywhere"
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: palette.bg }}>
      <AbsoluteFill style={{ background: `linear-gradient(155deg, ${palette.bg} 0%, #0b0f16 48%, #050608 100%)` }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.22, backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "78px 78px" }} />
      <div style={{ position: "absolute", left: -120, right: -120, top: 230, height: 2, background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)`, transform: `translateX(${lineShift}px)`, opacity: 0.44 }} />
      <div style={{ position: "absolute", left: -160, right: -160, bottom: 300, height: 2, background: `linear-gradient(90deg, transparent, ${palette.accent2}, transparent)`, transform: `translateX(${-lineShift}px)`, opacity: 0.28 }} />

      <div style={{ position: "absolute", top: 62, left: 62, right: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, opacity: fade }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <div style={{ width: 12, height: 34, borderRadius: 8, background: `linear-gradient(180deg, ${palette.accent}, ${palette.accent2})` }} />
          <div style={{ color: "white", fontSize: 30, lineHeight: 1.2, fontWeight: 900, overflowWrap: "anywhere" }}>{productName}</div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 20, fontWeight: 850 }}>15s</div>
      </div>

      {index === 0 ? (
        <HeroLayout imagePath={imagePath} imageScale={imageScale} imageY={imageY} opacity={fade} accent={palette.accent} accent2={palette.accent2} headline={headline} subtitle={subtitle} titleStyle={sceneTitleStyle} subtitleStyle={subtitleStyle} lift={lift} />
      ) : index === 1 ? (
        <FeatureLayout imagePath={imagePath} imageScale={imageScale} imageY={imageY} opacity={fade} accent={palette.accent} accent2={palette.accent2} headline={headline} subtitle={subtitle} titleStyle={sceneTitleStyle} subtitleStyle={subtitleStyle} lift={lift} progress={slow} />
      ) : index === 2 ? (
        <ProofLayout imagePath={imagePath} imageScale={imageScale} imageY={imageY} opacity={fade} accent={palette.accent} accent2={palette.accent2} headline={headline} subtitle={subtitle} titleStyle={sceneTitleStyle} subtitleStyle={subtitleStyle} lift={lift} progress={slow} />
      ) : (
        <CtaLayout imagePath={imagePath} imageScale={imageScale} imageY={imageY} opacity={fade} accent={palette.accent} accent2={palette.accent2} headline={headline} subtitle={subtitle} titleStyle={sceneTitleStyle} subtitleStyle={subtitleStyle} lift={lift} cta={cta} />
      )}
    </AbsoluteFill>
  );
}

type LayoutProps = {
  imagePath?: string;
  imageScale: number;
  imageY: number;
  opacity: number;
  accent: string;
  accent2: string;
  headline: string;
  subtitle: string;
  titleStyle: React.CSSProperties;
  subtitleStyle: React.CSSProperties;
  lift: number;
  progress?: number;
  cta?: string;
};

function ProductVisual({ imagePath, imageScale, imageY, opacity, accent, mode = "large" }: Pick<LayoutProps, "imagePath" | "imageScale" | "imageY" | "opacity" | "accent"> & { mode?: "large" | "compact" }) {
  const width = mode === "large" ? 820 : 660;
  const height = mode === "large" ? 660 : 500;
  const left = (1080 - width) / 2;
  return (
    <div style={{ position: "absolute", left, top: mode === "large" ? 360 : 470, width, height, opacity, transform: `translateY(${imageY}px)`, borderRadius: 8, padding: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 34px 90px rgba(0,0,0,0.45)" }}>
      <div style={{ position: "absolute", left: 26, top: 26, right: 26, height: 42, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ width: 13, height: 13, borderRadius: 8, background: accent }} />
        <span style={{ width: 13, height: 13, borderRadius: 8, background: "rgba(255,255,255,0.30)" }} />
        <span style={{ width: 13, height: 13, borderRadius: 8, background: "rgba(255,255,255,0.18)" }} />
      </div>
      <div style={{ position: "absolute", left: 26, right: 26, top: 78, bottom: 26, overflow: "hidden", borderRadius: 8, background: "#11151d" }}>
        {imagePath ? (
          <Img src={staticFile(imagePath)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${imageScale})` }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "rgba(255,255,255,0.52)", fontSize: 32, fontWeight: 900 }}>Asset</div>
        )}
      </div>
    </div>
  );
}

function HeroLayout(props: LayoutProps) {
  return (
    <>
      <ProductVisual imagePath={props.imagePath} imageScale={props.imageScale} imageY={props.imageY} opacity={props.opacity} accent={props.accent} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 1110, display: "grid", gap: 24, transform: `translateY(${props.lift}px)`, opacity: props.opacity }}>
        <div style={{ width: 92, height: 8, borderRadius: 8, background: props.accent }} />
        <h1 style={props.titleStyle}>{props.headline}</h1>
        <p style={props.subtitleStyle}>{props.subtitle}</p>
      </div>
    </>
  );
}

function FeatureLayout(props: LayoutProps) {
  const progressWidth = `${Math.round((props.progress ?? 0) * 100)}%`;
  return (
    <>
      <div style={{ position: "absolute", left: 62, right: 62, top: 250, display: "grid", gap: 20, transform: `translateY(${props.lift}px)`, opacity: props.opacity }}>
        <h1 style={props.titleStyle}>{props.headline}</h1>
        <p style={props.subtitleStyle}>{props.subtitle}</p>
      </div>
      <ProductVisual imagePath={props.imagePath} imageScale={props.imageScale} imageY={props.imageY} opacity={props.opacity} accent={props.accent} mode="compact" />
      <div style={{ position: "absolute", left: 108, right: 108, bottom: 270, borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", padding: 24, opacity: props.opacity }}>
        <div style={{ color: "rgba(255,255,255,0.66)", fontSize: 24, fontWeight: 850, marginBottom: 16 }}>自动成片进度</div>
        <div style={{ height: 14, borderRadius: 8, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: progressWidth, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${props.accent}, ${props.accent2})` }} />
        </div>
      </div>
    </>
  );
}

function ProofLayout(props: LayoutProps) {
  const shift = Math.round(((props.progress ?? 0) - 0.5) * 38);
  return (
    <>
      <div style={{ position: "absolute", left: 82, right: 82, top: 280, height: 690, opacity: props.opacity }}>
        <ProductVisual imagePath={props.imagePath} imageScale={props.imageScale} imageY={props.imageY} opacity={props.opacity} accent={props.accent2} mode="compact" />
        <div style={{ position: "absolute", left: 22 + shift, right: 84 - shift, top: 528, borderRadius: 8, padding: 28, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 24px 60px rgba(0,0,0,0.26)" }}>
          <div style={{ color: props.accent2, fontSize: 24, fontWeight: 950, marginBottom: 8 }}>Key benefit</div>
          <div style={{ color: "white", fontSize: 34, lineHeight: 1.18, fontWeight: 900, overflowWrap: "anywhere" }}>{props.headline}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 250, display: "grid", gap: 22, transform: `translateY(${props.lift}px)`, opacity: props.opacity }}>
        <p style={props.subtitleStyle}>{props.subtitle}</p>
      </div>
    </>
  );
}

function CtaLayout(props: LayoutProps) {
  return (
    <>
      <ProductVisual imagePath={props.imagePath} imageScale={props.imageScale} imageY={props.imageY} opacity={props.opacity * 0.82} accent={props.accent} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,6,8,0.18), rgba(5,6,8,0.72) 68%, rgba(5,6,8,0.92))" }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 760, display: "grid", gap: 24, transform: `translateY(${props.lift}px)`, opacity: props.opacity }}>
        <h1 style={{ ...props.titleStyle, fontSize: Math.max(props.titleStyle.fontSize as number, 74) }}>{props.headline}</h1>
        <p style={props.subtitleStyle}>{props.subtitle}</p>
        {props.cta ? (
          <div style={{ marginTop: 18, width: "fit-content", borderRadius: 8, padding: "24px 32px", background: `linear-gradient(135deg, ${props.accent}, ${props.accent2})`, color: "#06100f", fontSize: 34, fontWeight: 950 }}>
            {props.cta}
          </div>
        ) : null}
      </div>
    </>
  );
}