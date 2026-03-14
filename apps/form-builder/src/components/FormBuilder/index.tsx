import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldList } from './FieldList'
import { FieldTypePicker } from './FieldTypePicker'
import { FieldSettings } from './FieldSettings'
import type { Form, FormField, FieldType } from '@/types/form'

interface Props {
  form: Form
  selectedFieldId: string | null
  onSelectField: (id: string | null) => void
  addField: (type: FieldType) => string
  removeField: (id: string) => void
  updateField: (id: string, patch: Partial<FormField>) => void
  reorderFields: (activeId: string, overId: string) => void
  updateFormMeta: (patch: Partial<Pick<Form, 'title' | 'description'>>) => void
}

export function FormBuilder({
  form,
  selectedFieldId,
  onSelectField,
  addField,
  removeField,
  updateField,
  reorderFields,
  updateFormMeta,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const selectedField = form.fields.find((f) => f.id === selectedFieldId)

  function handleAdd(type: FieldType) {
    const id = addField(type)
    onSelectField(id)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left column */}
      <div className="flex-[3] overflow-y-auto p-6 space-y-6">
        {/* Form header */}
        <div className="space-y-2">
          <Input
            value={form.title}
            onChange={(e) => updateFormMeta({ title: e.target.value })}
            className="text-lg font-semibold border-transparent bg-transparent focus-visible:border-input px-0 h-auto py-1"
            placeholder="Form title"
          />
          <Textarea
            value={form.description}
            onChange={(e) => updateFormMeta({ description: e.target.value })}
            className="text-sm text-muted-foreground border-transparent bg-transparent focus-visible:border-input px-0 resize-none min-h-0"
            placeholder="Add a description..."
            rows={2}
          />
        </div>

        {/* Field list */}
        <FieldList
          fields={form.fields}
          selectedId={selectedFieldId}
          onSelect={onSelectField}
          onRemove={(id) => {
            removeField(id)
            if (selectedFieldId === id) onSelectField(null)
          }}
          onReorder={reorderFields}
        />

        {/* Add field button */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="size-4" />
          Add field
        </Button>
      </div>

      {/* Right column — settings panel */}
      <div className="flex-[2] overflow-y-auto border-l bg-muted/20">
        {selectedField ? (
          <FieldSettings
            field={selectedField}
            allFields={form.fields}
            onChange={(patch) => updateField(selectedField.id, patch)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-6 text-center">
            Select a field to edit its settings
          </div>
        )}
      </div>

      <FieldTypePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onAdd={handleAdd}
      />
    </div>
  )
}
