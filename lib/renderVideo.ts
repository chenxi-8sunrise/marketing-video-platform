import { spawn } from "node:child_process";
import path from "node:path";
import type { GeneratedAsset, MarketingScript, ProductInput } from "./types";
import { jobDir, rendersDir, writeJson } from "./storage";

export type RenderProps = {
  input: ProductInput;
  script: MarketingScript;
  assets: GeneratedAsset[];
};

export async function renderMarketingVideo(jobId: string, props: RenderProps) {
  const propsPath = path.join(jobDir(jobId), "remotion-props.json");
  const outputName = `${jobId}.mp4`;
  const outputPath = path.join(rendersDir(), outputName);
  await writeJson(propsPath, props);

  await runCommand(process.platform === "win32" ? "npx.cmd" : "npx", [
    "remotion",
    "render",
    "remotion/index.tsx",
    "MarketingVideo",
    outputPath,
    `--props=${propsPath}`,
    "--overwrite",
    "--codec=h264",
    "--pixel-format=yuv420p"
  ]);

  return {
    outputPath,
    outputUrl: `/renders/${outputName}`
  };
}

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `Render command failed with exit code ${code}`));
    });
  });
}

