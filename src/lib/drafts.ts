import type { Alum, Sender, TemplateId } from './types'

/* ------------------------------------------------------------------ */
/* Realm profiles — one per business function represented in the data  */
/* ------------------------------------------------------------------ */

export type RealmProfile = {
  key: string
  label: string
  workNoun: string
  /** Concrete tasks that used to eat junior hours. */
  changed: string
  /** The hiring-bar question, phrased to be asked out loud. */
  rubric: string
  /** What used to differentiate candidates and no longer does. */
  commoditized: string
  /** How this realm's relationship with AI differs from others. */
  aiAngle: string
  /** A hypothesis to test in a follow-up note. */
  signal: string
  probes: string[]
}

export const REALMS: Record<string, RealmProfile> = {
  ib: {
    key: 'ib',
    label: 'Investment Banking',
    workNoun: 'analyst work',
    changed: 'comps, three-statement models, and pitchbook pages',
    rubric:
      'Has the bar shifted from building a model fast to reviewing AI output and defending the assumptions behind it?',
    commoditized: 'Clean formatting and fast comps used to separate candidates. That is turning into table stakes.',
    aiAngle:
      'Banking is a trust and compliance business, so adoption looks very different from consulting or sales.',
    signal: 'the analyst job is splitting into people who can verify a model and people who can only produce one',
    probes: [
      'Which parts of the analyst stack — comps, three-statement models, CIMs, pitchbooks — are now automated or meaningfully faster?',
      'When AI produces the first draft of a model, what are you actually testing for in a first-year: judgment, error-catching, or client readiness?',
      'Are you seeing more candidates who cannot explain their own output? How do you screen for that?',
      'If juniors skip the grunt work, does the associate-to-VP learning curve change — or does something get lost?',
    ],
  },
  consulting: {
    key: 'consulting',
    label: 'Consulting',
    workNoun: 'consulting work',
    changed: 'secondary research, benchmarking, and first-draft slides',
    rubric:
      'Should case interviews now reward structuring and synthesis over arithmetic — and how do you test for judgment?',
    commoditized: 'Framework recall and slide polish are commoditized. Hypothesis discipline is not.',
    aiAngle:
      'Firms sell judgment, so the pressure lands on scoping and client trust rather than raw throughput.',
    signal: 'the analyst role is moving from building the deck to deciding what belongs in it',
    probes: [
      'Which parts of the analyst workflow — research, benchmarking, model building, deck production — are now automated?',
      'Has the case interview changed to test synthesis and judgment rather than calculation speed?',
      'What do you now screen for that you did not three years ago, and what stopped predicting success?',
      'When a client asks for something AI can draft in an hour, how does the engagement team justify the fee?',
    ],
  },
  sales: {
    key: 'sales',
    label: 'Sales',
    workNoun: 'sales work',
    changed: 'prospect research, discovery prep, and CRM hygiene',
    rubric: 'Are you hiring for research speed or for conversation quality and follow-through?',
    commoditized:
      'Personalization at scale is now cheap, so generic personalization stopped differentiating anyone.',
    aiAngle:
      'Sales has the clearest ROI story, so adoption is further along than in banking or consulting.',
    signal: 'AI absorbed the prep work, so the differentiator moved into the room',
    probes: [
      'What does an entry-level rep do all day now that prospecting research and first-touch drafting are automated?',
      'Are you hiring for different traits than two years ago — curiosity, call nerve, follow-through?',
      'How do you tell real personalization from AI-generated personalization in an outreach email?',
      'What quota-carrying skills do new hires lack that a business school could actually teach?',
    ],
  },
  asset: {
    key: 'asset',
    label: 'Asset & Wealth Management',
    workNoun: 'investment research work',
    changed: 'coverage memos, screening, and earnings-call summaries',
    rubric:
      'Do you want analysts who can build a thesis, or analysts who can stress-test an AI-generated one?',
    commoditized: 'Summarizing a 10-K quickly used to be a signal. Now it is a prompt.',
    aiAngle:
      'The work is benchmarked quarterly and regulated, so bad AI output gets expensive fast.',
    signal: 'reading speed stopped being scarce; knowing which question to ask of the filing is still scarce',
    probes: [
      'Which research tasks are now automated — screening, memo drafting, earnings summaries, data pulls?',
      'What does a strong junior analyst look like today versus three years ago?',
      'How do you check whether an AI-assisted thesis is actually the analyst’s own view?',
      'What should a student learn about valuation that a model cannot do for them?',
    ],
  },
  pe: {
    key: 'pe',
    label: 'Private Equity / Venture Capital',
    workNoun: 'deal work',
    changed: 'deal sourcing, diligence checklists, and IC memo drafts',
    rubric: 'Are you screening for pattern recognition or for verification discipline?',
    commoditized: 'Sourcing volume used to be a moat. AI flattened it.',
    aiAngle:
      'Small deal teams adopt tools personally and unevenly, so practice varies partner to partner.',
    signal: 'the diligence checklist is now free, so the edge is knowing which three items actually matter',
    probes: [
      'Where does AI show up in sourcing, diligence, and memo writing today?',
      'Has the bar for an entry-level associate moved from throughput to judgment?',
      'How do you catch a plausible-but-wrong AI answer in diligence?',
      'What would you want a student to practice before joining a deal team?',
    ],
  },
  corpfin: {
    key: 'corpfin',
    label: 'Corporate Finance',
    workNoun: 'FP&A work',
    changed: 'variance analysis, forecasting, and board reporting',
    rubric: 'Do FP&A hires now need data fluency alongside accounting fluency?',
    commoditized: 'Excel mechanics matter less. Explaining a variance to a CFO matters more.',
    aiAngle:
      'Corporate finance moves slowly because the systems of record are messy and the audit trail matters.',
    signal: 'the analyst who can reconcile AI output to the GL is worth more than the one who builds the fastest model',
    probes: [
      'Which month-end and forecasting tasks are automated or accelerated now?',
      'What does a strong entry-level financial analyst look like today versus three years ago?',
      'Where does AI output fail in your reporting cycle, and who catches it?',
      'What should a student learn about data and systems before their first FP&A role?',
    ],
  },
  accounting: {
    key: 'accounting',
    label: 'Accounting',
    workNoun: 'audit work',
    changed: 'tie-outs, workpapers, and disclosure drafting',
    rubric: 'Are juniors evaluated on preparation speed or on review and documentation quality?',
    commoditized: 'Ticking and tying was the first-year job. It is being automated.',
    aiAngle:
      'Audit is liability-driven, so adoption is gated by evidence standards, not by capability.',
    signal: 'the pipeline still needs people who understand the standard, not just the tool',
    probes: [
      'Which first-year tasks are now automated, and what replaced them?',
      'Has the hiring bar moved toward judgment and documentation quality?',
      'How do you verify AI-assisted workpapers, and what does that do to the review layer?',
      'What should accounting students learn that the software now handles?',
    ],
  },
  marketing: {
    key: 'marketing',
    label: 'Marketing',
    workNoun: 'marketing work',
    changed: 'copy variants, campaign reporting, and audience research',
    rubric: 'Do you now hire for taste and brand judgment because production got cheap?',
    commoditized: 'Producing ten ad variants took a week. Now it takes an afternoon.',
    aiAngle: 'Marketing has the loudest AI adoption and the weakest measurement discipline.',
    signal: 'generation is solved; deciding what is on-brand is not',
    probes: [
      'What parts of a junior marketer’s week are automated now?',
      'What do you look for in a portfolio or interview that you did not two years ago?',
      'How do you tell whether AI-generated work is actually on-brand?',
      'What should students practice — brief writing, measurement, taste — before graduating?',
    ],
  },
  product: {
    key: 'product',
    label: 'Product & Tech',
    workNoun: 'product work',
    changed: 'spec drafting, ticket triage, and first-pass QA',
    rubric: 'Are junior PMs and engineers hired for execution or for problem framing?',
    commoditized:
      'Basic coding fluency is increasingly assumed. Knowing what to build is the differentiator.',
    aiAngle:
      'Tech moves fastest and has the clearest productivity data — a useful contrast for other realms.',
    signal: 'junior engineers ship more, so review and test discipline became the bottleneck',
    probes: [
      'How has AI changed what a junior PM or engineer actually does all day?',
      'What do you screen for now that you did not three years ago?',
      'Where does AI-written code or spec work break down, and who catches it?',
      'What should a business student learn about building software before graduating?',
    ],
  },
  ops: {
    key: 'ops',
    label: 'Operations',
    workNoun: 'operations work',
    changed: 'process mapping, vendor analysis, and reporting',
    rubric: 'Do you need analysts who can redesign a workflow, not just run it?',
    commoditized: 'Report generation is automated. Exception handling is not.',
    aiAngle: 'Ops adoption is bottom-up and measured in hours saved, not in strategy decks.',
    signal: 'the people who get promoted find where the process breaks, not where it repeats',
    probes: [
      'Which reporting and analysis tasks are automated now?',
      'What does a strong entry-level operations analyst look like today?',
      'Where do AI tools fail in your process, and what does the human still own?',
      'What should students learn about process design before their first role?',
    ],
  },
  realestate: {
    key: 'realestate',
    label: 'Real Estate',
    workNoun: 'real estate work',
    changed: 'underwriting, market comps, and deal screening',
    rubric: 'Are you hiring for modeling speed or for conviction on a submarket?',
    commoditized: 'Spreading rent rolls and pulling comps used to take a week.',
    aiAngle:
      'The industry is document- and relationship-heavy, so adoption varies enormously by shop size.',
    signal: 'the model is faster; the submarket judgment still takes years',
    probes: [
      'Which underwriting and diligence tasks are now automated?',
      'What do you look for in an entry-level analyst that you did not three years ago?',
      'How do you verify AI-assisted underwriting assumptions?',
      'What should students learn about markets that a model cannot teach?',
    ],
  },
  healthcare: {
    key: 'healthcare',
    label: 'Healthcare',
    workNoun: 'healthcare work',
    changed: 'market access research, provider data pulls, and reporting',
    rubric: 'Does regulatory fluency now beat analytical speed?',
    commoditized: 'Literature summaries used to take days. That is now an afternoon.',
    aiAngle: 'Adoption is constrained by regulation and privacy, not by capability.',
    signal: 'the constraint is what you are allowed to put into the tool, not what the tool can do',
    probes: [
      'Where does AI show up in your day-to-day work?',
      'What do you screen for in entry-level hires that you did not three years ago?',
      'What compliance or privacy limits shape how your team uses these tools?',
      'What should students learn before entering healthcare-adjacent roles?',
    ],
  },
  other: {
    key: 'other',
    label: 'General Business',
    workNoun: 'entry-level work',
    changed: 'research, drafting, and reporting',
    rubric: 'Has the bar moved from execution speed to judgment and review?',
    commoditized: 'Tasks that used to take a junior a day now take an hour.',
    aiAngle: 'Adoption varies by team, so the honest answer is usually "it depends on the manager."',
    signal: 'the job is less about producing the artifact and more about knowing when it is wrong',
    probes: [
      'How do AI tools show up in your day-to-day work?',
      'What does a strong entry-level candidate look like today versus three years ago?',
      'Which skills did you expect new hires to have that they now lack?',
      'What would you want UNC students to learn or practice before they graduate?',
    ],
  },
}

