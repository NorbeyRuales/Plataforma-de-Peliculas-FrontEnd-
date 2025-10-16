import { api } from './api'
import type { Movie, ID } from '../types'
export const Movies={list:(q?:string)=>api.get<Movie[]>(`/movies${q?`?q=${encodeURIComponent(q)}`:''}`),get:(id:ID)=>api.get<Movie>(`/movies/${id}`)}
