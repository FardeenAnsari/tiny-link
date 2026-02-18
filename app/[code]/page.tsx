import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

type Props = {
  params: {
    code: string;
  };
};

export default async function Page({ params }: Props) {
  const resolvedParams = await params as Props['params'];
  const { code } = resolvedParams ?? {};

  if (!code) {
    return notFound();
  }

  // find the link by code
  const link = await prisma.link.findUnique({ where: { code } });

  if (!link || link.deleted) {
    // return a 404 page
    return notFound();
  }

  // update click count and last-clicked timestamp
  try {
    await prisma.link.update({
      where: { code },
      data: { clickCount: { increment: 1 }, lstClickedAt: new Date() },
    });
  } catch (err) {
    console.error("Failed to update click count for code:", code, err);
  }

  // server-side redirect to target URL
  redirect(link.targetUrl);
}
