import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'

type Movie = {
    id: string | number
    title: string
    posterUrl?: string
}

export default function Movies() {
    const [params] = useSearchParams()
    const q = params.get('q') || ''

    const [items, setItems] = useState<Movie[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()

    useEffect(() => {
        (async () => {
            setLoading(true); setError(undefined)
            try {
                const data = await api.get<any>(`/movies${q ? `?q=${encodeURIComponent(q)}` : ''}`)
                const list: Movie[] = Array.isArray(data) ? data : (data?.results ?? [])
                setItems(list)
            } catch (e: any) {
                setError(e?.message || 'No se pudo cargar el listado')
            } finally {
                setLoading(false)
            }
        })()
    }, [q])

    if (loading) return <section className="container"><p aria-busy="true">Cargando…</p></section>
    if (error) return <section className="container"><p role="alert" style={{ color: 'salmon' }}>{error}</p></section>

    return (
        <section className="container">
            <h1>Películas {q && <small>— “{q}”</small>}</h1>

            {!items.length ? (
                <p>No hay resultados {q && <>para <strong>{q}</strong></>}.</p>
            ) : (
                <ul className="grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))' }}>
                    {items.map(m => (
                        <li key={m.id} className="card" style={{ background: '#fff', color: '#111', borderRadius: 8, padding: '.5rem' }}>
                            <Link to={`/movie/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img
                                    src={m.posterUrl || 'https://via.placeholder.com/300x450?text=Poster'}
                                    alt={m.title}
                                    style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 6, marginBottom: '.5rem' }}
                                />
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>{m.title}</h3>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