export function realmOf(alum: Alum): RealmProfile {
  return REALMS[alum.realm] ?? REALMS.other
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const CURRICULUM_BULLET =
  "What you'd want UNC students to learn or practice before they graduate — and which skills that used to matter now matter less"

function greeting(alum: Alum): string {
  return `Hi ${alum.firstName || alum.name.split(' ')[0] || 'there'},`
}

function employerPhrase(alum: Alum): string {
  return alum.employer ? `at ${alum.employer}` : `in ${realmOf(alum).label.toLowerCase()}`
}

function rolePhrase(alum: Alum): string {
  if (alum.title && alum.employer) return `your work as ${article(alum.title)} at ${alum.employer}`
  if (alum.title) return `your work as ${article(alum.title)}`
  if (alum.employer) return `your work at ${alum.employer}`
  return `your path through ${realmOf(alum).label.toLowerCase()}`
}

function article(phrase: string): string {
  return /^[aeiou]/i.test(phrase.trim()) ? `an ${phrase}` : `a ${phrase}`
}

function shortYear(sender: Sender): string {
  const digits = String(sender.classYear || '').match(/\d{2,4}/)
  if (!digits) return ''
  const y = digits[0]
  return `'${y.length === 4 ? y.slice(2) : y}`
}

function signature(sender: Sender): string {
  const lines = ['Best,', sender.name || '[Your name]']
  const classYear = shortYear(sender)
  const affiliation = [classYear ? `UNC Kenan-Flagler ${classYear}` : 'UNC Kenan-Flagler', sender.org]
    .filter(Boolean)
    .join(' | ')
  if (affiliation) lines.push(affiliation)
  if (sender.email) lines.push(sender.email)
  if (sender.link) lines.push(sender.link)
  return lines.join('\n')
}

function senderIntro(sender: Sender): string {
  const who = sender.name || '[Your name]'
  const year = shortYear(sender)
  return `${who}, a UNC Kenan-Flagler${year ? ` ${year}` : ''} student`
}

function dates(): { label: string }[] {
  const out: { label: string }[] = []
  const d = new Date()
  d.setDate(d.getDate() + 1)
  let added = 0
  while (added < 3) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) {
      out.push({
        label: d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      })
      added += 1
    }
    d.setDate(d.getDate() + 1)
  }
  return out
}

