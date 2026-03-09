import * as React from "react"
import { Reply, Forward, Trash2, Send } from "lucide-react"
import { useAgentTool } from "react-agent-tool"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { Email } from "@/data/emails"

type Props = {
  selectedEmail: Email | null
  composing: boolean
  onStopCompose: () => void
}

export function EmailContent({ selectedEmail, composing, onStopCompose }: Props) {
  const [to, setTo] = React.useState<string[]>([])
  const [toInput, setToInput] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("<p></p>")

  const addRecipient = (value: string) => {
    const trimmed = value.trim().replace(/,+$/, "")
    if (trimmed && !to.includes(trimmed)) {
      setTo((prev) => [...prev, trimmed])
    }
    setToInput("")
  }

  const removeRecipient = (email: string) => {
    setTo((prev) => prev.filter((e) => e !== email))
  }

  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault()
      if (toInput.trim()) addRecipient(toInput)
    } else if (e.key === "Backspace" && toInput === "" && to.length > 0) {
      setTo((prev) => prev.slice(0, -1))
    }
  }

  useAgentTool({
    name: "update_recipients",
    description: "Set the To field of the email draft being composed",
    inputSchema: {
      type: "object",
      properties: {
        recipients: {
          type: "array",
          items: { type: "string" },
          description: "List of recipient email addresses",
        },
      },
      required: ["recipients"],
    },
    execute: async ({ recipients }) => {
      setTo(recipients)
      return { success: true }
    },
    enabled: composing,
  })

  useAgentTool({
    name: "update_subject",
    description: "Set the subject line of the email draft being composed",
    inputSchema: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "The email subject line",
        },
      },
      required: ["subject"],
    },
    execute: async ({ subject }) => {
      setSubject(subject)
      return { success: true }
    },
    enabled: composing,
  })

  useAgentTool({
    name: "update_message_body",
    description: "Set the body of the email draft. Accepts HTML with full formatting: headings, bold, italic, lists, blockquotes, tables, links, code blocks, and horizontal rules.",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "HTML content for the email body. Supports: h2, h3, strong, em, s, code, pre, ul/ol/li, blockquote, table/thead/tbody/tr/th/td, a href, hr",
        },
      },
      required: ["body"],
    },
    execute: async ({ body }) => {
      console.log({body})
      setBody(body)
      return { success: true }
    },
    enabled: composing,
  })

  const handleDiscard = () => {
    setTo([])
    setToInput("")
    setSubject("")
    setBody("")
    onStopCompose()
  }

  if (composing) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h2 className="text-base font-medium">New Message</h2>
        </div>
        <div className="flex flex-1 flex-col gap-0 overflow-auto">
          <div
            className="flex min-h-10 flex-wrap items-center gap-1.5 border-b px-4 py-2 cursor-text"
            onClick={() => document.getElementById("to-input")?.focus()}
          >
            <span className="text-sm text-muted-foreground shrink-0 w-12">To</span>
            {to.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {email}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeRecipient(email) }}
                  className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                  tabIndex={-1}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="to-input"
              value={toInput}
              onChange={(e) => {
                const val = e.target.value
                if (val.endsWith(",")) {
                  addRecipient(val)
                } else {
                  setToInput(val)
                }
              }}
              onKeyDown={handleToKeyDown}
              onBlur={() => { if (toInput.trim()) addRecipient(toInput) }}
              placeholder={to.length === 0 ? "recipient@example.com" : ""}
              className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <span className="w-12 text-sm text-muted-foreground">Subject</span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="border-none shadow-none focus-visible:ring-0 p-0 h-8"
            />
          </div>
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Write your message…"
          />
        </div>
        <Separator />
        <div className="flex items-center gap-2 p-4">
          <Button size="sm" className="gap-1.5">
            <Send className="size-3.5" />
            Send
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDiscard}>
            Discard
          </Button>
        </div>
      </div>
    )
  }

  if (!selectedEmail) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Select an email to read</p>
          <p className="text-xs mt-1">or compose a new message</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{selectedEmail.subject}</h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{selectedEmail.name}</span>
          <span>&lt;{selectedEmail.email}&gt;</span>
          <span className="ml-auto">{selectedEmail.date}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedEmail.body}</p>
      </div>
      <Separator />
      <div className="flex items-center gap-2 p-4">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Reply className="size-3.5" />
          Reply
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Forward className="size-3.5" />
          Forward
        </Button>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-destructive hover:text-destructive">
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </div>
  )
}
