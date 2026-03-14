import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface OptionItem {
  id: string
  value: string
}

function toItems(options: string[]): OptionItem[] {
  return options.map((v, i) => ({ id: `opt-${i}-${v}`, value: v }))
}

interface OptionRowProps {
  item: OptionItem
  onChange: (value: string) => void
  onRemove: () => void
}

function OptionRow({ item, onChange, onRemove }: OptionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1.5">
      <button
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-3.5" />
      </button>
      <Input
        value={item.value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-sm flex-1"
        placeholder="Option text"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive shrink-0"
        onClick={onRemove}
        aria-label="Remove option"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}

interface Props {
  options: string[]
  onChange: (options: string[]) => void
}

export function OptionsEditor({ options, onChange }: Props) {
  const [items, setItems] = useState<OptionItem[]>(() => toItems(options))

  useEffect(() => {
    setItems(toItems(options))
  }, [options])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      const next = arrayMove(items, oldIndex, newIndex)
      setItems(next)
      onChange(next.map((i) => i.value))
    },
    [items, onChange]
  )

  const handleChange = useCallback(
    (index: number, value: string) => {
      const next = items.map((item, i) => (i === index ? { ...item, value } : item))
      setItems(next)
      onChange(next.map((i) => i.value))
    },
    [items, onChange]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const next = items.filter((_, i) => i !== index)
      setItems(next)
      onChange(next.map((i) => i.value))
    },
    [items, onChange]
  )

  const handleAdd = useCallback(() => {
    const newItem: OptionItem = { id: `opt-new-${Date.now()}`, value: '' }
    const next = [...items, newItem]
    setItems(next)
    onChange(next.map((i) => i.value))
  }, [items, onChange])

  return (
    <div className="space-y-1.5">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <OptionRow
              key={item.id}
              item={item}
              onChange={(val) => handleChange(index, val)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={handleAdd}
      >
        <Plus className="size-3.5" />
        Add option
      </Button>
    </div>
  )
}
