"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Copy, MoreHorizontal, Trash2, ExternalLink, ChartBar } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export type Code = {
    id: string
    code: string
    targetUrl: string
    clickCount: number
    createdAtFormatted: string
    lstClickedAtFormatted: string | null
}


const TruncatedUrl = ({ url }: { url: string }) => {
    const truncated = url.length > 50 ? url.substring(0, 47) + "..." : url
    return (
        <span title={url} className="text-muted-foreground hover:text-foreground transition-colors">
            {truncated}
        </span>
    )
}

const DeleteConfirmDialog = ({ code, onConfirm }: { code: string; onConfirm?: () => void }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleDelete() {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`/api/links/${encodeURIComponent(code)}`, {
                method: "DELETE",
            })

            if (res.ok) {
                // Refresh data and close dialog
                router.refresh()
                setOpen(false)
                if (onConfirm) onConfirm()
            } else {
                const text = await res.text()
                setError(text || `Failed to delete code (${res.status})`)
            }
        } catch (err) {
            setError(String(err))
            console.error("Delete failed", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center w-full cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Code
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Short Code</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <code className="font-mono font-semibold">{code}</code>? This action cannot
                        be undone.
                    </DialogDescription>
                </DialogHeader>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const columns: ColumnDef<Code>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "code",
        header: ({ column }) => (
            <button
                className="flex items-center gap-2 font-semibold"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Short Code
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </button>
        ),
        cell: ({ getValue }) => (
            <code className="font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                {getValue() as string}
            </code>
        ),
    },
    {
        accessorKey: "targetUrl",
        header: "Target URL",
        cell: ({ getValue }) => <TruncatedUrl url={getValue() as string} />,
    },
    {
        accessorKey: "clickCount",
        header: ({ column }) => (
            <button
                className="flex items-center gap-2 font-semibold"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Clicks
                <ArrowUpDown className="w-4 h-4" />
            </button>
        ),
        cell: ({ getValue }) => (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 font-semibold">
                {getValue() as number}
            </span>
        ),
    },
    {
        accessorKey: "createdAtFormatted",
        header: ({ column }) => (
            <button
                className="flex items-center gap-2 font-semibold"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Created
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </button>
        ),
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() as string}</span>,
    },
    {
        accessorKey: "lstClickedAtFormatted",
        header: "Last Activity",
        cell: ({ getValue }) => {
            const value = getValue() as string | null
            return (
                <span className="text-sm text-muted-foreground">
                    {value ? value : <span className="text-xs italic">Never clicked</span>}
                </span>
            )
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
            const code = row.original.code
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(`${baseUrl}/${code}`)}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Short Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/code/${code}`} className="flex items-center">
                                <ChartBar className="mr-2 h-4 w-4" />
                                View Analytics
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`${baseUrl}/${code}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Link
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" asChild>
                            <DeleteConfirmDialog
                                code={code}
                                onConfirm={() => {
                                    console.log("Delete code:", code)
                                }}
                            />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]