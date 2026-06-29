import type { ProductInput, VideoJob } from "./types";
import { generateLocalMarketingScript } from "./localGenerator";
import { renderMarketingVideo } from "./renderVideo";
import { ensureJobFolders, readJob, saveJob } from "./storage";

export function createJob(input: ProductInput): VideoJob {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    status: "queued",
    message: "任务已创建，等待生成。",
    input,
    createdAt: now,
    updatedAt: now
  };
}

export async function runPipeline(jobId: string) {
  const job = await readJob(jobId);
  if (!job) throw new Error("任务不存在。");

  try {
    await ensureJobFolders(job.id);

    job.status = "generating";
    job.message = "正在生成营销文案。";
    await saveJob(job);

    job.script = generateLocalMarketingScript(job.input);
    job.assets = job.assets ?? [];
    job.status = "rendering";
    job.message = "正在合成 9:16 视频。";
    await saveJob(job);

    const render = await renderMarketingVideo(job.id, {
      input: job.input,
      script: job.script,
      assets: job.assets
    });

    job.status = "done";
    job.message = "视频和文案生成完成。";
    job.outputPath = render.outputPath;
    job.outputUrl = render.outputUrl;
    await saveJob(job);
  } catch (error) {
    job.status = "failed";
    job.message = "生成失败。";
    job.error = error instanceof Error ? error.message : "未知错误";
    await saveJob(job);
  }
}