/**
 * CSV parsing + normalization for the UBP Networking Database export.
 *
 * Shared by the browser app (in-browser fallback import) and the build-time
 * encryption script, so both interpret the workbook identically.
 */

/* ------------------------------------------------------------------ */
/* CSV parsing (RFC 4180, tolerant of stray whitespace and BOM)        */
/* ------------------------------------------------------------------ */

/** @param {string} text @returns {string[][]} */
export function parseCSV(text) {
  const input = text.replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    // Drop fully empty rows.
    if (row.some((c) => c.trim() !== '')) rows.push(row)
    row = []
  }

  while (i < input.length) {
    const ch = input[i]

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }

    if (ch === '"' && field.trim() === '') {
      field = ''
      inQuotes = true
      i += 1
      continue
    }
    if (ch === ',') {
      pushField()
      i += 1
      continue
    }
    if (ch === '\r') {
      i += 1
      continue
    }
    if (ch === '\n') {
      pushRow()
      i += 1
      continue
    }
    field += ch
    i += 1
  }

  if (field !== '' || row.length) pushRow()
  return rows
}

/* ------------------------------------------------------------------ */
/* Header detection                                                    */
/* ------------------------------------------------------------------ */

const ALIASES = {
  name: ['name', 'full name', 'student name', 'alumni name', 'student/alumni name', 'alum'],
  firstName: ['first name', 'first', 'preferred name'],
  lastName: ['last name', 'last', 'surname'],
  classYear: [
    'class year',
    'class of',
    'graduation year',
    'grad year',
    'year graduated',
    'class',
  ],
  employer: ['employer', 'company', 'company name', 'firm', 'organization', 'employer name'],
  title: ['title', 'job title', 'position title', 'role', 'job role', 'position'],
  positionType: [
    'position type',
    'type of position',
    'offer type',
    'job type',
    'internship/full-time',
    'type',
  ],
  email: ['email', 'personal email', 'email address', 'e-mail', 'alumni email'],
  location: ['location', 'city', 'current location', 'city/state', 'current city'],
  industry: ['industry', 'sector', 'industry/sector'],
  degree: ['degree', 'program', 'program of study', 'major', 'concentration'],
  institution: ['institution', 'school', 'university', 'graduate school', 'grad school'],
}

const KEY_ORDER = [
  'email',
  'name',
  'firstName',
  'lastName',
  'employer',
  'title',
  'classYear',
  'positionType',
  'industry',
  'location',
  'degree',
  'institution',
]

