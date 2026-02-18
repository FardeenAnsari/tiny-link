import { prisma } from "@/lib/prisma";
import z from "zod";
import { customAlphabet } from "nanoid";

export async function GET() {
  const linksCount = await prisma.link.count();
  const links = await prisma.link.findMany({
    select: {
      id: true,
      code: true,
      targetUrl: true,
      clickCount: true,
      lstClickedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(
    { linksCount, links },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=119",
      },
    }
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const LinkSchema = z.object({
    targetUrl: z.string().url(),
    code: z.string().optional(),
  });

  const parsedBody = LinkSchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  const { targetUrl } = parsedBody.data;
  let providedCode = parsedBody.data.code;

  // Treat empty string code as not provided so we generate one
  if (providedCode === "") {
    providedCode = undefined;
  }

  const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

  // Ensure provided code, if present, matches the format
  if (providedCode !== undefined && !CODE_REGEX.test(providedCode)) {
    return Response.json(
      {
        ok: false,
        error: "Invalid code format (must be 6-8 alphanumeric characters)",
      },
      { status: 400 }
    );
  }

  // If a code is provided, check uniqueness and return 409 if it exists
  if (providedCode) {
    const exists = await prisma.link.findUnique({
      where: { code: providedCode },
    });
    if (exists) {
      return Response.json(
        { ok: false, error: "Code already exists" },
        { status: 409 }
      );
    }
    try {
      const newLink = await prisma.link.create({
        data: { code: providedCode, targetUrl },
      });
      return Response.json({ ok: true, link: newLink }, { status: 201 });
    } catch (err) {
      // Handle unique constraint race or other DB errors
      const message = String(err ?? "Database error");
      if (message.includes("Unique") || message.includes("unique")) {
        return Response.json(
          { ok: false, error: "Code already exists" },
          { status: 409 }
        );
      }
      return Response.json({ ok: false, error: message }, { status: 500 });
    }
  }

  // Otherwise generate a unique code (try a limited number of attempts)
  const MAX_ATTEMPTS = 10;
  let attempt = 0;
  let code = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    const length = Math.floor(Math.random() * 3) + 6; //max length 6,7,8
    const nano = customAlphabet(alphabet, length);
    const candidate = nano();
    const exists = await prisma.link.findUnique({ where: { code: candidate } });
    if (!exists) {
      code = candidate;
      break;
    }
  }

  if (!code) {
    return Response.json(
      { ok: false, error: "Could not generate unique code, try again" },
      { status: 503 }
    );
  }

  try {
    const newLink = await prisma.link.create({ data: { code, targetUrl } });
    return Response.json({ ok: true, link: newLink }, { status: 201 });
  } catch (err) {
    const message = String(err ?? "Database error");
    if (message.includes("Unique") || message.includes("unique")) {
      return Response.json(
        { ok: false, error: "Code already exists" },
        { status: 409 }
      );
    }
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
