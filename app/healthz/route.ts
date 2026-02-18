import { prisma } from "@/lib/prisma";
import { formatDuration } from "date-fns";

export async function GET() {
  const up = process.uptime();
  const totalSeconds = Math.floor(up);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const uptime = formatDuration(
    { days, hours, minutes, seconds },
    { delimiter: ", " }
  );

  let db: { ok: boolean; error?: string } = { ok: false };
  try {
    // simple connectivity check
    await prisma.$queryRaw`SELECT 1`;
    db.ok = true;
  } catch (err) {
    db = { ok: false, error: String(err) };
  } finally {
    await prisma.$disconnect();
  }

  const headers = {
    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
    // non-standard fallback for some clients/browsers
    Refresh: "30",
  };

  return Response.json(
    { ok: true, version: "1.0", uptime, db },
    { status: 200, headers }
  );
}