/** @param {string} h */
export function normalizeHeader(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, '')
    .replace(/[^a-z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Map a header row to field indexes. Returns null when the row is not a header.
 * @param {string[]} row
 * @returns {Record<string, number> | null}
 */
export function mapHeader(row) {
  const cells = row.map(normalizeHeader)
  /** @type {Record<string, number>} */
  const map = {}

  for (const field of KEY_ORDER) {
    const aliases = ALIASES[field] || []
    let found = -1
    for (const alias of aliases) {
      const idx = cells.findIndex((c) => c === alias)
      if (idx !== -1) {
        found = idx
        break
      }
    }
    if (found === -1) {
      for (const alias of aliases) {
        if (alias.length < 4) continue // avoid "type" matching "prototype"
        const idx = cells.findIndex((c) => c.includes(alias))
        if (idx !== -1) {
          found = idx
          break
        }
      }
    }
    if (found !== -1) map[field] = found
  }

  // A real header needs enough signal to avoid matching prose rows.
  const score = ['name', 'email', 'employer', 'classYear', 'title'].filter(
    (f) => f in map,
  ).length
  return score >= 2 ? map : null
}

/* ------------------------------------------------------------------ */
/* Domain derivation                                                   */
/* ------------------------------------------------------------------ */

/** @typedef {ReturnType<typeof normalizeRows>[number]} Alum */

const EMPLOYER_NOISE =
  /\b(inc|llc|l\.l\.c|ltd|limited|corp|corporation|co|company|plc|group|holdings|& co\.?|and co\.?)\b\.?/g

/** @param {string} s */
export function employerKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(EMPLOYER_NOISE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** @type {Array<{realm:string, industry:string, test:RegExp, on:string}>} */
const EMPLOYER_RULES = [
  {
    realm: 'pe',
    industry: 'Private Equity / VC',
    on: 'employer',
    test: /blackstone|carlyle|apollo|kohlberg|\bkkr\b|warburg|tpg|bain capital|thoma bravo|vista equity|advent international|genstar|summit partners|carousel capital|pamlico|hexagon|equity group|insight partners|general atlantic|riverstone|ardian|cinven|permira|liberty mutual|vista point|falfurrias|spencer capital|ridgemont/,
  },
  {
    realm: 'ib',
    industry: 'Investment Banking',
    on: 'employer',
    test: /goldman|morgan stanley|jpmorgan|j\.?p\.? morgan|bank of america|merrill|citigroup|\bciti\b|barclays|\bubs\b|deutsche bank|evercore|lazard|centerview|moelis|houlihan|pjt|perella|jefferies|raymond james|wells fargo securities|baird|william blair|piper sandler|truist|pnc|hsbc|nomura|mizuho|\brbc\b|macquarie|santander|\bbnp\b|societe generale|rothschild|guggenheim|needham|stifel|oppenheimer|cowen|tudor pickering|brown brothers/i,
  },
  {
    realm: 'consulting',
    industry: 'Consulting',
    on: 'employer',
    test: /mckinsey|boston consulting|\bbcg\b|bain & company|\bbain\b|deloitte consulting|accenture|oliver wyman|kearney|strategy&|strategy and|ey.?parthenon|leka|alvarez|marsal|fti consulting|guidehouse|grant thornton consulting|slalom|west monroe|protiviti|robert w baird consulting|charles river associates|analysis group|cornerstone research|brattle/,
  },
  {
    realm: 'accounting',
    industry: 'Accounting',
    on: 'employer',
    test: /deloitte|pricewaterhouse|\bpwc\b|ernst & young|\bey\b|kpmg|grant thornton|\bbdo\b|\brsm\b|cbiz|moss adams|baker tilly|williams mullen|forvis|cherry bakaert/,
  },
  {
    realm: 'asset',
    industry: 'Asset & Wealth Mgmt',
    on: 'employer',
    test: /blackrock|vanguard|fidelity|state street|northern trust|franklin templeton|t\.? rowe|pimco|invesco|alliancebernstein|capital group|janus henderson|amundi|\bubs global asset|morgan stanley investment management|goldman sachs asset|wells fargo asset|lmcw|piedmont|bessemer trust|truist advisory|edward jones|raymond james financial|charles schwab|ameriprise|northwestern mutual|massmutual/,
  },
  {
    realm: 'sales',
    industry: 'Sales',
    on: 'employer',
    test: /salesforce|hubspot|gong|outreach\.io|red ventures|gartner|cintas|paychex|\badt\b|enterprise rent|grainger|fastenal|sysco|united rentals|docusign|zoominfo|sprout social|toast|procore|klaviyo|wayfair|carvana|oracle|sap|servicenow|workday/,
  },
  {
    realm: 'product',
    industry: 'Product & Tech',
    on: 'employer',
    test: /google|alphabet|microsoft|amazon|meta|apple|netflix|nvidia|openai|anthropic|stripe|uber|airbnb|palantir|snowflake|databricks|salesforce\.com|ibm|cisco|intel|adobe|atlassian|shopify|spotify|doordash|instacart|robinhood|coinbase|datadog|cloudflare|twilio|asana|notion|figma|linear|duolingo|lyft|pinterest|snap/,
  },
  {
    realm: 'realestate',
    industry: 'Real Estate',
    on: 'employer',
    test: /real estate|realty|properties|property|capital markets|jll|jones lang|cbre|cushman|colliers|hines|trammell crow|greystar|related|eqr|avalonbay|prologis|kimco|highwoods|grubb/,
  },
  {
    realm: 'healthcare',
    industry: 'Healthcare',
    on: 'employer',
    test: /health|medical|pharma|biotech|hospital|genentech|pfizer|merck|novartis|gsk|astrazeneca|unitedhealth|humana|cvs|aetna|anthem|elevance|laboratory corp|iqvia|syneos|parexel|medtronic|stryker|boston scientific/,
  },
  {
    realm: 'corpfin',
    industry: 'Corporate Finance',
    on: 'employer',
    test: /duke energy|honeywell|lowes|home depot|coca.?cola|pepsico|procter|p&g|johnson & johnson|general motors|ford|boeing|lockheed|caterpillar|deere|3m|ge |general electric|bank of america corporate|truist financial|wells fargo|northrop|lenovo|sealed air|sonoco|ingersoll|vF corporation|hanesbrands|labcorp|red hat|first citizens/,
  },
]

/** @type {Array<{realm:string, industry:string, test:RegExp}>} */
const TITLE_RULES = [
  { realm: 'pe', industry: 'Private Equity / VC', test: /private equity|venture capital|\bvc\b|growth equity|portfolio/ },
  { realm: 'ib', industry: 'Investment Banking', test: /investment banking|investment bank|\bm&a\b|mergers|leveraged finance|capital markets|equity research|sales & trading|sales and trading/ },
  { realm: 'consulting', industry: 'Consulting', test: /consultant|consulting|strategy analyst|case team/ },
  { realm: 'accounting', industry: 'Accounting', test: /audit|assurance|\btax\b|transaction advisory/ },
  { realm: 'asset', industry: 'Asset & Wealth Mgmt', test: /asset management|wealth|portfolio manager|investment analyst|equity analyst|fixed income|private wealth|financial advisor/ },
  { realm: 'sales', industry: 'Sales', test: /sales|account executive|business development|client partner|relationship manager|account manager|revenue/ },
  { realm: 'product', industry: 'Product & Tech', test: /product manager|software engineer|data scientist|data engineer|product analyst|engineering|developer|technical program/ },
  { realm: 'realestate', industry: 'Real Estate', test: /real estate|acquisitions|underwriting|asset manager|property/ },
  { realm: 'healthcare', industry: 'Healthcare', test: /clinical|health|medical|pharma|biotech/ },
  { realm: 'marketing', industry: 'Marketing', test: /marketing|brand|growth|content|communications|social media/ },
  { realm: 'ops', industry: 'Operations', test: /operations|supply chain|logistics|procurement|process/ },
  { realm: 'corpfin', industry: 'Corporate Finance', test: /financial analyst|fp&a|corporate finance|treasury|finance|accounting/ },
]

/**
 * @param {string} employer
 * @param {string} title
 * @returns {{realm:string, industry:string}}
 */
export function deriveRealm(employer, title) {
  const emp = String(employer || '').toLowerCase()
  const ttl = String(title || '').toLowerCase()

  for (const rule of EMPLOYER_RULES) {
    if (emp && rule.test.test(emp)) return { realm: rule.realm, industry: rule.industry }
  }
  for (const rule of TITLE_RULES) {
    if (ttl && rule.test.test(ttl)) return { realm: rule.realm, industry: rule.industry }
  }
  return { realm: 'other', industry: 'Other' }
}

/** @param {string} s */
function clean(s) {
  return String(s ?? '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;|]+|[\s,;|]+$/g, '')
    .trim()
}

/** @param {string} s */
function shortHash(s) {
  let h = 5381
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/** @param {string} s */
function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32)
}

/** @param {string} raw */
function parseClassYear(raw) {
  const m = String(raw || '').match(/(19|20)\d{2}/)
  if (!m) return /** @type {null} */ (null)
  const year = Number(m[0])
  return year >= 1990 && year <= 2035 ? year : null
}

/** @param {string} raw @returns {'Intern'|'Full-time'|'Unknown'} */
function parsePositionType(raw) {
  const s = String(raw || '').toLowerCase()
  if (!s.trim()) return 'Unknown'
  if (/intern|summer analyst|summer associate/.test(s)) return 'Intern'
  if (/full|graduate|entry|analyst program|rotational/.test(s)) return 'Full-time'
  return 'Unknown'
}

/**
 * Normalize parsed CSV rows into alumni records.
 * Handles workbooks that repeat section headers mid-sheet.
 *
 * @param {string[][]} rows
 * @returns {{records: Alum[], stats: {headerRow:number, headerMap:Record<string,number>, skipped:number}}}
 */
export function normalizeRows(rows) {
  let map = null
  let headerRow = -1
  let firstMap = {}
  let skipped = 0

  // Locate the first real header within the first 40 rows (skips the overview tab).
  for (let i = 0; i < Math.min(rows.length, 40); i += 1) {
    const candidate = mapHeader(rows[i])
    if (candidate) {
      map = candidate
      headerRow = i
      firstMap = candidate
      break
    }
  }

  /** @type {Alum[]} */
  const records = []
  if (!map) return { records, stats: { headerRow, headerMap: {}, skipped } }

  const get = (row, field) => {
    const idx = map[field]
    if (idx === undefined) return ''
    return clean(row[idx] ?? '')
  }

  const seen = new Set()

  for (let i = headerRow + 1; i < rows.length; i += 1) {
    const row = rows[i]

    // Section header repeats.
    const maybeHeader = mapHeader(row)
    if (maybeHeader) {
      map = maybeHeader
      continue
    }

    let name = get(row, 'name')
    const first = get(row, 'firstName')
    const last = get(row, 'lastName')
    if (!name && (first || last)) name = [first, last].filter(Boolean).join(' ')
    if (name.includes(',')) {
      const [lastName, firstName] = name.split(',').map((s) => s.trim())
      if (lastName && firstName) name = `${firstName} ${lastName}`
    }
    name = clean(name)

    const email = get(row, 'email').toLowerCase()
    const employer = get(row, 'employer')
    const title = get(row, 'title')

    if (!name && !email) {
      skipped += 1
      continue
    }

    // Skip obvious section labels / notes.
    if (/acceptances|post-grad education|networking database/i.test(name)) {
      skipped += 1
      continue
    }

    const key = `${name.toLowerCase()}|${employerKey(employer)}|${email}`
    if (seen.has(key)) {
      skipped += 1
      continue
    }
    seen.add(key)

    const parts = name.split(' ')
    const { realm, industry } = deriveRealm(employer, title)

    records.push({
      id: `${slug(name) || 'alum'}-${shortHash(key)}`,
      name: name || email.split('@')[0],
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' '),
      classYear: parseClassYear(get(row, 'classYear')),
      employer: employer || null,
      employerKey: employerKey(employer),
      title: title || null,
      positionType: parsePositionType(get(row, 'positionType')),
      industry: get(row, 'industry') || industry,
      realm,
      location: get(row, 'location') || null,
      email: email || null,
      degree: get(row, 'degree') || null,
    })
  }

  records.sort((a, b) => {
    const y = (b.classYear || 0) - (a.classYear || 0)
    return y !== 0 ? y : a.name.localeCompare(b.name)
  })

  return {
    records,
    stats: { headerRow, headerMap: firstMap, skipped },
  }
}

/** @param {string} text */
export function parseCSVToRecords(text) {
  return normalizeRows(parseCSV(text))
}
