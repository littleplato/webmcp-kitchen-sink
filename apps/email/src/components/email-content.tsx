import * as React from "react"
import { Reply, Forward, Trash2, Send, Bot, Search, Check, Paperclip, FileText, X } from "lucide-react"
import { useAgentTool } from "react-agent-tool"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { Email } from "@/data/emails"
import { ADDRESS_BOOK, lookupAddresses } from "@/adapters/address-book"

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
  const [addressLookup, setAddressLookup] = React.useState<{
    phase: "idle" | "looking" | "resolved"
    names: string[]
    resolved: { name: string; email: string }[]
  }>({ phase: "idle", names: [], resolved: [] })

  React.useEffect(() => {
    if (addressLookup.phase === "resolved") {
      const t = setTimeout(() => setAddressLookup((s) => ({ ...s, phase: "idle" })), 2200)
      return () => clearTimeout(t)
    }
  }, [addressLookup.phase])
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
      const allNames = [...(toVal ?? []), ...(ccVal ?? []), ...(bccVal ?? [])]
      setAddressLookup({ phase: "looking", names: allNames, resolved: [] })

      const [resolvedTo, resolvedCc, resolvedBcc] = await Promise.all([
        toVal ? lookupAddresses(toVal) : Promise.resolve(undefined),
        ccVal ? lookupAddresses(ccVal) : Promise.resolve(undefined),
        bccVal ? lookupAddresses(bccVal) : Promise.resolve(undefined),
      ])

      const resolvedPairs: { name: string; email: string }[] = []
      toVal?.forEach((n, i) => resolvedPairs.push({ name: n, email: resolvedTo![i] }))
      ccVal?.forEach((n, i) => resolvedPairs.push({ name: n, email: resolvedCc![i] }))
      bccVal?.forEach((n, i) => resolvedPairs.push({ name: n, email: resolvedBcc![i] }))

      if (resolvedTo !== undefined) setTo(resolvedTo)
      if (resolvedCc !== undefined) { setCc(resolvedCc); if (resolvedCc.length > 0) setShowCc(true) }
      if (resolvedBcc !== undefined) { setBcc(resolvedBcc); if (resolvedBcc.length > 0) setShowBcc(true) }

      setAddressLookup({ phase: "resolved", names: allNames, resolved: resolvedPairs })
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

  const [attachments, setAttachments] = React.useState<{ name: string; size: string; type: string }[]>([])

  const { state: attachState } = useAgentTool({
    name: "attach_files",
    description: "Attach relevant files to the email draft. The file picker will be shown to the user and the selected files will be attached.",
    inputSchema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string" },
          description: "List of file names to attach, e.g. [\"proposal.docx\"]",
        },
      },
      required: ["files"],
    },
    execute: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1800))
      setAttachments((prev) => {
        const existing = new Set(prev.map((a) => a.name))
        const toAdd = [{ name: "proposal.docx", size: "248 KB", type: "docx" }].filter(
          (f) => !existing.has(f.name)
        )
        return [...prev, ...toAdd]
      })
      return { success: true, attached: ["proposal.docx"] }
    },
    enabled: composing,
  })

  const showAddressCard = addressState.isExecuting || addressLookup.phase !== "idle"
  const genericTool = subjectState.isExecuting
    ? "subject line"
    : bodyState.isExecuting
    ? "message body"
    : null
  const isAnyExecuting = showAddressCard || genericTool !== null || attachState.isExecuting

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
    setAttachments([])
    onStopCompose()
  }

  if (composing) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h2 className="text-base font-medium">New Message</h2>
        </div>
        <div className="relative flex flex-1 flex-col gap-0 overflow-auto">
          {isAnyExecuting && (
            <div
              className="agent-takeover-backdrop absolute inset-0 z-20 overflow-hidden flex items-center justify-center"
              style={{ pointerEvents: 'all', background: 'hsl(var(--background) / 0.82)', backdropFilter: 'blur(8px)' }}
            >
              {showAddressCard ? (
                /* ── AGENT TAKEOVER: Address book ── */
                <div className="agent-takeover-card flex flex-col items-center gap-5 px-6 py-8 relative" style={{ minWidth: 320, maxWidth: 420 }}>

                  {/* Grid lines background */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" style={{ opacity: 0.06 }}>
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Scanning line across the card */}
                  <div
                    className="agent-scan-line absolute inset-x-0 h-[2px] pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.8) 20%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8) 80%, transparent 100%)',
                      filter: 'blur(1px)',
                      zIndex: 10,
                    }}
                  />

                  {/* Orbital icon cluster */}
                  <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
                    {/* Pulse rings */}
                    <div
                      className="agent-pulse-ring absolute inset-0 rounded-full"
                      style={{ border: '2px solid hsl(var(--primary) / 0.6)' }}
                    />
                    <div
                      className="agent-pulse-ring-2 absolute inset-0 rounded-full"
                      style={{ border: '1px solid hsl(var(--primary) / 0.3)' }}
                    />
                    {/* Outer spinning ring */}
                    <div
                      className="agent-icon-spin absolute inset-[-8px] rounded-full"
                      style={{
                        border: '2px dashed hsl(var(--primary) / 0.35)',
                      }}
                    />
                    {/* Inner counter-spinning ring */}
                    <div
                      className="agent-icon-spin-reverse absolute inset-[-2px] rounded-full"
                      style={{
                        border: '1.5px solid transparent',
                        background: 'linear-gradient(hsl(var(--background)), hsl(var(--background))) padding-box, conic-gradient(from 0deg, hsl(var(--primary)), transparent 40%, hsl(var(--primary)) 60%, transparent) border-box',
                      }}
                    />
                    {/* Orbiting dots */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="agent-orbit-dot absolute size-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
                      <div className="agent-orbit-dot-2 absolute size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.7)', boxShadow: '0 0 4px hsl(var(--primary))' }} />
                      <div className="agent-orbit-dot-3 absolute size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.5)', boxShadow: '0 0 4px hsl(var(--primary))' }} />
                    </div>
                    {/* Core icon */}
                    <div
                      className="relative flex items-center justify-center rounded-full size-14"
                      style={{
                        background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)',
                        border: '1.5px solid hsl(var(--primary) / 0.4)',
                        boxShadow: '0 0 20px hsl(var(--primary) / 0.2), inset 0 0 12px hsl(var(--primary) / 0.1)',
                      }}
                    >
                      {addressLookup.phase === "looking" ? (
                        <Bot className="size-7 text-primary" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.8))' }} />
                      ) : (
                        <Check
                          className="size-7 text-green-400"
                          style={{
                            animation: 'agent-success-burst 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                            filter: 'drop-shadow(0 0 8px rgb(74 222 128 / 0.8))',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* "AGENT" badge */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex items-center gap-1.5 rounded-full px-3 py-1"
                      style={{
                        background: 'hsl(var(--primary) / 0.1)',
                        border: '1px solid hsl(var(--primary) / 0.3)',
                      }}
                    >
                      <div className="dot-1 size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Agent Active</span>
                      <div className="dot-3 size-1.5 rounded-full bg-primary" />
                    </div>

                    {/* Big dramatic title */}
                    {addressLookup.phase === "looking" ? (
                      <>
                        <h2
                          className="agent-title text-2xl font-black tracking-[0.12em] uppercase text-center"
                          style={{ color: 'hsl(var(--primary))' }}
                        >
                          Scanning Contacts
                        </h2>
                        <p className="text-xs text-muted-foreground tracking-wide text-center">
                          The agent is infiltrating your address book
                        </p>
                      </>
                    ) : (
                      <>
                        <h2
                          className="text-2xl font-black tracking-[0.12em] uppercase text-center text-green-400"
                          style={{
                            animation: 'agent-success-burst 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                            textShadow: '0 0 20px rgb(74 222 128 / 0.6)',
                          }}
                        >
                          Contacts Found!
                        </h2>
                        <p className="text-xs text-muted-foreground tracking-wide text-center">
                          All contacts locked in
                        </p>
                      </>
                    )}
                  </div>

                  {/* Contact rows */}
                  <div
                    className="w-full rounded-xl overflow-hidden"
                    style={{
                      border: '1px solid hsl(var(--primary) / 0.2)',
                      background: 'hsl(var(--background) / 0.9)',
                    }}
                  >
                    {/* Header bar */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 border-b"
                      style={{ borderColor: 'hsl(var(--primary) / 0.15)', background: 'hsl(var(--primary) / 0.06)' }}
                    >
                      <Search className="size-3 text-primary" style={addressLookup.phase === "looking" ? { animation: 'dot-pulse 1.4s ease-in-out infinite' } : undefined} />
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary">
                        {addressLookup.phase === "looking" ? "Searching address book…" : "Contacts resolved"}
                      </span>
                      <div className="ml-auto flex gap-0.5">
                        <div className="size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.6)' }} />
                        <div className="size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.4)' }} />
                        <div className="size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.2)' }} />
                      </div>
                    </div>
                    {/* Rows */}
                    <div className="flex flex-col divide-y divide-primary/10">
                      {addressLookup.names.map((name, i) => {
                        const resolvedEntry = addressLookup.resolved[i]
                        return (
                          <div
                            key={name}
                            className="flex items-center gap-3 px-3 py-2.5"
                            style={{
                              animation: `agent-row-in 0.3s ease-out ${i * 0.08}s both`,
                              ...(resolvedEntry ? { background: `hsl(var(--primary) / 0.04)` } : {}),
                            }}
                          >
                            {resolvedEntry ? (
                              <>
                                <div
                                  className="flex items-center justify-center size-5 rounded-full shrink-0"
                                  style={{
                                    background: 'rgb(74 222 128 / 0.15)',
                                    border: '1px solid rgb(74 222 128 / 0.4)',
                                    animation: `check-pop 0.35s cubic-bezier(0.175,0.885,0.32,1.275) ${i * 0.12}s both`,
                                  }}
                                >
                                  <Check className="size-2.5 text-green-400" />
                                </div>
                                <div style={{ animation: `email-reveal 0.25s ease-out ${i * 0.12 + 0.1}s both`, opacity: 0 }}>
                                  <span className="text-sm font-semibold text-foreground">{name}</span>
                                  <span className="text-xs ml-2" style={{ color: 'hsl(var(--primary) / 0.8)' }}>{resolvedEntry.email}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex gap-0.5 shrink-0 items-center">
                                  <div className="dot-1 size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.7)' }} />
                                  <div className="dot-2 size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.7)' }} />
                                  <div className="dot-3 size-1.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.7)' }} />
                                </div>
                                <span className="text-sm text-muted-foreground">{name}</span>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>
              ) : attachState.isExecuting ? (
                /* Attach files badge */
                <div
                  className="agent-takeover-card flex flex-col items-center gap-3"
                  style={{ animation: 'ai-glow 2s ease-in-out infinite' }}
                >
                  <div
                    className="flex items-center gap-2.5 rounded-full border bg-background/95 px-5 py-2.5 shadow-xl"
                    style={{ borderColor: 'hsl(var(--primary) / 0.4)' }}
                  >
                    <Paperclip className="size-4 text-primary" style={{ animation: 'agent-icon-spin 2s linear infinite' }} />
                    <span className="text-sm font-medium text-foreground">Fetching files</span>
                    <div className="flex items-center gap-1 ml-1">
                      <div className="dot-1 size-1.5 rounded-full bg-primary" />
                      <div className="dot-2 size-1.5 rounded-full bg-primary" />
                      <div className="dot-3 size-1.5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Agent is attaching files — one moment</p>
                </div>
              ) : (
                /* Generic badge for subject / body */
                <div
                  className="agent-takeover-card flex flex-col items-center gap-3"
                  style={{ animation: 'ai-glow 2s ease-in-out infinite' }}
                >
                  <div
                    className="flex items-center gap-2.5 rounded-full border bg-background/95 px-5 py-2.5 shadow-xl"
                    style={{ borderColor: 'hsl(var(--primary) / 0.4)' }}
                  >
                    <Bot className="size-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Writing {genericTool}
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
              )}
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
        {attachments.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2 px-4 py-3">
              {attachments.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                  style={{ animation: 'agent-row-in 0.3s ease-out both' }}
                >
                  <FileText className="size-4 text-primary shrink-0" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium text-foreground text-xs">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground">{file.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.name !== file.name))}
                    className="ml-1 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
                    tabIndex={-1}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
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
