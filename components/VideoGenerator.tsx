"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { MarketingType, VideoJob } from "@/lib/types";

const marketingTypes: Array<{ value: MarketingType; label: string }> = [
  { value: "product_launch", label: "新品发布" },
  { value: "pain_point", label: "痛点转化" },
  { value: "limited_offer", label: "限时促销" },
  { value: "brand_story", label: "品牌种草" },
  { value: "event_invite", label: "活动招募" }
];

const initialForm = {
  marketingType: "pain_point" as MarketingType,
  productName: "FlowNote AI",
  sellingPoints: "自动整理会议纪要\n提炼待办事项\n一键生成客户跟进邮件",
  targetAudience: "需要频繁开会和跟进客户的销售团队",
  styleKeywords: "高效、专业、清爽、科技感"
};

const statusLabels: Record<VideoJob["status"] | "idle", string> = {
  idle: "未开始",
  queued: "排队中",
  generating: "生成文案",
  rendering: "合成视频",
  done: "已完成",
  failed: "失败"
};

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type AssetPreview = {
  name: string;
  url: string;
};

function lines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function keywords(value: string) {
  return value.split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean);
}

export function VideoGenerator() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<AssetPreview[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<VideoJob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRunning = useMemo(() => {
    return job?.status === "queued" || job?.status === "generating" || job?.status === "rendering";
  }, [job?.status]);

  useEffect(() => {
    const next = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setPreviews(next);

    return () => {
      for (const item of next) URL.revokeObjectURL(item.url);
    };
  }, [files]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/videos/${jobId}`, { cache: "no-store" });
        const data = (await res.json()) as VideoJob | { error: string };
        if (!res.ok) throw new Error("error" in data ? data.error : "查询任务失败");
        if (!cancelled) setJob(data as VideoJob);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "查询任务失败");
      }
    }

    poll();
    const timer = window.setInterval(poll, 1200);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [jobId]);

  function updateFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;

    const invalid = selected.find((file) => !allowedTypes.has(file.type));
    if (invalid) {
      setError("素材只支持 JPG、PNG、WebP 图片。");
      return;
    }

    const nextFiles = [...files, ...selected];
    if (nextFiles.length > 3) {
      setError("最多只能上传 3 张图片素材，请先移除多余图片。");
      return;
    }

    setFiles(nextFiles);
    setError(null);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (files.length < 1 || files.length > 3) {
      setError("请先上传 1-3 张图片素材。");
      return;
    }

    setSubmitting(true);
    setJob(null);
    setJobId(null);

    try {
      const formData = new FormData();
      formData.append("marketingType", form.marketingType);
      formData.append("productName", form.productName);
      formData.append("sellingPoints", JSON.stringify(lines(form.sellingPoints)));
      formData.append("targetAudience", form.targetAudience);
      formData.append("styleKeywords", JSON.stringify(keywords(form.styleKeywords)));
      formData.append("aspectRatio", "9:16");
      for (const file of files) formData.append("assets", file);

      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData
      });
      const data = (await res.json()) as VideoJob | { error: string };
      if (!res.ok) throw new Error("error" in data ? data.error : "创建任务失败");
      const nextJob = data as VideoJob;
      setJob(nextJob);
      setJobId(nextJob.status === "done" || nextJob.status === "failed" ? null : nextJob.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建任务失败");
    } finally {
      setSubmitting(false);
    }
  }

  const currentStatus = job?.status ?? "idle";
  const canGenerate = !submitting && !isRunning;

  return (
    <main className="studio-page">
      <header className="studio-topbar">
        <div className="brand-lockup">
          <span className="brand-mark">AI</span>
          <h1>营销视频工作台</h1>
        </div>

      </header>

      <section className="studio-grid">
        <aside className="creator-panel">
          <form className="creator-form" onSubmit={submit}>
            <div className="panel-heading">
              <span>Brief</span>
              <strong>营销信息</strong>
            </div>

            <div className="field">
              <label>营销类型</label>
              <div className="type-grid" role="radiogroup" aria-label="营销类型">
                {marketingTypes.map((item) => (
                  <button
                    aria-pressed={form.marketingType === item.value}
                    className={form.marketingType === item.value ? "type-option active" : "type-option"}
                    key={item.value}
                    onClick={() => setForm({ ...form, marketingType: item.value })}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="productName">产品名称</label>
              <input id="productName" value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} required />
            </div>

            <div className="field">
              <label htmlFor="sellingPoints">产品卖点</label>
              <textarea id="sellingPoints" value={form.sellingPoints} onChange={(event) => setForm({ ...form, sellingPoints: event.target.value })} required />
            </div>

            <div className="field">
              <label htmlFor="targetAudience">目标人群</label>
              <input id="targetAudience" value={form.targetAudience} onChange={(event) => setForm({ ...form, targetAudience: event.target.value })} required />
            </div>

            <div className="field">
              <label htmlFor="styleKeywords">风格关键词</label>
              <input id="styleKeywords" value={form.styleKeywords} onChange={(event) => setForm({ ...form, styleKeywords: event.target.value })} required />
            </div>

            <div className="field">
              <label htmlFor="assetUpload">素材图片</label>
              <div className="asset-upload">
                <input id="assetUpload" accept="image/jpeg,image/png,image/webp" multiple onChange={updateFiles} type="file" />
                <label className="asset-upload-button" htmlFor="assetUpload">
                  <span>选择图片</span>
                  <strong>{files.length}/3</strong>
                </label>
              </div>
              <div className="asset-list">
                {previews.length > 0 ? previews.map((item, index) => (
                  <article className="asset-item" key={item.url}>
                    <img alt={item.name} src={item.url} />
                    <span>{item.name}</span>
                    <button aria-label={`移除 ${item.name}`} onClick={() => removeFile(index)} type="button">移除</button>
                  </article>
                )) : [0, 1, 2].map((item) => <div className="asset-slot" key={item} />)}
              </div>
            </div>

            {error ? <div className="error">{error}</div> : null}

            <button className="primary" disabled={!canGenerate} type="submit">
              {submitting || isRunning ? "生成中" : "生成视频"}
            </button>
          </form>
        </aside>

        <section className="preview-panel">
          <div className="preview-head">
            <span>Preview</span>
            <strong>{statusLabels[currentStatus]}</strong>
          </div>
          <div className="phone-shell">
            {job?.outputUrl ? (
              <video controls src={job.outputUrl} />
            ) : (
              <div className="draft-video">
                <div className="draft-brand">{form.productName || "Product"}</div>
                <div className="draft-media-stack">
                  {previews.length > 0 ? previews.map((item, index) => (
                    <img alt={item.name} key={item.url} src={item.url} style={{ transform: `translate(${index * 20}px, ${index * 18}px)` }} />
                  )) : <div className="draft-empty" />}
                </div>
                <div className="draft-copy">
                  <strong>{lines(form.sellingPoints)[0] ?? "核心卖点"}</strong>
                  <span>{form.targetAudience || "目标人群"}</span>
                </div>
              </div>
            )}
          </div>
          {job?.outputUrl ? (
            <div className="preview-actions">
              <a href={job.outputUrl} download>下载 MP4</a>
              <a href={`/api/videos/${job.id}`} target="_blank">任务 JSON</a>
            </div>
          ) : null}
        </section>

        <aside className="insight-panel">
          <div className="panel-heading">
            <span>Status</span>
            <strong>任务状态</strong>
          </div>
          <div className={`status-pill ${currentStatus}`}>{statusLabels[currentStatus]}</div>
          {job?.message ? <div className="job-message">{job.message}</div> : null}
          {job?.error ? <div className="error">{job.error}</div> : null}

          {job?.script ? (
            <div className="script-output">
              <article className="script-card hook-card">
                <span>Hook</span>
                <strong>{job.script.hook}</strong>
              </article>
              {job.script.scenes.map((scene, index) => (
                <article className="script-card" key={scene.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{scene.headline}</strong>
                  <p>{scene.subtitle}</p>
                </article>
              ))}
              <article className="script-card cta-card">
                <span>CTA</span>
                <strong>{job.script.cta}</strong>
              </article>
            </div>
          ) : (
            <div className="script-placeholder">
              <span>Script</span>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}