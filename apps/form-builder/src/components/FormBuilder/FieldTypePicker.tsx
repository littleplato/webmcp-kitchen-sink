import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getFieldIcon, getFieldLabel } from './FieldTypeIcon'
import type { FieldType } from '@/types/form'

const FIELD_TYPES: FieldType[] = [
  'short_text',
  'long_text',
  'multiple_choice',
  'checkboxes',
  'dropdown',
  'file_upload',
  'date',
  'number',
  'email',
  'phone',
  'rating',
  'yes_no',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (type: FieldType) => void
}

export function FieldTypePicker({ open, onOpenChange, onAdd }: Props) {
  const [hovered, setHovered] = useState<FieldType | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add a field</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {FIELD_TYPES.map((type) => {
            const Icon = getFieldIcon(type)
            return (
              <Button
                key={type}
                variant="outline"
                className={`flex flex-col h-auto gap-1.5 py-3 px-2 ${hovered === type ? 'border-primary' : ''}`}
                onMouseEnter={() => setHovered(type)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  onAdd(type)
                  onOpenChange(false)
                }}
              >
                <Icon className="size-4" />
                <span className="text-xs text-center leading-tight">{getFieldLabel(type)}</span>
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
