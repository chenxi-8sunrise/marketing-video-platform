import { NextRequest, NextResponse } from "next/server";
import { readJob } from "@/lib/storage";

export const runtime = "nodejs";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const job = await readJob(context.params.id);
  if (!job) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }
  return NextResponse.json(job);
}
