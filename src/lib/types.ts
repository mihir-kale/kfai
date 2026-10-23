export type PositionType = 'Intern' | 'Full-time' | 'Unknown'

export type Alum = {
  id: string
  name: string
  firstName: string
  lastName: string
  classYear: number | null
  employer: string | null
  employerKey: string
  title: string | null
  positionType: PositionType
  industry: string
  realm: string
  location: string | null
  email: string | null
  degree: string | null
}

export type Sender = {
  name: string
  email: string
  classYear: string
  org: string
  link: string
}

export type OutreachStatus =
  | 'new'
  | 'queued'
  | 'sent'
  | 'replied'
  | 'scheduled'
  | 'done'
  | 'skip'

export type StatusEntry = {
  status: OutreachStatus
  updatedAt: number
  note?: string
}

export type EncryptedPayload = {
  v: number
  kdf: 'PBKDF2-SHA256'
  iterations: number
  salt: string
  iv: string
  ciphertext: string
  gzip: boolean
  meta: {
    count: number
    generatedAt: string
    demo: boolean
    label: string
  }
}

export type TemplateId =
  | 'outreach'
  | 'short'
  | 'followup'
  | 'schedule'
  | 'prep'
  | 'thanks'
  | 'referral'
  | 'final'
