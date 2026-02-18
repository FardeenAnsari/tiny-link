import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { ExternalLink, BarChart3, Clock, LinkIcon } from "lucide-react"
import CopyButtonClient from "@/components/link/CopyButtonClient"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
  params: {
    code: string
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = (await params) as Props["params"]
  const { code } = resolvedParams ?? {}

  if (!code) return notFound()

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
  })

  if (!link || link.deleted) return notFound()

  return <LinkDashboardClient link={link} />
};

function LinkDashboardClient({ link }: {
  link: {
    code: string;
    targetUrl: string;
    clickCount: number;
    lstClickedAt: Date | null;
    createdAt: Date;
  }
}
) {

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${link.code}`;


  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Link Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-primary">{shortUrl}</span>
          </h1>
          <p className="text-muted-foreground">Track and analyze your shortened URL performance</p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <CopyButtonClient name="Short URL" className="flex-1 sm:flex-none" text={shortUrl} />
              <Button asChild className="gap-2">
                <a href={shortUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Visit Site
                </a>
              </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Click Count Card - Primary */}
          <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-primary/20 p-8 transition-all hover:border-primary/50 hover:shadow-lg lg:col-span-1">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total Clicks</span>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-6xl font-bold text-foreground">{link.clickCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-3">Engagement metric</p>
            </div>
          </div>

          {/* Last Clicked Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 transition-all hover:border-primary/50 hover:shadow-lg">
            <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Last Clicked</span>
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div className="text-lg font-semibold text-foreground">
                {link.lstClickedAt ? format(new Date(link.lstClickedAt), "MMM dd") : "Never"}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {link.lstClickedAt ? format(new Date(link.lstClickedAt), "h:mm a") : "No activity"}
              </p>
            </div>
          </div>

          {/* Created Date Card - Subtle */}
          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 transition-all hover:border-primary/50 hover:shadow-lg">
            <div className="absolute inset-0 bg-linear-to-br from-muted/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Created</span>
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-lg font-semibold text-foreground">
                {format(new Date(link.createdAt), "MMM dd, yyyy")}
              </div>
              <p className="text-xs text-muted-foreground mt-3">{format(new Date(link.createdAt), "EEEE")}</p>
            </div>
          </div>
        </div>

        {/* Target URL Card - Full Width */}
        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 transition-all hover:border-primary/50 hover:shadow-lg">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Destination URL
              </span>
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border/50 break-all">
              <a
                href={link.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:text-primary/80 font-mono text-sm transition-colors"
              >
                {link.targetUrl}
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <CopyButtonClient
                name="Target URL"
                text={link.targetUrl}
                className="flex-1 sm:flex-none"
              />
              <Button asChild className="gap-2">
                <a href={link.targetUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Visit Site
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors gap-2"
          >
            <span>←</span>
            <span>Back to dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
