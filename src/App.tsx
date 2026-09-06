import { useEffect, useMemo, useState } from 'react'
import type { Movie, SortKey } from './types'
import './App.css'

function formatRuntime(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function PosterImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <div className={`poster-fallback ${className ?? ''}`.trim()}>{alt}</div>
  }
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('all')
  const [director, setDirector] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [selected, setSelected] = useState<Movie | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${import.meta.env.BASE_URL}movies.json`)
        if (!res.ok) throw new Error(`Failed to load movies.json (${res.status})`)
        const data = (await res.json()) as Movie[]
        if (!cancelled) setMovies(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load catalog')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [selected])

  const genres = useMemo(() => {
    const set = new Set<string>()
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [movies])

  const directors = useMemo(() => {
    const set = new Set<string>()
    movies.forEach((m) => m.directors.forEach((d) => set.add(d)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [movies])

  const hasSamples = useMemo(() => movies.some((m) => m.sample), [movies])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = movies.filter((m) => {
      if (q && !m.title.toLowerCase().includes(q)) return false
      if (genre !== 'all' && !m.genres.includes(genre)) return false
      if (director !== 'all' && !m.directors.includes(director)) return false
      return true
    })
    list.sort((a, b) => {
      if (sortKey === 'year') {
        if (a.year !== b.year) return b.year - a.year
        return a.title.localeCompare(b.title)
      }
      const byTitle = a.title.localeCompare(b.title)
      if (byTitle !== 0) return byTitle
      return b.year - a.year
    })
    return list
  }, [movies, query, genre, director, sortKey])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading catalog…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Blu-ray Catalog</h1>
        <p>Browse your disc collection — posters, genres, and details.</p>
      </header>

      {hasSamples && (
        <div className="sample-banner" role="status">
          <strong>Sample movies</strong>
          <span>— replace with your collection in <code>public/movies.json</code></span>
        </div>
      )}

      <section className="controls" aria-label="Catalog filters">
        <input
          className="search"
          type="search"
          placeholder="Search by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search by title"
        />
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="all">All genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="director">Director</label>
            <select
              id="director"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
            >
              <option value="all">All directors</option>
              {directors.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="sort">Sort</label>
            <select
              id="sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="title">Title (A–Z)</option>
              <option value="year">Year (newest)</option>
            </select>
          </div>
        </div>
      </section>

      <div className="meta-row">
        <span>
          {filtered.length} movie{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No movies match your filters.</div>
      ) : (
        <div className="grid" role="list">
          {filtered.map((movie) => (
            <button
              key={movie.id}
              type="button"
              className="card"
              role="listitem"
              onClick={() => setSelected(movie)}
              aria-label={`${movie.title} (${movie.year})`}
            >
              <div className="poster-wrap">
                {movie.sample && <span className="sample-badge">Sample</span>}
                <PosterImage src={movie.posterUrl} alt={movie.title} />
              </div>
              <div className="card-body">
                <h2 className="card-title">{movie.title}</h2>
                <p className="card-meta">
                  {movie.year}
                  {movie.directors[0] ? ` · ${movie.directors[0]}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="movie-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <button
                type="button"
                className="close-btn"
                aria-label="Close details"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-poster">
                {selected.sample && <span className="sample-badge">Sample</span>}
                <PosterImage src={selected.posterUrl} alt={selected.title} />
              </div>
              <div className="modal-info">
                <h2 id="movie-title">{selected.title}</h2>
                <p className="modal-sub">
                  {selected.year}
                  {selected.format ? ` · ${selected.format}` : ''}
                  {formatRuntime(selected.runtimeMinutes)
                    ? ` · ${formatRuntime(selected.runtimeMinutes)}`
                    : ''}
                </p>
                <div className="chips">
                  {selected.sample && <span className="chip sample">Sample</span>}
                  {selected.directors.map((d) => (
                    <span className="chip" key={`d-${d}`}>
                      {d}
                    </span>
                  ))}
                  {selected.genres.map((g) => (
                    <span className="chip" key={`g-${g}`}>
                      {g}
                    </span>
                  ))}
                </div>
                <p className="synopsis">{selected.synopsis}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
