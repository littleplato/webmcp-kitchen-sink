import * as React from "react"
import { Reply, Forward, Trash2, Send, Bot } from "lucide-react"
import { useAgentTool } from "react-agent-tool"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { Email } from "@/data/emails"

const ADDRESS_BOOK: Record<string, string> = {
  "John Smith": "john.smith@company.com",
  "Sarah Johnson": "sarah.johnson@company.com",
  "Michael Chen": "michael.chen@company.com",
  "Emily Davis": "emily.davis@company.com",
  "Alex Rodriguez": "alex.rodriguez@company.com",
}

async function lookupAddresses(names: string[]): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 1800))
  return names.map((name) => ADDRESS_BOOK[name] ?? name)
}

type Props = {
  selectedEmail: Email | null
  composing: boolean
  onStopCompose: () => void
}

export function EmailContent({ selectedEmail, composing, onStopCompose }: Props) {
  const [to, setTo] = React.useState<string[]>([])
  const [toInput, setToInput] = React.useState("")
  const [cc, setCc] = React.useState<string[]>([])
  const [ccInput, setCcInput] = React.useState("")
  const [bcc, setBcc] = React.useState<string[]>([])
  const [bccInput, setBccInput] = React.useState("")
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("<p></p>")

  const makeChipHandlers = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const add = (value: string) => {
      const trimmed = value.trim().replace(/,+$/, "")
      if (trimmed && !list.includes(trimmed)) setList((prev) => [...prev, trimmed])
      setInput("")
    }
    const remove = (email: string) => setList((prev) => prev.filter((e) => e !== email))
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
        e.preventDefault()
        if (input.trim()) add(input)
      } else if (e.key === "Backspace" && input === "" && list.length > 0) {
        setList((prev) => prev.slice(0, -1))
      }
    }
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val.endsWith(",")) add(val)
      else setInput(val)
    }
    const onBlur = () => { if (input.trim()) add(input) }
    return { add, remove, onKeyDown, onChange, onBlur }
  }

  const toHandlers = makeChipHandlers(to, setTo, toInput, setToInput)
  const ccHandlers = makeChipHandlers(cc, setCc, ccInput, setCcInput)
  const bccHandlers = makeChipHandlers(bcc, setBcc, bccInput, setBccInput)

  const { state: addressState } = useAgentTool({
    name: "update_email_addresses",
    description: `Set the To, CC, and/or BCC fields of the email draft by looking up recipients in the address book. Pass full names in natural language — the address book will resolve them to email addresses. Only the following names are in the address book: ${Object.keys(ADDRESS_BOOK).join(", ")}.`,
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "array",
          items: { type: "string" },
          description: "Full names of primary recipients, e.g. [\"John Smith\"]",
        },
        cc: {
          type: "array",
          items: { type: "string" },
          description: "Full names of CC recipients",
        },
        bcc: {
          type: "array",
          items: { type: "string" },
          description: "Full names of BCC recipients",
        },
      },
    },
    execute: async ({ to: toVal, cc: ccVal, bcc: bccVal }) => {
      const [resolvedTo, resolvedCc, resolvedBcc] = await Promise.all([
        toVal ? lookupAddresses(toVal) : Promise.resolve(undefined),
        ccVal ? lookupAddresses(ccVal) : Promise.resolve(undefined),
        bccVal ? lookupAddresses(bccVal) : Promise.resolve(undefined),
      ])
      if (resolvedTo !== undefined) setTo(resolvedTo)
      if (resolvedCc !== undefined) { setCc(resolvedCc); if (resolvedCc.length > 0) setShowCc(true) }
      if (resolvedBcc !== undefined) { setBcc(resolvedBcc); if (resolvedBcc.length > 0) setShowBcc(true) }
      return { success: true }
    },
    enabled: composing,
  })

  const { state: subjectState } = useAgentTool({
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

  const { state: bodyState } = useAgentTool({
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
      setBody(body)
      return { success: true }
    },
    enabled: composing,
  })

  const executingTool = addressState.isExecuting
    ? "address book"
    : subjectState.isExecuting
    ? "subject line"
    : bodyState.isExecuting
    ? "message body"
    : null
  const isAnyExecuting = executingTool !== null

  const handleDiscard = () => {
    setTo([])
    setToInput("")
    setCc([])
    setCcInput("")
    setBcc([])
    setBccInput("")
    setShowCc(false)
    setShowBcc(false)
    setSubject("")
    setBody("")
    onStopCompose()
  }

  if (composing) {
    return (
      <div className="flex h-full flex-col">
        <style>{`
          @keyframes scan-beam {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes dot-pulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
          @keyframes ai-glow {
            0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.3); }
            50% { box-shadow: 0 0 0 6px hsl(var(--primary) / 0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes typewriter-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .scan-beam {
            animation: scan-beam 2s ease-in-out infinite;
          }
          .dot-1 { animation: dot-pulse 1.4s ease-in-out 0s infinite; }
          .dot-2 { animation: dot-pulse 1.4s ease-in-out 0.2s infinite; }
          .dot-3 { animation: dot-pulse 1.4s ease-in-out 0.4s infinite; }
          .ai-overlay { animation: fade-in 0.15s ease-out forwards; }
          .ai-badge { animation: slide-up 0.2s ease-out forwards; }
          .ai-cursor { animation: typewriter-blink 0.8s step-end infinite; }
        `}</style>
        <div className="border-b p-4">
          <h2 className="text-base font-medium">New Message</h2>
        </div>
        <div className="relative flex flex-1 flex-col gap-0 overflow-auto">
          {isAnyExecuting && (
            <div className="ai-overlay absolute inset-0 z-20 overflow-hidden" style={{ pointerEvents: 'all' }}>
              {/* Frosted backdrop */}
              <div className="absolute inset-0 bg-background/70 backdrop-blur-[1.5px]" />

              {/* Scanning beam */}
              <div
                className="scan-beam absolute inset-x-0 h-[3px]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.6) 30%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.6) 70%, transparent 100%)',
                  filter: 'blur(1px)',
                }}
              />

              {/* Status badge */}
              <div className="ai-badge absolute inset-0 flex items-center justify-center">
                <div
                  className="flex flex-col items-center gap-3"
                  style={{ animation: 'ai-glow 2s ease-in-out infinite' }}
                >
                  <div
                    className="flex items-center gap-2.5 rounded-full border bg-background/95 px-5 py-2.5 shadow-xl"
                    style={{ borderColor: 'hsl(var(--primary) / 0.4)' }}
                  >
                    <Bot className="size-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Writing {executingTool}
                    </span>
                    <span className="ai-cursor text-primary font-bold text-base leading-none">|</span>
                    <div className="flex items-center gap-1 ml-1">
                      <div className="dot-1 size-1.5 rounded-full bg-primary" />
                      <div className="dot-2 size-1.5 rounded-full bg-primary" />
                      <div className="dot-3 size-1.5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">AI is updating your draft — editing paused</p>
                </div>
              </div>
            </div>
          )}
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
                  onClick={(e) => { e.stopPropagation(); toHandlers.remove(email) }}
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
              onChange={toHandlers.onChange}
              onKeyDown={toHandlers.onKeyDown}
              onBlur={toHandlers.onBlur}
              placeholder={to.length === 0 ? "recipient@example.com" : ""}
              className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="ml-auto flex items-center gap-1">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {(showCc || cc.length > 0) && (
            <div
              className="flex min-h-10 flex-wrap items-center gap-1.5 border-b px-4 py-2 cursor-text"
              onClick={() => document.getElementById("cc-input")?.focus()}
            >
              <span className="text-sm text-muted-foreground shrink-0 w-12">Cc</span>
              {cc.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {email}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); ccHandlers.remove(email) }}
                    className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                    tabIndex={-1}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="cc-input"
                value={ccInput}
                onChange={ccHandlers.onChange}
                onKeyDown={ccHandlers.onKeyDown}
                onBlur={ccHandlers.onBlur}
                placeholder={cc.length === 0 ? "cc@example.com" : ""}
                className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}

          {(showBcc || bcc.length > 0) && (
            <div
              className="flex min-h-10 flex-wrap items-center gap-1.5 border-b px-4 py-2 cursor-text"
              onClick={() => document.getElementById("bcc-input")?.focus()}
            >
              <span className="text-sm text-muted-foreground shrink-0 w-12">Bcc</span>
              {bcc.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {email}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); bccHandlers.remove(email) }}
                    className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                    tabIndex={-1}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="bcc-input"
                value={bccInput}
                onChange={bccHandlers.onChange}
                onKeyDown={bccHandlers.onKeyDown}
                onBlur={bccHandlers.onBlur}
                placeholder={bcc.length === 0 ? "bcc@example.com" : ""}
                className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
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
