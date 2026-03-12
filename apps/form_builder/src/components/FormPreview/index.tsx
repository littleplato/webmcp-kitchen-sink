import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldPreview } from './FieldPreview'
import { evaluateCondition } from '@/lib/conditions'
import type { Form } from '@/types/form'

interface Props {
  form: Form
}

export function FormPreview({ form }: Props) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})

  const visibleFields = form.fields.filter((field) => {
    if (field.conditions.length === 0) return true
    return field.conditions.every((rule) => evaluateCondition(rule, answers))
  })

  function handleSubmit() {
    alert('Form submitted!')
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-xl mx-auto py-10 px-4 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {visibleFields.map((field) => (
            <FieldPreview
              key={field.id}
              field={field}
              value={answers[field.id]}
              onChange={(value) =>
                setAnswers((prev) => ({ ...prev, [field.id]: value }))
              }
            />
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Submit
        </Button>
      </div>
    </div>
  )
}
