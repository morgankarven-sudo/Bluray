export interface Movie {
  id: string
  title: string
  year: number
  directors: string[]
  genres: string[]
  runtimeMinutes?: number
  synopsis: string
  posterUrl: string
  format?: string
  sample?: boolean
}

export type SortKey = 'title' | 'year'
