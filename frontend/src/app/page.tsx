"use client";

import { useState, useRef, useEffect } from "react";
import MovieCard from "./components/MovieCard";
import WeightSliders from "./components/WeightSliders";
import {
  resolveTitle,
  getRecommendations,
  getSeedTitles,
  prefetchRecommendations,
  getSuggestions,
  Movie,
  Suggestion,
} from "./data/api";

const PLACEHOLDER_TITLES = [
  "Avatar",
  "Inception",
  "Interstellar",
  "The Dark Knight",
  "Toy Story",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [matched, setMatched] = useState<string | null>(null);
  const [matchedId, setMatchedId] = useState<number | null>(null);
  const [fuzzyBanner, setFuzzyBanner] = useState<string | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wSim, setWSim] = useState(0.7);
  const [wVote, setWVote] = useState(0.2);
  const [wPop, setWPop] = useState(0.1);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_TITLES[0]);
  const [seedTitles, setSeedTitles] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load seed titles from backend on mount
  useEffect(() => {
    getSeedTitles().then((titles) => {
      if (titles.length > 0) {
        setSeedTitles(titles);
      }
    });
  }, []);

  // Rotate placeholder
  useEffect(() => {
    let i = 0;
    const pool =
      seedTitles.length > 0 ? seedTitles.slice(0, 8) : PLACEHOLDER_TITLES;
    const id = setInterval(() => {
      i = (i + 1) % pool.length;
      setPlaceholder(pool[i]);
    }, 2500);
    return () => clearInterval(id);
  }, [seedTitles]);

  // Re-fetch recommendations when weights change
  useEffect(() => {
    if (matchedId) {
      getRecommendations(matchedId, wSim, wVote, wPop).then(setResults);
    }
  }, [wSim, wVote, wPop, matchedId]);

  async function search(q = query) {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);
    setNoMatch(false);
    setFuzzyBanner(null);

    try {
      const searchResult = await resolveTitle(trimmed);

      if (!searchResult.matched || !searchResult.movie_id) {
        setMatched(null);
        setMatchedId(null);
        setResults([]);
        setNoMatch(true);
      } else {
        setMatched(searchResult.matched);
        setMatchedId(searchResult.movie_id);

        const recs = await getRecommendations(
          searchResult.movie_id,
          wSim,
          wVote,
          wPop
        );
        setResults(recs);

        if (!searchResult.is_exact) {
          setFuzzyBanner(
            `Matched "${trimmed}" → "${searchResult.matched}"`
          );
        }
      }
    } catch {
      setMatched(null);
      setMatchedId(null);
      setResults([]);
      setNoMatch(true);
    } finally {
      setLoading(false);
    }
  }

  const chipTitles =
    seedTitles.length > 0 ? seedTitles.slice(0, 6) : PLACEHOLDER_TITLES;

  return (
    <main className="min-h-screen bg-[#0b0b10] text-white flex flex-col">
      {/* ── Hero ── */}
      <header className="flex flex-col items-center pt-16 pb-10 px-4 text-center">
        <div className="mb-6 flex justify-center w-full">
          <h1 className="text-3xl font-light tracking-[0.2em] text-white/90 uppercase">
            CineMatch
          </h1>
        </div>
        <p className="text-white/40 text-sm max-w-md">
          Content-based recommendations · TF-IDF + Cosine Similarity · Hybrid
          Scoring · MMR Diversity
        </p>

        {/* Pipeline pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {["TF-IDF", "Stemming", "Fuzzy Search", "Hybrid Score", "MMR"].map(
            (t) => (
              <span
                key={t}
                className="text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50"
              >
                {t}
              </span>
            )
          )}
        </div>
      </header>

      {/* ── Search bar ── */}
      <section className="flex flex-col items-center px-4 gap-3">
        <div className="relative w-full max-w-xl group z-50">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
              }
              if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
              suggestionTimeout.current = setTimeout(async () => {
                const sugs = await getSuggestions(val);
                setSuggestions(sugs);
                setShowSuggestions(true);
              }, 200);
            }}
            onKeyDown={(e) => e.key === "Enter" && search()}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={`Try "${placeholder}"…`}
            className="w-full rounded-2xl bg-white/5 border border-white/15 focus:border-emerald-500/70 outline-none px-5 py-3.5 pr-14 text-sm text-white placeholder:text-white/25 transition-all"
          />
          <button
            onClick={() => search()}
            disabled={loading}
            className="absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            {loading ? "…" : "Search"}
          </button>
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full mt-2 w-full bg-[#15151e] border border-white/10 rounded-xl overflow-hidden shadow-2xl divide-y divide-white/5">
              {suggestions.map((s) => (
                <li key={s.movie_id}>
                  <button
                    onClick={() => {
                      setQuery(s.title);
                      setShowSuggestions(false);
                      search(s.title);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{s.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400/50">{(s.score * 100).toFixed(0)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Seed chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {chipTitles.map((t) => (
            <button
              key={t}
              onClick={() => {
                setQuery(t);
                search(t);
              }}
              onMouseEnter={() => prefetchRecommendations(t, wSim, wVote, wPop)}
              className="text-xs cursor-pointer px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* ── Fuzzy match banner ── */}
      {fuzzyBanner && (
        <div className="mx-auto mt-5 max-w-xl w-full px-4">
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-2.5 text-xs text-amber-300">
            <span className="font-mono">{fuzzyBanner}</span>
          </div>
        </div>
      )}

      {/* ── Weight sliders ── */}
      {results.length > 0 && (
        <div className="mx-auto mt-6 w-full max-w-xl px-4">
          <WeightSliders
            wSim={wSim}
            wVote={wVote}
            wPop={wPop}
            onChange={(s, v, p) => {
              setWSim(s);
              setWVote(v);
              setWPop(p);
            }}
          />
        </div>
      )}

      {/* ── Results ── */}
      <section className="flex-1 mx-auto w-full max-w-5xl px-4 mt-8 pb-16">
        {/* Results header */}
        {matched && results.length > 0 && (
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-base font-semibold text-white/80">
              Recommendations for{" "}
              <span className="text-emerald-300">{matched}</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono">
              top {results.length}
            </span>
          </div>
        )}

        {/* Cards grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((m, i) => (
              <MovieCard key={m.title} movie={m} rank={i + 1} />
            ))}
          </div>
        )}

        {/* No match */}
        {noMatch && (
          <div className="flex flex-col items-center gap-3 mt-20 text-center">
            <p className="text-white/40 text-sm">
              No close match found for{" "}
              <span className="text-white/70 font-mono">&quot;{query}&quot;</span>
            </p>
            <p className="text-white/25 text-xs">
              Try one of the seed titles above, or a close variant.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!matched && !noMatch && !loading && (
          <div className="flex flex-col items-center gap-3 mt-20 text-center">
            <p className="text-white/30 text-sm">
              Search for a movie to get recommendations
            </p>
            <p className="text-white/20 text-xs">
              Supports fuzzy matching — try{" "}
              <span className="font-mono text-emerald-400/60">
                &quot;avtar&quot;
              </span>{" "}
              or{" "}
              <span className="font-mono text-emerald-400/60">
                &quot;dark night&quot;
              </span>
            </p>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-white/20">
        CineMatch · Content-Based · TMDB Dataset · TF-IDF + MMR
      </footer>
    </main>
  );
}
