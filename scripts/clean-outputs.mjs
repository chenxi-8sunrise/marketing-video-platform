import { rm, mkdir } from "node:fs/promises";

for (const dir of ["data/jobs", "public/generated", "public/renders"]) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

console.log("Cleaned generated outputs.");
