import { Movie } from "../data/api";
import Image from "next/image";

const GENRE_COLORS: Record<string, string> = {
  "Action": "bg-red-500/20 text-red-300 border-red-500/30",
  "Sci-Fi": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Science Fiction": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Drama": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Crime": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Thriller": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Mystery": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "Adventure": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Animation": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Comedy": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Family": "bg-lime-500/20 text-lime-300 border-lime-500/30",
  "Western": "bg-stone-400/20 text-stone-300 border-stone-400/30",
};

function scoreColor(s: number) {
  if (s >= 0.9) return "text-emerald-400";
  if (s >= 0.8) return "text-yellow-400";
  return "text-orange-400";
}

export default function MovieCard({ movie, rank }: { movie: Movie; rank: number }) {
  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
      {/* Rank badge */}
      <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xs font-bold text-white">
        {rank}
      </div>

      {/* Score badge */}
      <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-xs font-bold font-mono ${scoreColor(movie.score)}`}>
        {(movie.score * 100).toFixed(0)}%
      </div>

      {/* Poster */}
      <div className="relative flex items-center justify-center aspect-2/3 w-full overflow-hidden bg-zinc-900">
        {movie.poster ? (
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <span className="text-5xl opacity-20">🎬</span>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${GENRE_COLORS[g] ?? "bg-white/10 text-white/60 border-white/20"}`}
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
