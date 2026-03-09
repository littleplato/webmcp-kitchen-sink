import * as React from "react"
import { ArchiveX, File, Inbox, Mail, Send, Trash2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import type { Email } from "@/data/emails"

const navItems = [
  { title: "Inbox", icon: Inbox },
  { title: "Drafts", icon: File },
  { title: "Sent", icon: Send },
  { title: "Junk", icon: ArchiveX },
  { title: "Trash", icon: Trash2 },
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  emails: Email[]
  activeFolder: string
  onFolderChange: (folder: string) => void
  selectedEmail: Email | null
  onSelectEmail: (email: Email) => void
  onCompose: () => void
}

export function AppSidebar({
  emails,
  activeFolder,
  onFolderChange,
  selectedEmail,
  onSelectEmail,
  onCompose,
  ...props
}: AppSidebarProps) {
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const { setOpen } = useSidebar()

  const filtered = emails.filter((m) => {
    if (unreadOnly && m.read) return false
    if (search && !m.subject.toLowerCase().includes(search.toLowerCase()) && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* Icon nav sidebar */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="md:h-8 md:p-0 pointer-events-none">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Mail className="size-4" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{ children: item.title, hidden: false }}
                      onClick={() => {
                        onFolderChange(item.title)
                        setOpen(true)
                      }}
                      isActive={activeFolder === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Mail list sidebar */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeFolder}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unread</span>
              <Switch
                className="shadow-none"
                checked={unreadOnly}
                onCheckedChange={setUnreadOnly}
              />
            </Label>
          </div>
          <SidebarInput
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {activeFolder === "Drafts" ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No drafts yet.
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No messages.
                </div>
              ) : (
                filtered.map((mail) => (
                  <button
                    key={mail.id}
                    onClick={() => onSelectEmail(mail)}
                    className={`flex w-full flex-col items-start gap-2 border-b p-4 text-left text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      selectedEmail?.id === mail.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }`}
                  >
                    <div className="flex w-full items-center gap-2">
                      {!mail.read && (
                        <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <span className={!mail.read ? "font-semibold" : ""}>
                        {mail.name}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {mail.date}
                      </span>
                    </div>
                    <span className="font-medium truncate w-full">
                      {mail.subject}
                    </span>
                    <span className="line-clamp-2 w-[260px] text-xs text-muted-foreground whitespace-break-spaces">
                      {mail.teaser}
                    </span>
                  </button>
                ))
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {activeFolder === "Drafts" && (
          <div className="border-t p-4">
            <button
              onClick={onCompose}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              New Draft
            </button>
          </div>
        )}
      </Sidebar>
    </Sidebar>
  )
}
