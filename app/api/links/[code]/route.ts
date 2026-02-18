import { prisma } from "@/lib/prisma";

type Props = {
  params: {
    code: string;
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<Props["params"]> }
) {
  const resolvedParams = (await params) as Props["params"];
  const { code } = resolvedParams ?? {};

  if (!code)
    return Response.json(
      { ok: false, error: "Code is required" },
      { status: 400 }
    );

  const link = await prisma.link.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      targetUrl: true,
      clickCount: true,
      lstClickedAt: true,
      createdAt: true,
      deleted: true,
    },
  });

  if (!link) {
    return Response.json(
      { ok: false, error: "Link not found" },
      { status: 404 }
    );
  }

  return Response.json(
    {
      link: {
        id: link.id,
        code: link.code,
        targetUrl: link.targetUrl,
        clickCount: link.clickCount,
        lstClickedAt: link.lstClickedAt,
        createdAt: link.createdAt,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=119",
      },
    }
  );
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<Props["params"]> }
) {
  const resolvedParams = (await params) as Props["params"];
  const { code } = resolvedParams ?? {};

  if (!code)
    return Response.json(
      { ok: false, error: "Code is required" },
      { status: 400 }
    );

  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return Response.json(
      { ok: false, error: "Link not found" },
      { status: 404 }
    );
  }

  await prisma.link.update({
    where: { code },
    data: { deleted: true },
  });

  return Response.json(
    { ok: true, message: "Link deleted successfully" },
    { status: 200 }
  );
}