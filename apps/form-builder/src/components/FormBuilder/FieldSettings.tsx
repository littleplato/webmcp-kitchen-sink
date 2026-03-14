import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { OptionsEditor } from './OptionsEditor'
import { ConditionBuilder } from './ConditionBuilder'
import { getFieldLabel } from './FieldTypeIcon'
import type { FormField } from '@/types/form'

const HIDE_PLACEHOLDER: FormField['type'][] = [
  'rating',
  'yes_no',
  'checkboxes',
  'date',
  'file_upload',
  'multiple_choice',
]

const SHOW_OPTIONS: FormField['type'][] = ['multiple_choice', 'checkboxes', 'dropdown']

interface Props {
  field: FormField
  allFields: FormField[]
  onChange: (patch: Partial<FormField>) => void
}

export function FieldSettings({ field, allFields, onChange }: Props) {
  return (
    <div className="p-5 space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {getFieldLabel(field.type)}
        </p>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label htmlFor="field-label" className="text-xs font-medium">
          Label
        </Label>
        <Input
          id="field-label"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="field-description" className="text-xs font-medium">
          Hint text
        </Label>
        <Input
          id="field-description"
          value={field.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value || undefined })}
          className="h-8 text-sm"
          placeholder="Optional help text"
        />
      </div>

      {!HIDE_PLACEHOLDER.includes(field.type) && (
        <div className="space-y-1.5">
          <Label htmlFor="field-placeholder" className="text-xs font-medium">
            Placeholder
          </Label>
          <Input
            id="field-placeholder"
            value={field.placeholder ?? ''}
            onChange={(e) => onChange({ placeholder: e.target.value || undefined })}
            className="h-8 text-sm"
            placeholder="Placeholder text"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="field-required" className="text-xs font-medium cursor-pointer">
          Required
        </Label>
        <Switch
          id="field-required"
          checked={field.required}
          onCheckedChange={(checked) => onChange({ required: checked })}
        />
      </div>

      {SHOW_OPTIONS.includes(field.type) && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-medium">Options</p>
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => onChange({ options })}
            />
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-medium">Conditional logic</p>
        <p className="text-xs text-muted-foreground">
          This field will only appear when all conditions are met.
        </p>
        <ConditionBuilder
          conditions={field.conditions}
          allFields={allFields}
          currentFieldId={field.id}
          onChange={(conditions) => onChange({ conditions })}
        />
      </div>
    </div>
  )
}
