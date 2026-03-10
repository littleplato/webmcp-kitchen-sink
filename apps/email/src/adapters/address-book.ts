export const ADDRESS_BOOK: Record<string, string> = {
  "John Smith": "john.smith@company.com",
  "Sarah Johnson": "sarah.johnson@company.com",
  "Michael Chen": "michael.chen@company.com",
  "Emily Davis": "emily.davis@company.com",
  "Alex Rodriguez": "alex.rodriguez@company.com",
}

export async function lookupAddresses(names: string[]): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 1800))
  return names.map((name) => ADDRESS_BOOK[name] ?? name)
}
