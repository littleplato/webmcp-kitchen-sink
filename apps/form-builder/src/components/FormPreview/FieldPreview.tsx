import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Paperclip } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { FormField } from '@/types/form'

interface Props {
  field: FormField
  value: unknown
  onChange: (value: unknown) => void
}

export function FieldPreview({ field, value, onChange }: Props) {
  const [calOpen, setCalOpen] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)

  const labelEl = (
    <Label className="text-sm font-medium">
      {field.label}
      {field.required && <span className="text-destructive ml-1">*</span>}
    </Label>
  )

  const descEl = field.description ? (
    <p className="text-xs text-muted-foreground">{field.description}</p>
  ) : null

  function wrapper(children: React.ReactNode) {
    return (
      <div className="space-y-1.5">
        {labelEl}
        {descEl}
        {children}
      </div>
    )
  }

  switch (field.type) {
    case 'short_text':
      return wrapper(
        <Input
          type="text"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      )

    case 'long_text':
      return wrapper(
        <Textarea
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      )

    case 'number':
      return wrapper(
        <Input
          type="number"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      )

    case 'email':
      return wrapper(
        <Input
          type="email"
          placeholder={field.placeholder ?? 'email@example.com'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      )

    case 'phone':
      return wrapper(
        <Input
          type="tel"
          placeholder={field.placeholder ?? '+1 (555) 000-0000'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      )

    case 'multiple_choice':
      return wrapper(
        <RadioGroup
          value={String(value ?? '')}
          onValueChange={onChange}
          className="space-y-1.5"
        >
          {(field.options ?? []).map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
              <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'checkboxes': {
      const checked = Array.isArray(value) ? (value as string[]) : []
      return wrapper(
        <div className="space-y-1.5">
          {(field.options ?? []).map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <Checkbox
                id={`${field.id}-${opt}`}
                checked={checked.includes(opt)}
                onCheckedChange={(c) => {
                  if (c) onChange([...checked, opt])
                  else onChange(checked.filter((v) => v !== opt))
                }}
              />
              <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer">
                {opt}
              </Label>
            </div>
          ))}
        </div>
      )
    }

    case 'dropdown':
      return wrapper(
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={field.placeholder ?? 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'date': {
      const dateVal = value instanceof Date ? value : undefined
      return wrapper(
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger
            render={
              <button
                className={cn(
                  'inline-flex h-9 w-full items-center justify-start gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm font-normal transition-colors hover:bg-muted/50',
                  !dateVal && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="size-4" />
                {dateVal ? format(dateVal, 'PPP') : 'Pick a date'}
              </button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateVal}
              onSelect={(d) => {
                onChange(d)
                setCalOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      )
    }

    case 'rating': {
      const rating = typeof value === 'number' ? value : 0
      return wrapper(
        <div
          className="flex gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || rating)
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => onChange(star)}
                className="p-0.5 transition-transform hover:scale-110"
                aria-label={`Rate ${star} out of 5`}
              >
                <svg
                  className="size-7"
                  viewBox="0 0 24 24"
                  fill={filled ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ color: filled ? '#f59e0b' : undefined }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                  />
                </svg>
              </button>
            )
          })}
        </div>
      )
    }

    case 'yes_no':
      return wrapper(
        <div className="flex gap-2">
          <Button
            variant={value === 'yes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange('yes')}
          >
            Yes
          </Button>
          <Button
            variant={value === 'no' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange('no')}
          >
            No
          </Button>
        </div>
      )

    case 'file_upload':
      return wrapper(
        <label
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer text-center transition-colors hover:bg-muted/40'
          )}
        >
          <Paperclip className="size-5 text-muted-foreground" />
          {fileName ? (
            <span className="text-sm font-medium text-foreground">{fileName}</span>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Click to upload a file
              </span>
              <span className="text-xs text-muted-foreground">or drag and drop</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setFileName(file.name)
                onChange(file.name)
              }
            }}
          />
        </label>
      )
  }
}
