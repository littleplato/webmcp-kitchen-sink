import type { LucideIcon } from 'lucide-react'
import {
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ListFilter,
  Paperclip,
  Calendar,
  Hash,
  Mail,
  Phone,
  Star,
  ToggleLeft,
} from 'lucide-react'
import type { FieldType } from '@/types/form'

const FIELD_ICONS: Record<FieldType, LucideIcon> = {
  short_text: Type,
  long_text: AlignLeft,
  multiple_choice: CircleDot,
  checkboxes: CheckSquare,
  dropdown: ListFilter,
  file_upload: Paperclip,
  date: Calendar,
  number: Hash,
  email: Mail,
  phone: Phone,
  rating: Star,
  yes_no: ToggleLeft,
}

const FIELD_LABELS: Record<FieldType, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  multiple_choice: 'Multiple Choice',
  checkboxes: 'Checkboxes',
  dropdown: 'Dropdown',
  file_upload: 'File Upload',
  date: 'Date',
  number: 'Number',
  email: 'Email',
  phone: 'Phone',
  rating: 'Rating',
  yes_no: 'Yes / No',
}

export function getFieldIcon(type: FieldType): LucideIcon {
  return FIELD_ICONS[type]
}

export function getFieldLabel(type: FieldType): string {
  return FIELD_LABELS[type]
}
