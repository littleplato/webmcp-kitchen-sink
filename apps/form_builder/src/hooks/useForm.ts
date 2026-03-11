import { useState, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { Form, FormField, FieldType } from '@/types/form'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

const INITIAL_FORM: Form = {
  title: 'Untitled Form',
  description: 'Add a description for your form.',
  fields: [
    {
      id: 'field-1',
      type: 'short_text',
      label: 'Full name',
      required: false,
      conditions: [],
    },
    {
      id: 'field-2',
      type: 'email',
      label: 'Email address',
      required: true,
      conditions: [],
    },
    {
      id: 'field-3',
      type: 'multiple_choice',
      label: 'How did you hear about us?',
      required: false,
      options: ['Social media', 'Friend or colleague', 'Search engine'],
      conditions: [],
    },
  ],
}

export function useForm() {
  const [form, setForm] = useState<Form>(INITIAL_FORM)

  const addField = useCallback((type: FieldType): string => {
    const id = generateId()
    const newField: FormField = {
      id,
      type,
      label: type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
      required: false,
      conditions: [],
      ...(type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown'
        ? { options: ['Option 1', 'Option 2'] }
        : {}),
    }
    setForm((prev) => ({ ...prev, fields: [...prev.fields, newField] }))
    return id
  }, [])

  const removeField = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields
        .filter((f) => f.id !== id)
        .map((f) => ({
          ...f,
          conditions: f.conditions.filter((c) => c.fieldId !== id),
        })),
    }))
  }, [])

  const updateField = useCallback((id: string, patch: Partial<FormField>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }))
  }, [])

  const reorderFields = useCallback((activeId: string, overId: string) => {
    setForm((prev) => {
      const oldIndex = prev.fields.findIndex((f) => f.id === activeId)
      const newIndex = prev.fields.findIndex((f) => f.id === overId)
      return { ...prev, fields: arrayMove(prev.fields, oldIndex, newIndex) }
    })
  }, [])

  const updateFormMeta = useCallback((patch: Partial<Pick<Form, 'title' | 'description'>>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }, [])

  return { form, addField, removeField, updateField, reorderFields, updateFormMeta }
}
