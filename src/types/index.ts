/**
 * @file index.ts
 * @description Shared TypeScript interfaces for API payloads.
 */

/** Generic identifier used throughout the API responses. */
export type ID = string

/**
 * Movie payload returned by the backend.
 */
export interface Movie {
  /** Unique identifier for the movie. */
  _id: ID
  /** Display title. */
  title: string
  /** Release year. */
  year: number
  /** Genre tags associated with the movie. */
  genres: string[]
  /** Optional poster URL. */
  posterUrl?: string
  /** Optional backdrop URL. */
  backdropUrl?: string
  /** Synopsis or long description. */
  description?: string
  /** Duration expressed in minutes. */
  durationMin?: number
  /** Average rating from all users. */
  avgRating?: number
  /** Streaming sources available for the movie. */
  sources?: {
    /** Human readable label, e.g. 1080p. */
    label: string
    /** Stream URL. */
    url: string
    /** Optional subtitles provided for the source. */
    subtitles?: string[]
  }[]
}

/**
 * User payload returned after authentication or profile queries.
 */
export interface User {
  /** Unique identifier for the user. */
  _id: ID
  /** Full name. */
  name: string
  /** Primary email address. */
  email: string
  /** Optional avatar URL. */
  avatarUrl?: string
  /** Auth token returned by the API. */
  token?: string
}

/**
 * Rating provided by a user for a given movie.
 */
export interface Rating {
  /** Unique identifier for the rating entry. */
  _id: ID
  /** Related movie identifier. */
  movieId: ID
  /** Authoring user identifier. */
  userId: ID
  /** Score (typically 1-5). */
  stars: number
  /** Optional textual review. */
  comment?: string
}

/**
 * Favorite relationship between a user and a movie.
 */
export interface Favorite {
  /** Unique identifier for the favorite entry. */
  _id: ID
  /** Related movie identifier. */
  movieId: ID
  /** Owner user identifier. */
  userId: ID
  /** Creation timestamp. */
  createdAt: string
}
