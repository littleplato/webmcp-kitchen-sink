export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'file_upload'
  | 'date'
  | 'number'
  | 'email'
  | 'phone'
  | 'rating'
  | 'yes_no'

export interface ConditionRule {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty'
  value: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  description?: string
  placeholder?: string
  required: boolean
  options?: string[]
  conditions: ConditionRule[]
}

export interface Form {
  title: string
  description: string
  fields: FormField[]
}
