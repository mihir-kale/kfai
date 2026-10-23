import type { Alum } from './types'

type NormalizeResult = {
  records: Alum[]
  stats: {
    headerRow: number
    headerMap: Record<string, number>
    skipped: number
  }
}

export declare function parseCSV(text: string): string[][]
export declare function normalizeHeader(h: string): string
export declare function mapHeader(row: string[]): Record<string, number> | null
export declare function employerKey(s: string): string
export declare function deriveRealm(
  employer: string,
  title: string,
): { realm: string; industry: string }
export declare function normalizeRows(rows: string[][]): NormalizeResult
export declare function parseCSVToRecords(text: string): NormalizeResult
