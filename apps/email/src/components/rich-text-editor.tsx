import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import { useEffect, useRef } from "react"
import StarterKit from "@tiptap/starter-kit"
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table"
import { Link } from "@tiptap/extension-link"
import { Placeholder } from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Minus,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react"

type Props = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

type ToolbarButtonProps = {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`flex size-7 items-center justify-center rounded text-sm transition-colors
        ${active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }
        disabled:pointer-events-none disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-4 w-px bg-border" />
}

function normalizeContent(raw: string): string {
  const trimmed = raw.trim()
  // If it looks like HTML, pass it through; otherwise wrap in a paragraph
  if (trimmed.startsWith("<")) return trimmed
  // Plain text: convert newlines to <br> and wrap in <p>
  return "<p>" + trimmed.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>") + "</p>"
}

export function RichTextEditor({ content, onChange, placeholder = "Write your message…" }: Props) {
  const editorRef = useRef<Editor | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: normalizeContent(content),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-full px-4 py-3",
      },
    },
  })

  // Keep ref in sync so the effect below can read it without being a dependency
  editorRef.current = editor ?? null

  // When content is set externally (e.g. by an agent tool), push it into the editor
  useEffect(() => {
    const ed = editorRef.current
    if (!ed || ed.isDestroyed) return
    const incoming = normalizeContent(content)
    if (ed.getHTML() !== incoming) {
      ed.commands.setContent(incoming, false /* don't emit update */)
    }
  }, [content])

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt("URL")
    if (!url) return
    editor.chain().focus().setLink({ href: url }).run()
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="size-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code className="size-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="size-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Link">
          <LinkIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Insert table">
          <TableIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus className="size-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="relative flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
