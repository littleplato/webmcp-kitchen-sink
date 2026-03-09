import * as React from "react"
import { Reply, Forward, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { Email } from "@/data/emails"

type Props = {
  selectedEmail: Email | null
  composing: boolean
  onStopCompose: () => void
}

export function EmailContent({ selectedEmail, composing, onStopCompose }: Props) {
  const [to, setTo] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")

  const handleDiscard = () => {
    setTo("")
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
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <span className="w-12 text-sm text-muted-foreground">To</span>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="border-none shadow-none focus-visible:ring-0 p-0 h-8"
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
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            className="flex-1 resize-none rounded-none border-none shadow-none focus-visible:ring-0 p-4 min-h-0 h-full"
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
