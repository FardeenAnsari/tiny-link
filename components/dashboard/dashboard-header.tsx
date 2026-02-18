import { LinkIcon } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <LinkIcon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
        Link <span className="text-primary">Analytics</span>
      </h1>
      <p className="text-muted-foreground text-lg">Monitor and analyze all your shortened links in one place</p>
    </div>
  )
}
