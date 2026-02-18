import { prisma } from "@/lib/prisma"
import { formatUTC } from "@/lib/date"
import { BarChart3, ExternalLink, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DataTable } from "@/components/dashboard/data-table"
import { columns } from "@/components/dashboard/columns"
import { DashboardTableHeader } from "@/components/dashboard/dashboard-table-header"


export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const links = await prisma.link.findMany({
    where: { deleted: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      targetUrl: true,
      clickCount: true,
      lstClickedAt: true,
      createdAt: true,
    },
  })

  const normalizedLinks = links.map(link => ({
    ...link,
    id: String(link.id),
    clickCount: link.clickCount,
    code: link.code,
    targetUrl: link.targetUrl,
    createdAt: link.createdAt instanceof Date ? link.createdAt.toISOString() : String(link.createdAt),
    lstClickedAt: link.lstClickedAt ? (link.lstClickedAt instanceof Date ? link.lstClickedAt.toISOString() : String(link.lstClickedAt)) : null,
    createdAtFormatted: formatUTC(link.createdAt, "MMM dd, yyyy"),
    lstClickedAtFormatted: link.lstClickedAt ? formatUTC(link.lstClickedAt, "MMM dd, yyyy") : null,
  }))

  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0)
  const totalLinks = links.length
  const averageClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <DashboardHeader />

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          <div className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 transition-all hover:border-primary/50 hover:shadow-lg">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Links
                </span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{totalLinks}</p>
              <p className="text-xs text-muted-foreground mt-2">Shortened URLs</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 transition-all hover:border-primary/50 hover:shadow-lg">
            <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Clicks
                </span>
                <BarChart3 className="w-4 h-4 text-accent" />
              </div>
              <p className="text-3xl font-bold text-foreground">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">All-time engagement</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 transition-all hover:border-primary/50 hover:shadow-lg">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Clicks</span>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{averageClicks}</p>
              <p className="text-xs text-muted-foreground mt-2">Per link average</p>
            </div>
          </div>
        </div>

        {/* Links Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <DashboardTableHeader />
          <DataTable columns={columns} data={normalizedLinks} />
        </div>

        {/* Empty State */}
        {links.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No links yet</h3>
            <p className="text-muted-foreground mb-6">Create your first shortened URL to get started</p>
            <Button>Create a Link</Button>
          </div>
        )}
      </div>
    </main>
  )
}
