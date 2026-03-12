import type { ConditionRule } from '@/types/form'

export function evaluateCondition(
  rule: ConditionRule,
  answers: Record<string, unknown>
): boolean {
  const raw = answers[rule.fieldId]
  const answer = Array.isArray(raw) ? (raw as string[]).join(',') : String(raw ?? '')

  switch (rule.operator) {
    case 'equals':
      return answer === rule.value
    case 'not_equals':
      return answer !== rule.value
    case 'contains':
      return answer.includes(rule.value)
    case 'is_empty':
      return answer.trim() === ''
    case 'is_not_empty':
      return answer.trim() !== ''
  }
}
