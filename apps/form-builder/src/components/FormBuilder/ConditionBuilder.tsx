import { X, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { FormField, ConditionRule } from '@/types/form'

const OPERATORS: { value: ConditionRule['operator']; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
]

interface Props {
  conditions: ConditionRule[]
  allFields: FormField[]
  currentFieldId: string
  onChange: (conditions: ConditionRule[]) => void
}

export function ConditionBuilder({ conditions, allFields, currentFieldId, onChange }: Props) {
  const otherFields = allFields.filter((f) => f.id !== currentFieldId)

  function addCondition() {
    if (otherFields.length === 0) return
    onChange([
      ...conditions,
      { fieldId: otherFields[0]!.id, operator: 'equals', value: '' },
    ])
  }

  function updateCondition(index: number, patch: Partial<ConditionRule>) {
    onChange(conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  function removeCondition(index: number) {
    onChange(conditions.filter((_, i) => i !== index))
  }

  if (otherFields.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Add more fields to set up conditional logic.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {conditions.map((rule, index) => (
        <div key={index} className="flex items-start gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground pt-2 shrink-0">
            {index === 0 ? 'Show if' : 'AND'}
          </span>
          <Select
            value={rule.fieldId}
            onValueChange={(val) => { if (val) updateCondition(index, { fieldId: val }) }}
          >
            <SelectTrigger className="h-7 text-xs flex-1 min-w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {otherFields.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={rule.operator}
            onValueChange={(val) =>
              updateCondition(index, { operator: val as ConditionRule['operator'] })
            }
          >
            <SelectTrigger className="h-7 text-xs flex-1 min-w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty' && (
            <Input
              value={rule.value}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              className="h-7 text-xs flex-1 min-w-20"
              placeholder="value"
            />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => removeCondition(index)}
            aria-label="Remove condition"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={addCondition}
      >
        <Plus className="size-3.5" />
        Add condition
      </Button>
    </div>
  )
}
