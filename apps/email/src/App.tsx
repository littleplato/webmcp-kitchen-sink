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
            <button
              onClick={handleCompose}
              className="ml-auto flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Pencil className="size-3.5" />
              Compose
            </button>
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
