"use client"

import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { toast } from "sonner"

const linkSchema = z.object({
  targetUrl: z.string().url("Please enter a valid URL"),
  code: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9]{6,8}$/.test(val), "Custom code must be 6-8 alphanumeric characters"),
})

type LinkFormValues = z.infer<typeof linkSchema>

export function DashboardTableHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LinkFormValues>({
    defaultValues: {
      targetUrl: "",
      code: "",
    },
  })

  async function onSubmit(values: LinkFormValues) {
    setIsLoading(true)
    toast.loading("Creating link...")
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl: values.targetUrl,
          code: values.code || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error("Error",{
          description: data.error || "Failed to create link",
        })
        return
      }

      toast.success("Success",{
        description: `Link created: ${data.link.code}`,
      })

      form.reset()
      setIsOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error("Error",{
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 border-b border-border flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">All Links</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage and track your shortened URLs</p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Link
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a New Shortened Link</DialogTitle>
            <DialogDescription>Enter your target URL and optionally customize the short code.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/very/long/url"
                        aria-label="Target URL"
                        type="url"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Short Code (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="mycode123" disabled={isLoading} {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank to auto-generate. Must be 6-8 alphanumeric characters.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Creating..." : "Create Link"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