const SLOTS = dates().map((d) => d.label)

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export type Draft = { subject: string; body: string }

export type TemplateMeta = {
  id: TemplateId
  label: string
  hint: string
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'outreach', label: 'Initial outreach', hint: 'Full ask — role-specific hooks, 20 minutes' },
  { id: 'short', label: 'Short ask', hint: '90 words for cold or high-volume sends' },
  { id: 'followup', label: 'Follow-up', hint: '5–7 days later, one new specific angle' },
  { id: 'schedule', label: 'Scheduling', hint: 'Confirm the call, three proposed windows' },
  { id: 'prep', label: 'Prep note', hint: 'Questions ahead of time, lowers their prep cost' },
  { id: 'thanks', label: 'Thank you', hint: 'Recap + the curriculum question' },
  { id: 'referral', label: 'Ask for a referral', hint: 'Wrong person, right team' },
  { id: 'final', label: 'Close the loop', hint: 'Last note, no guilt, easy out' },
]

export const VARIANT_COUNT = 3

export function buildDraft(
  template: TemplateId,
  alum: Alum,
  sender: Sender,
  variant = 0,
): Draft {
  const r = realmOf(alum)
  const v = ((variant % VARIANT_COUNT) + VARIANT_COUNT) % VARIANT_COUNT
  const hi = greeting(alum)
  const sig = signature(sender)
  const org = sender.org || 'Undergraduate Business Program'

  switch (template) {
    case 'outreach': {
      const subjects = [
        `UNC alum — 20 min on how AI is reshaping ${r.workNoun} ${alum.employer ? `at ${alum.employer}` : ''}`.trim(),
        `Quick research ask: AI and entry-level ${r.label.toLowerCase()} work`,
        `${alum.firstName || 'Hello'} — UNC student researching AI's impact on ${r.label.toLowerCase()}`,
      ]
      const openers = [
        `I'm ${senderIntro(sender)}, working on a research project for the ${org}. We're interviewing alumni in ${r.label.toLowerCase()} about how AI is changing what firms hire for and how the work actually gets done — the specific shifts, not the headline version.`,
        `I'm ${senderIntro(sender)}. I'm part of a small ${org} research team interviewing alumni in ${r.label.toLowerCase()} about how AI has changed hiring and day-to-day work. We're trying to get past "AI is changing everything" and into what actually changed.`,
        `I'm ${senderIntro(sender)}, and I'm researching how AI is reshaping entry-level ${r.label.toLowerCase()} roles for the ${org}.`,
      ]
      const asks = [
        `Would 20 minutes in the next two or three weeks work? I'm flexible, happy to send the questions ahead of time, and glad to work around your calendar.`,
        `Could I borrow 20 minutes before the end of the month? I'll send the questions in advance so there's no prep involved.`,
        `Is there a 20-minute window in the next few weeks that works? Happy to send a short agenda first so you can decide whether it's worth your time.`,
      ]
      const outs = [
        `If now isn't a good time, no problem at all — and if someone on your team is closer to this, I'd be grateful for a pointer.`,
        `If this isn't your area anymore, just say so and I'll stop pestering you. A redirect is just as useful.`,
        `And if you'd rather answer two of these over email instead of a call, that works too.`,
      ]
      return {
        subject: subjects[v],
        body: [
          hi,
          '',
          openers[v],
          '',
          `Given ${rolePhrase(alum)}, I'd especially value your take on:`,
          '',
          `1. Which parts of ${r.changed} are now automated or meaningfully faster — and what juniors do with the time back.`,
          `2. ${r.rubric}`,
          `3. ${CURRICULUM_BULLET}.`,
          '',
          asks[v],
          '',
          outs[v],
          '',
          sig,
        ].join('\n'),
      }
    }

    case 'short': {
      const subjects = [
        `20 min on AI + ${r.label.toLowerCase()}, ${alum.firstName || 'UNC alum'}?`,
        `UNC student — quick question on how AI changed your first years`,
        `${alum.employer || r.label} — 20 minutes for UNC curriculum research?`,
      ]
      return {
        subject: subjects[v],
        body: [
          hi,
          '',
          `I'm ${senderIntro(sender)}, researching how AI is changing entry-level ${r.label.toLowerCase()} work for the ${org}. Your path to ${alum.employer || r.label} is exactly the perspective we're missing.`,
          '',
          `Could I steal 20 minutes in the next few weeks? Three questions: what's automated in ${r.changed}, ${lowerFirst(r.rubric)} and what you'd want students to learn before graduating.`,
          '',
          `Happy to send them ahead of time, and glad to work around your calendar.`,
          '',
          sig,
        ].join('\n'),
      }
    }

    case 'followup': {
      const subjects = [
        `Following up — AI and entry-level ${r.label.toLowerCase()} work`,
        `Re: UNC alum — 20 min on AI in ${r.label.toLowerCase()}?`,
        `One more try, then I'll leave you alone`,
      ]
      const middles = [
        `One thing I'm hearing from other ${r.label.toLowerCase()} alumni: ${r.signal}. I'd like to test that against what you're seeing ${employerPhrase(alum)}.`,
        `A pattern keeps coming up in these conversations: ${r.signal}. Curious whether that matches ${alum.employer || 'your firm'} or whether it looks different from the inside.`,
        `I've now spoken with a handful of people in ${r.label.toLowerCase()}, and the disagreement is interesting: ${r.signal}. Yours would be a useful data point either way.`,
      ]
      return {
        subject: subjects[v],
        body: [
          hi,
          '',
          `Floating this back up in case it got buried.`,
          '',
          middles[v],
          '',
          `Still just 20 minutes, questions sent ahead. If a call is too much, a two-line reply on whether the entry-level bar has actually moved would be genuinely useful.`,
          '',
          sig,
        ].join('\n'),
      }
    }

    case 'schedule': {
      return {
        subject: `Re: AI + ${r.label.toLowerCase()} — scheduling 20 minutes`,
        body: [
          hi,
          '',
          `Thanks for saying yes — I know calendar time is expensive.`,
          '',
          `Would any of these work?`,
          '',
          `• ${SLOTS[0]}, 9:00–9:20am ET`,
          `• ${SLOTS[1]}, 12:00–12:20pm ET`,
          `• ${SLOTS[2]}, 4:00–4:20pm ET`,
          '',
          `Twenty minutes, Zoom or phone, whichever you prefer. I'll send the questions beforehand so there's no prep. If none of those fit, send me two windows that do and I'll make one work.`,
          '',
          sig,
        ].join('\n'),
      }
    }

    case 'prep': {
      return {
        subject: `Questions for our chat — AI and ${r.label.toLowerCase()} at ${alum.employer || 'your firm'}`,
        body: [
          hi,
          '',
          `Ahead of our conversation, here's what I'm hoping to cover. No prep needed — these are just so you know where I'll push.`,
          '',
          ...r.probes.map((q, i) => `${i + 1}. ${q}`),
          `${r.probes.length + 1}. ${CURRICULUM_BULLET}?`,
          '',
          `If any of these touch client specifics or pending deals, say so and I'll steer around them. I'm mostly after how the work and the hiring bar have changed, not anything confidential.`,
          '',
          sig,
        ].join('\n'),
      }
    }

    case 'thanks': {
      return {
        subject: `Thank you — ${r.label.toLowerCase()} research`,
        body: [
          hi,
          '',
          `Thank you for the time today, and for being specific rather than diplomatic. Two things I'm taking away:`,
          '',
          `• [the shift they described that changed your thinking]`,
          `• [the skill or gap they named that UNC should address]`,
          '',
          `I'll send the synthesis once this round of interviews wraps — happy to share it with you before it goes anywhere else.`,
          '',
          `One last ask, since it's the crux of the project: what would you want UNC students to learn or practice before they graduate? Even one sentence is useful.`,
          '',
          sig,
        ].join('\n'),
      }
    }

    case 'referral': {
      return {
        subject: `Right person for this? AI + ${r.label.toLowerCase()} at ${alum.employer || 'your firm'}`,
        body: [
          hi,
          '',
          `I may be asking the wrong person, and I'd rather not waste your time.`,
          '',
          `Is there someone ${employerPhrase(alum)} who owns how ${r.label.toLowerCase()} analysts are hired or trained? A name and a two-line intro would go a long way.`,
          '',
          `Happy to send a short blurb you can forward so it's zero work on your end.`,
          '',
          sig,
        ].join('\n'),
      }
    }

    case 'final': {
      const subjects = [
        `Last note from me — UNC research on AI and ${r.label.toLowerCase()}`,
        `Closing the loop on this one`,
        `I'll stop here — one last ask`,
      ]
      return {
        subject: subjects[v],
        body: [
          hi,
          '',
          `Last note from me on this, and then I'll leave you alone.`,
          '',
          `The ask is still just 20 minutes on how AI has changed ${r.changed} and what you now look for in entry-level hires. If it's a no or the timing is wrong, just say so — that's a perfectly good answer.`,
          '',
          `And if there's someone closer to this, I'd take a name and run with it.`,
          '',
          sig,
        ].join('\n'),
      }
    }
  }
}

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

export function mailto(alum: Alum, draft: Draft): string {
  const to = alum.email || ''
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    draft.subject,
  )}&body=${encodeURIComponent(draft.body)}`
}
