import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createJob, runPipeline } from "@/lib/pipeline";
import { ensureJobFolders, generatedDir, saveJob } from "@/lib/storage";
import type { GeneratedAsset } from "@/lib/types";

export const runtime = "nodejs";

const InputSchema = z.object({
  marketingType: z.enum(["product_launch", "pain_point", "limited_offer", "brand_story", "event_invite"]),
  productName: z.string().min(1),
  sellingPoints: z.array(z.string().min(1)).min(1),
  targetAudience: z.string().min(1),
  styleKeywords: z.array(z.string().min(1)).min(1),
  aspectRatio: z.literal("9:16")
});

const imageExtensions: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

function stringField(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} 不能为空`);
  }
  return value.trim();
}

function stringArrayField(formData: FormData, name: string) {
  const raw = stringField(formData, name);
  const value = JSON.parse(raw) as unknown;
  if (!Array.isArray(value)) {
    throw new Error(`${name} 格式错误`);
  }
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function uploadedImageFiles(formData: FormData) {
  const files = formData.getAll("assets").filter((item): item is File => typeof item !== "string" && item.size > 0);
  if (files.length < 1 || files.length > 3) {
    throw new Error("请上传 1-3 张图片素材。");
  }

  for (const file of files) {
    if (!imageExtensions[file.type]) {
      throw new Error("素材只支持 JPG、PNG、WebP 图片。");
    }
  }

  return files;
}

async function saveUploadedImages(jobId: string, files: File[]): Promise<GeneratedAsset[]> {
  const targetDir = generatedDir(jobId);
  await fs.mkdir(targetDir, { recursive: true });

  const assets: GeneratedAsset[] = [];
  for (const [index, file] of files.entries()) {
    const extension = imageExtensions[file.type];
    const fileName = `asset-${index + 1}.${extension}`;
    const outputPath = path.join(targetDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(outputPath, buffer);

    assets.push({
      sceneId: `upload-${index + 1}`,
      type: "image",
      path: `generated/${jobId}/${fileName}`,
      publicUrl: `/generated/${jobId}/${fileName}`
    });
  }

  return assets;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      throw new Error("请使用表单提交产品信息和图片素材。");
    }

    const formData = await request.formData();
    const input = InputSchema.parse({
      marketingType: stringField(formData, "marketingType"),
      productName: stringField(formData, "productName"),
      sellingPoints: stringArrayField(formData, "sellingPoints"),
      targetAudience: stringField(formData, "targetAudience"),
      styleKeywords: stringArrayField(formData, "styleKeywords"),
      aspectRatio: stringField(formData, "aspectRatio")
    });
    const files = uploadedImageFiles(formData);

    const job = createJob(input);
    await ensureJobFolders(job.id);
    job.assets = await saveUploadedImages(job.id, files);
    await saveJob(job);

    runPipeline(job.id).catch(() => {
      // The pipeline writes its own failure state to data/jobs/<id>/job.json.
    });

    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "请求格式错误" },
      { status: 400 }
    );
  }
}