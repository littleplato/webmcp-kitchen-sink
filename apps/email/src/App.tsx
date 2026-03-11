import * as React from "react"
import { Pencil } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { EmailContent } from "@/components/email-content"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { emails as initialEmails, type Email } from "@/data/emails"

export default function App() {
  const [activeFolder, setActiveFolder] = React.useState("Inbox")
  const [selectedEmail, setSelectedEmail] = React.useState<Email | null>(null)
  const [composing, setComposing] = React.useState(false)

  const handleFolderChange = (folder: string) => {
    setActiveFolder(folder)
    setSelectedEmail(null)
    setComposing(false)
  }

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email)
    setComposing(false)
  }

  const handleCompose = () => {
    setComposing(true)
    setSelectedEmail(null)
  }

  const folderEmails =
    activeFolder === "Inbox" || activeFolder === "Drafts" || activeFolder === "Sent" || activeFolder === "Junk" || activeFolder === "Trash"
      ? activeFolder === "Inbox"
        ? initialEmails
        : []
      : initialEmails

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "350px",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          emails={folderEmails}
          activeFolder={activeFolder}
          onFolderChange={handleFolderChange}
          selectedEmail={selectedEmail}
          onSelectEmail={handleSelectEmail}
          onCompose={handleCompose}
        />
        <SidebarInset>
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {composing ? "New Message" : selectedEmail?.subject ?? activeFolder}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto">
              <button
                onClick={handleCompose}
                className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Pencil className="size-3.5" />
                Compose
              </button>
              {/* Floating callout */}
              {!composing && !selectedEmail && (
                <div className="compose-hint absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center gap-2 pointer-events-none" style={{ zIndex: 50 }}>
                  {/* Stylized SVG curved arrow */}
                  <div style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.9))' }}>
                    <svg width="28" height="52" viewBox="0 0 28 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 14 50 C 22 36 5 24 14 7" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M 7 15 L 14 2 L 21 15" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="whitespace-nowrap text-xs font-semibold tracking-wide" style={{ color: '#38bdf8' }}>
                    Try me!
                  </span>
                </div>
              )}
            </div>
          </header>
          <div className="flex flex-1 flex-col overflow-hidden h-[calc(100vh-57px)]">
            <EmailContent
              selectedEmail={selectedEmail}
              composing={composing}
              onStopCompose={() => setComposing(false)}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
