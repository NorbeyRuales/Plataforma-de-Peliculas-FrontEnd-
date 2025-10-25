import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

/**
* Try both variants of the backend endpoint:
* - /pexels/:query
* - /pexels?query=
* Returns the video URL or null without breaking the stream.
*/
export const getRandomPexelsVideo = async (query: string = "cinema"): Promise<string | null> => {
    const candidates = [
        `${API_BASE_URL}/pexels/${encodeURIComponent(query)}`,
        `${API_BASE_URL}/pexels?query=${encodeURIComponent(query)}`,
    ];

    for (const url of candidates) {
        try {
            const res = await axios.get(url);
            const urlOut: string | null = res?.data?.videoUrl ?? res?.data?.url ?? null;
            if (urlOut) return urlOut;
        } catch {
            // try the next candidate
        }
    }
    return null;
};
