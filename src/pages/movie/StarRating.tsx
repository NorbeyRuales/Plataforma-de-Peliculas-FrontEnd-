import { useState } from 'react';
import './StarRating.scss';
import { Star } from 'lucide-react';

interface StarRatingProps {
  movieId: string;
  initialRating?: number;
  onRate?: (rating: number) => void;
}

export default function StarRating({ movieId, initialRating = 0, onRate }: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState(0);

  const handleClick = async (value: number) => {
    setRating(value);
    if (onRate) onRate(value);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ movieId, rating: value }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error al guardar la calificación:', errorText);
      } else {
        console.log('✅ Calificación guardada correctamente');
      }
    } catch (error) {
      console.error('❌ Error de red o servidor:', error);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          className={`star-btn ${value <= (hovered || rating) ? 'active' : ''}`}
          onClick={() => handleClick(value)}
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Calificar con ${value} estrellas`}
        >
          <Star className="icon" size={24} />
        </button>
      ))}
    </div>
  );
}
