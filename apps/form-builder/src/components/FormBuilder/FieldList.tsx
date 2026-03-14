import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FieldCard } from './FieldCard'
import type { FormField } from '@/types/form'

interface Props {
  fields: FormField[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
}

export function FieldList({ fields, selectedId, onSelect, onRemove, onReorder }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeField = fields.find((f) => f.id === activeId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id))
  }

  if (fields.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No fields yet. Add a field to get started.
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              isSelected={field.id === selectedId}
              onSelect={() => onSelect(field.id)}
              onRemove={() => onRemove(field.id)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeField ? (
          <FieldCard
            field={activeField}
            isSelected={false}
            onSelect={() => {}}
            onRemove={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
