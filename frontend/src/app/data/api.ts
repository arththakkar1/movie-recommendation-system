/**
 * API client for the CineMatch Django backend.
 * Replaces the mock data module with real API calls.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/movies";

export interface Movie {
  title: string;
  poster: string;
  genres: string[];
  score: number;
}

export interface SearchResult {
  matched: string | null;
  movie_id: number | null;
  is_exact: boolean;
}

interface RecommendationItem {
  movie_id: number;
  title: string;
  poster: string;
  genres: string[];
  score: number;
}

/**
 * Fuzzy-search for a movie title.
 * GET /api/movies/search/?q=<query>
 */
export async function resolveTitle(
  query: string
): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return { matched: null, movie_id: null, is_exact: false };

  const res = await fetch(
    `${API_BASE}/search/?q=${encodeURIComponent(trimmed)}`
  );
  if (!res.ok) return { matched: null, movie_id: null, is_exact: false };
  return res.json();
}

/**
 * Get recommendations for a movie.
 * GET /api/movies/<movie_id>/recommendations/?w_sim=0.7&w_vote=0.2&w_pop=0.1&top_k=10
 */
export async function getRecommendations(
  movieId: number,
  wSim: number = 0.7,
  wVote: number = 0.2,
  wPop: number = 0.1,
  topK: number = 10
): Promise<Movie[]> {
  const params = new URLSearchParams({
    w_sim: wSim.toFixed(2),
    w_vote: wVote.toFixed(2),
    w_pop: wPop.toFixed(2),
    top_k: topK.toString(),
  });

  const res = await fetch(
    `${API_BASE}/${movieId}/recommendations/?${params}`
  );
  if (!res.ok) return [];

  const data: RecommendationItem[] = await res.json();
  return data.map((item) => ({
    title: item.title,
    poster: item.poster,
    genres: item.genres,
    score: item.score,
  }));
}

/**
 * Get popular seed titles for quick-search chips.
 * GET /api/movies/seed-titles/
 */
export async function getSeedTitles(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/seed-titles/`);
  if (!res.ok) return [];
  return res.json();
}
