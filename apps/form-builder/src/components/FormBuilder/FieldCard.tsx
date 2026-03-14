import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFieldIcon, getFieldLabel } from './FieldTypeIcon'
import { cn } from '@/lib/utils'
import type { FormField } from '@/types/form'

interface Props {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

export function FieldCard({ field, isSelected, onSelect, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = getFieldIcon(field.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3 cursor-pointer select-none transition-colors',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
        isDragging && 'opacity-50'
      )}
      onClick={onSelect}
    >
      <button
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none shrink-0"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      <Icon className="size-4 shrink-0 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{field.label}</span>
        <span className="text-xs text-muted-foreground">{getFieldLabel(field.type)}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {field.required && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            Required
          </Badge>
        )}
        {field.conditions.length > 0 && (
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            Conditional
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label="Remove field"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
