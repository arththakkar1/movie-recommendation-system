"""
Recommendation engine for the Movie Recommendation System.
Uses TF-IDF vectorization, cosine similarity, hybrid scoring,
fuzzy title matching (rapidfuzz), and MMR re-ranking.
"""

import logging
import threading

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize
from rapidfuzz import fuzz, process

logger = logging.getLogger(__name__)

# ── Singleton engine (thread-safe lazy init) ────────────────────────────
_engine = None
_lock = threading.Lock()


class RecommendationEngine:
    """Content-based recommendation engine with TF-IDF + hybrid scoring."""

    def __init__(self):
        self.movie_ids = []       # list of movie PKs in matrix order
        self.titles = []          # list of titles in matrix order
        self.title_lower_map = {} # lower-title -> index
        self.genres_map = {}      # movie_pk -> [genre_names]
        self.vote_avg = None      # np array of normalised vote averages
        self.popularity = None    # np array of normalised popularity
        self.poster_map = {}      # movie_pk -> poster_url
        self.vectorizer = None    # TF-IDF vectorizer for tags
        self.tfidf_matrix = None  # sparse TF-IDF matrix
        self._ready = False

    # ── Build ────────────────────────────────────────────────────────
    def build(self):
        """Load data from DB and build the TF-IDF matrix."""
        from apps.movies.models import Movie

        qs = Movie.objects.prefetch_related('genres').all()
        movies = list(qs)
        if not movies:
            logger.warning("No movies in database — engine not built.")
            return

        self.movie_ids = [m.pk for m in movies]
        self.titles = [m.title for m in movies]
        self.title_lower_map = {t.lower(): i for i, t in enumerate(self.titles)}
        self.genres_map = {m.pk: m.genre_names for m in movies}
        self.poster_map = {m.pk: m.poster_url for m in movies}

        # Normalise vote_average and popularity to [0, 1]
        raw_votes = np.array([m.vote_average for m in movies], dtype=np.float64)
        raw_pop = np.array([m.popularity for m in movies], dtype=np.float64)

        v_max = raw_votes.max() if raw_votes.max() > 0 else 1
        p_max = raw_pop.max() if raw_pop.max() > 0 else 1
        self.vote_avg = raw_votes / v_max
        self.popularity = raw_pop / p_max

        # Build TF-IDF on the combined tags field
        tags = [m.tags if m.tags else '' for m in movies]
        self.vectorizer = TfidfVectorizer(max_features=10000, stop_words='english')
        tfidf = self.vectorizer.fit_transform(tags)
        self.tfidf_matrix = normalize(tfidf, norm='l2')

        self._ready = True
        logger.info(f"Recommendation engine built with {len(movies)} movies.")

    # ── Fuzzy title resolution ───────────────────────────────────────
    def resolve_title(self, query: str):
        """
        Returns: {"matched": str|None, "movie_id": int|None, "is_exact": bool}
        """
        if not self._ready:
            return {"matched": None, "movie_id": None, "is_exact": False}

        q = query.strip().lower()
        if not q:
            return {"matched": None, "movie_id": None, "is_exact": False}

        # 1. Exact match
        if q in self.title_lower_map:
            idx = self.title_lower_map[q]
            return {
                "matched": self.titles[idx],
                "movie_id": self.movie_ids[idx],
                "is_exact": True,
            }

        # 2. Fuzzy match via rapidfuzz
        result = process.extractOne(
            q, self.titles, scorer=fuzz.WRatio, score_cutoff=60
        )
        if result:
            matched_title, score, idx = result
            return {
                "matched": matched_title,
                "movie_id": self.movie_ids[idx],
                "is_exact": False,
            }

        return {"matched": None, "movie_id": None, "is_exact": False}

    # ── Autocomplete / Suggestions ───────────────────────────────────
    def suggest_titles(self, query: str, top_k: int = 5):
        """
        Returns an autocomplete list of suggestions based on TF-IDF semantic
        matching (tags) + string fuzzy matching (titles).
        """
        if not self._ready or not self.vectorizer:
            return []

        q = query.strip().lower()
        if not q:
            return []

        # 1. Semantic Match via TF-IDF Vectorizer
        q_vec = self.vectorizer.transform([q])
        if q_vec.nnz > 0:
            sim_scores = (q_vec @ self.tfidf_matrix.T).toarray().flatten()
        else:
            sim_scores = np.zeros(len(self.movie_ids))

        # 2. Fuzzy Match via Rapidfuzz
        fuzzy_results = process.extract(q, self.titles, scorer=fuzz.WRatio, limit=top_k * 2)
        
        # Combine into a hybrid score map
        # We heavily weight the fuzzy title match (0.7) and give a subtle boost to semantic match (0.3)
        hybrid = sim_scores * 0.3
        for matched_title, score, idx in fuzzy_results:
            hybrid[idx] += (score / 100.0) * 0.7

        # Top K
        top_indices = np.argsort(hybrid)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            if hybrid[idx] > 0.05:  # Ensure there is at least some minimal match
                pk = self.movie_ids[idx]
                results.append({
                    "movie_id": pk,
                    "title": self.titles[idx],
                    "score": round(float(hybrid[idx]), 4)
                })

        return results

    # ── Recommendations ──────────────────────────────────────────────
    def get_recommendations(
        self,
        movie_id: int,
        w_sim: float = 0.70,
        w_vote: float = 0.20,
        w_pop: float = 0.10,
        top_k: int = 10,
        mmr_lambda: float = 0.7,
    ):
        """
        Returns list of dicts:
        [{"movie_id", "title", "poster", "genres", "score"}, ...]
        """
        if not self._ready:
            return []

        try:
            idx = self.movie_ids.index(movie_id)
        except ValueError:
            return []

        # Cosine similarity between query movie and all movies
        sim_scores = (self.tfidf_matrix[idx] @ self.tfidf_matrix.T).toarray().flatten()

        # Hybrid score
        hybrid = (
            w_sim * sim_scores
            + w_vote * self.vote_avg
            + w_pop * self.popularity
        )

        # Exclude self
        hybrid[idx] = -1

        # Get top candidates (more than needed for MMR)
        n_candidates = min(top_k * 5, len(hybrid))
        candidate_indices = np.argsort(hybrid)[::-1][:n_candidates]

        # MMR re-ranking
        selected = self._mmr(
            query_idx=idx,
            candidate_indices=candidate_indices,
            hybrid_scores=hybrid,
            top_k=top_k,
            lam=mmr_lambda,
        )

        results = []
        for sel_idx in selected:
            pk = self.movie_ids[sel_idx]
            results.append({
                "movie_id": pk,
                "title": self.titles[sel_idx],
                "poster": self.poster_map.get(pk, ''),
                "genres": self.genres_map.get(pk, []),
                "score": round(float(hybrid[sel_idx]), 4),
            })

        return results

    def _mmr(self, query_idx, candidate_indices, hybrid_scores, top_k, lam):
        """Maximal Marginal Relevance re-ranking."""
        selected = []
        remaining = list(candidate_indices)

        for _ in range(min(top_k, len(remaining))):
            best_idx = None
            best_mmr = -float('inf')

            for c in remaining:
                relevance = hybrid_scores[c]
                if selected:
                    sel_vecs = self.tfidf_matrix[selected]
                    c_vec = self.tfidf_matrix[c]
                    max_sim = (c_vec @ sel_vecs.T).toarray().max()
                else:
                    max_sim = 0

                mmr_score = lam * relevance - (1 - lam) * max_sim
                if mmr_score > best_mmr:
                    best_mmr = mmr_score
                    best_idx = c

            if best_idx is not None:
                selected.append(best_idx)
                remaining.remove(best_idx)

        return selected

    # ── Seed titles ──────────────────────────────────────────────────
    def get_seed_titles(self, count=20):
        """Return popular movie titles for quick-search chips."""
        if not self._ready:
            return []

        # Sort by popularity (descending) and pick top
        sorted_indices = np.argsort(self.popularity)[::-1][:count]
        return [self.titles[i] for i in sorted_indices]


def get_engine():
    """Get or lazily build the recommendation engine singleton."""
    global _engine
    if _engine is not None and _engine._ready:
        return _engine

    with _lock:
        if _engine is None or not _engine._ready:
            _engine = RecommendationEngine()
            _engine.build()

    return _engine
