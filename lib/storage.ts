import { promises as fs } from "node:fs";
import path from "node:path";
import type { VideoJob } from "./types";

const root = process.cwd();
const jobsDir = path.join(root, "data", "jobs");

export function jobDir(id: string) {
  return path.join(jobsDir, id);
}

export function generatedDir(id: string) {
  return path.join(root, "public", "generated", id);
}

export function rendersDir() {
  return path.join(root, "public", "renders");
}

export function jobFile(id: string) {
  return path.join(jobDir(id), "job.json");
}

export async function ensureJobFolders(id: string) {
  await fs.mkdir(jobDir(id), { recursive: true });
  await fs.mkdir(generatedDir(id), { recursive: true });
  await fs.mkdir(rendersDir(), { recursive: true });
}

export async function saveJob(job: VideoJob) {
  await ensureJobFolders(job.id);
  job.updatedAt = new Date().toISOString();
  await fs.writeFile(jobFile(job.id), JSON.stringify(job, null, 2), "utf8");
}

export async function readJob(id: string): Promise<VideoJob | null> {
  try {
    const raw = await fs.readFile(jobFile(id), "utf8");
    return JSON.parse(raw) as VideoJob;
  } catch {
    return null;
  }
}

export async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}
