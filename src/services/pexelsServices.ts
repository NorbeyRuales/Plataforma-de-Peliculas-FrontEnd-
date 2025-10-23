// src/services/pexelsServices.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getRandomPexelsVideo = async (query: string = "cinema") => {
    try {
        const res = await axios.get(`${API_BASE_URL}/pexels/${encodeURIComponent(query)}`);
        // ⚡ Cambiado de res.data.url a res.data.videoUrl
        return res.data.videoUrl ?? null;
    } catch (err) {
        console.error("Error al obtener video de Pexels:", err);
        return null;
    }
};