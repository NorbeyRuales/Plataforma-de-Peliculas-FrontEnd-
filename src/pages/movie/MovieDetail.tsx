// src/pages/movie/MovieDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./MovieDetail.scss";
import { api } from "../../services/api";
import { getRandomPexelsVideo } from "../../services/pexelsServices";

type Movie = {
  id: string | number;
  title: string;
  description?: string;
  posterUrl?: string;
  streamUrl?: string;
};

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLVideoElement>(null);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [pexelsVideoUrl, setPexelsVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [added, setAdded] = useState(false);

  // 🔹 Cargar película desde el backend
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const resp = await api.get<Movie | { movie: Movie }>(`/movies/${id}`);
        const m = (resp as any)?.movie ?? resp;
        setMovie(m as Movie);
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar la película");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 🔹 Si la película no tiene streamUrl, obtener uno de Pexels
  useEffect(() => {
    if (!movie?.title || movie.streamUrl) return;

    let canceled = false;

    (async () => {
      try {
        let url = await getRandomPexelsVideo(movie.title);
        if (!url) url = await getRandomPexelsVideo("cinema"); // fallback
        if (!canceled && url) setPexelsVideoUrl(url);
      } catch (err) {
        console.error("Error obteniendo video de Pexels:", err);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [movie?.title]);

  // 🔹 Añadir a favoritos
  async function addToList() {
    try {
      await api.post("/favorites", { movieId: id });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (e: any) {
      alert(e?.message || "No se pudo añadir a la lista");
    }
  }

  // 🔹 Estados de carga o error
  if (loading)
    return (
      <section className="container">
        <p aria-busy="true">Cargando…</p>
      </section>
    );
  if (error)
    return (
      <section className="container">
        <p role="alert" style={{ color: "salmon" }}>
          {error}
        </p>
      </section>
    );
  if (!movie) return null;

  // 🔹 Determinar qué video mostrar
  const videoSrc = movie.streamUrl || pexelsVideoUrl || undefined;

  return (
    <section className="container movie-detail">
      <div className="topbar">
        <h1>{movie.title}</h1>
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
      </div>

      <div className="player" style={{ margin: "1rem 0" }}>
        <video
          ref={playerRef}
          id="player"
          controls
          poster={movie.posterUrl}
          src={videoSrc}
          style={{ width: "100%", maxWidth: 960, borderRadius: 8 }}
        />
        <div className="row" style={{ marginTop: ".5rem" }}>
          <button className="btn primary" onClick={addToList}>
            Añadir a lista
          </button>
        </div>
        {added && <p role="status" className="muted">Añadida a tu lista</p>}
      </div>

      {movie.description && (
        <>
          <label className="sr-only" htmlFor="desc">
            Descripción
          </label>
          <textarea
            id="desc"
            className="description"
            defaultValue={movie.description}
            rows={4}
          />
        </>
      )}
    </section>
  );
}
