import { useState } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FormBuilder } from '@/components/FormBuilder'
import { FormPreview } from '@/components/FormPreview'
import { useForm } from '@/hooks/useForm'

type Mode = 'build' | 'preview'

export default function App() {
  const { form, addField, removeField, updateField, reorderFields, updateFormMeta } = useForm()
  const [mode, setMode] = useState<Mode>('build')
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  function handleModeChange(val: string) {
    setMode(val as Mode)
    if (val === 'preview') setSelectedFieldId(null)
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 border-b bg-background shrink-0 h-14">
          <div className="flex items-center gap-2 shrink-0">
            <LayoutTemplate className="size-5 text-muted-foreground" />
          </div>
          <Input
            value={form.title}
            onChange={(e) => updateFormMeta({ title: e.target.value })}
            className="text-base font-semibold bg-transparent border-transparent focus-visible:border-input w-56 h-8"
          />
          <div className="flex-1" />
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList>
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {mode === 'build' ? (
            <FormBuilder
              form={form}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              addField={addField}
              removeField={removeField}
              updateField={updateField}
              reorderFields={reorderFields}
              updateFormMeta={updateFormMeta}
            />
          ) : (
            <FormPreview form={form} />
          )}
        </main>
      </div>
    </TooltipProvider>
  )
}
