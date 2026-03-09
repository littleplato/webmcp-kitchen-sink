export type Email = {
  id: string
  name: string
  email: string
  subject: string
  date: string
  teaser: string
  body: string
  read: boolean
}

export const emails: Email[] = [
  {
    id: "1",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting Tomorrow",
    date: "09:34 AM",
    teaser:
      "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    body: "Hi team,\n\nJust a reminder about our meeting tomorrow at 10 AM. Please come prepared with your project updates.\n\nThe agenda will cover:\n- Q3 progress review\n- Blockers and dependencies\n- Next sprint planning\n\nSee you then!\n\nWilliam",
    read: false,
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alicesmith@example.com",
    subject: "Re: Project Update",
    date: "Yesterday",
    teaser:
      "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    body: "Thanks for the update. The progress looks great so far.\n\nLet's schedule a call to discuss the next steps. I'm free Tuesday or Wednesday afternoon if that works for you.\n\nAlice",
    read: false,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bobjohnson@example.com",
    subject: "Weekend Plans",
    date: "2 days ago",
    teaser:
      "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    body: "Hey everyone!\n\nI'm thinking of organizing a team outing this weekend. Would you be interested in a hiking trip or a beach day?\n\nLet me know your preferences and I'll book something.\n\nCheers,\nBob",
    read: true,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emilydavis@example.com",
    subject: "Re: Question about Budget",
    date: "2 days ago",
    teaser:
      "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    body: "I've reviewed the budget numbers you sent over.\n\nCan we set up a quick call to discuss some potential adjustments? I have a few suggestions that might help us stay within scope without cutting quality.\n\nBest,\nEmily",
    read: true,
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michaelwilson@example.com",
    subject: "Important Announcement",
    date: "1 week ago",
    teaser:
      "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    body: "Please join us for an all-hands meeting this Friday at 3 PM.\n\nWe have some exciting news to share about the company's future direction. Attendance is strongly encouraged for all team members.\n\nDial-in details will be shared by Thursday.\n\nMichael",
    read: true,
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarahbrown@example.com",
    subject: "Re: Feedback on Proposal",
    date: "1 week ago",
    teaser:
      "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    body: "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\n\nCould we schedule a meeting to discuss my feedback in detail? Overall it looks solid but I have some concerns about the timeline in section 3.\n\nSarah",
    read: true,
  },
]

export const drafts: Email[] = []
