import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const propsPath = path.join(root, "public", "sample-props.json");
const outputPath = path.join(root, "public", "renders", "sample.mp4");

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = [
  "remotion",
  "render",
  "remotion/index.tsx",
  "MarketingVideo",
  outputPath,
  `--props=${propsPath}`,
  "--overwrite",
  "--codec=h264",
  "--pixel-format=yuv420p"
];

const child = spawn(command, args, { cwd: root, stdio: "inherit", windowsHide: true });
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

