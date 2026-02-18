"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface Props {
  name?: string
  text: string
  className?: string
}


export default function CopyButtonClient({ name, text, className }: Props) {
  const [copied, setCopied] = React.useState(false)

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error("copy failed", err)
    }
  }

  return (
    <Button variant="ghost" className={className} onClick={handleClick}>
      <div className="flex items-center space-x-2 border-b border-dashed border-transparent hover:border-current">
        <Copy size={16} />
        <span className="">{copied ? "Copied!" : `Copy ${name ?? "to clipboard"}`}</span>
      </div>
    </Button>
  )
}
