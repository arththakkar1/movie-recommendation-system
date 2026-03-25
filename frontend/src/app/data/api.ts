/**
 * API client for the CineMatch Django backend.
 * Now includes robust in-memory caching and prefetching.
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

// Caches mapping a query or movieId+weights to a Promise of the result
const resolveCache = new Map<string, Promise<SearchResult>>();
const recsCache = new Map<string, Promise<Movie[]>>();
let seedTitlesCache: Promise<string[]> | null = null;

/**
 * Fuzzy-search for a movie title.
 * GET /api/movies/search/?q=<query>
 */
export function resolveTitle(query: string): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return Promise.resolve({ matched: null, movie_id: null, is_exact: false });

  if (resolveCache.has(trimmed)) {
    return resolveCache.get(trimmed)!;
  }

  const promise = fetch(`${API_BASE}/search/?q=${encodeURIComponent(trimmed)}`)
    .then((res) => {
      if (!res.ok) return { matched: null, movie_id: null, is_exact: false };
      return res.json();
    })
    .catch(() => {
      resolveCache.delete(trimmed);
      return { matched: null, movie_id: null, is_exact: false };
    });

  resolveCache.set(trimmed, promise);
  return promise;
}

function getRecsKey(movieId: number, wSim: number, wVote: number, wPop: number, topK: number) {
  return `${movieId}_${wSim.toFixed(2)}_${wVote.toFixed(2)}_${wPop.toFixed(2)}_${topK}`;
}

/**
 * Get recommendations for a movie.
 * GET /api/movies/<movie_id>/recommendations/?w_sim=0.7&w_vote=0.2&w_pop=0.1&top_k=10
 */
export function getRecommendations(
  movieId: number,
  wSim: number = 0.7,
  wVote: number = 0.2,
  wPop: number = 0.1,
  topK: number = 10
): Promise<Movie[]> {
  const key = getRecsKey(movieId, wSim, wVote, wPop, topK);
  if (recsCache.has(key)) {
    return recsCache.get(key)!;
  }

  const params = new URLSearchParams({
    w_sim: wSim.toFixed(2),
    w_vote: wVote.toFixed(2),
    w_pop: wPop.toFixed(2),
    top_k: topK.toString(),
  });

  const promise = fetch(`${API_BASE}/${movieId}/recommendations/?${params}`)
    .then(async (res) => {
      if (!res.ok) return [];
      const data: RecommendationItem[] = await res.json();
      return data.map((item) => ({
        title: item.title,
        poster: item.poster,
        genres: item.genres,
        score: item.score,
      }));
    })
    .catch(() => {
      recsCache.delete(key);
      return [];
    });

  recsCache.set(key, promise);
  return promise;
}

/**
 * Prefetch recommendations for a given query title.
 * Very fast when hovering over chips.
 */
export function prefetchRecommendations(
  query: string,
  wSim: number = 0.7,
  wVote: number = 0.2,
  wPop: number = 0.1,
  topK: number = 10
) {
  resolveTitle(query).then((res) => {
    if (res.movie_id) {
      getRecommendations(res.movie_id, wSim, wVote, wPop, topK);
    }
  });
}

/**
 * Get popular seed titles for quick-search chips.
 * GET /api/movies/seed-titles/
 */
export function getSeedTitles(): Promise<string[]> {
  if (seedTitlesCache) return seedTitlesCache;

  const promise = fetch(`${API_BASE}/seed-titles/`)
    .then((res) => {
      if (!res.ok) return [];
      return res.json();
    })
    .catch(() => {
      seedTitlesCache = null;
      return [];
    });

  seedTitlesCache = promise;
  return promise;
}
