export interface Movie {
  title: string;
  poster: string;
  genres: string[];
  score: number;
}

const ALIASES: Record<string, string> = {
  avtar: "Avatar", "dark night": "The Dark Knight", "dark knoght": "The Dark Knight",
  "dark knight": "The Dark Knight", interstella: "Interstellar", interstellr: "Interstellar",
  "toy stori": "Toy Story", inceptoin: "Inception", "the avenger": "The Avengers", avengers: "The Avengers",
};

const DB:Record<string,Movie[]> = {
  Avatar: [
    { title: "Aliens", poster: "https://image.tmdb.org/t/p/w500/uQ5dAt1cnRfAHxCQ660HOQFN1Gn.jpg", genres: ["Action", "Sci-Fi"], score: 0.91 },
    { title: "Dances with Wolves", poster: "https://image.tmdb.org/t/p/w500/4Zb4tUCcaV5bVxOxbFO6GzFQqNu.jpg", genres: ["Drama", "Western"], score: 0.87 },
    { title: "The Last Samurai", poster: "https://image.tmdb.org/t/p/w500/mXB3g1VOmKhgRCqHkqFaOXC5ueO.jpg", genres: ["Action", "Drama"], score: 0.84 },
    { title: "District 9", poster: "https://image.tmdb.org/t/p/w500/tuGCDYoXdyPoJLeFSpD4bS6CRZB.jpg", genres: ["Sci-Fi", "Action"], score: 0.82 },
    { title: "John Carter", poster: "https://image.tmdb.org/t/p/w500/fji0Tb1sQdAMTHzlZS4O8nJjqoH.jpg", genres: ["Action", "Adventure", "Sci-Fi"], score: 0.79 },
  ],
  "The Dark Knight": [
    { title: "Batman Begins", poster: "https://image.tmdb.org/t/p/w500/8RW2runSEc34IwKN2D1aPcJd2UL.jpg", genres: ["Action", "Crime", "Drama"], score: 0.95 },
    { title: "The Dark Knight Rises", poster: "https://image.tmdb.org/t/p/w500/dEYnvnUfXrqvqeRSqvIEtmzhoA8.jpg", genres: ["Action", "Crime", "Drama"], score: 0.93 },
    { title: "Heat", poster: "https://image.tmdb.org/t/p/w500/rrBuGu0Pjq7Y2BWSI6teGfZzviY.jpg", genres: ["Action", "Crime", "Drama"], score: 0.88 },
    { title: "Joker", poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", genres: ["Crime", "Drama", "Thriller"], score: 0.85 },
    { title: "Se7en", poster: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg", genres: ["Crime", "Mystery", "Thriller"], score: 0.81 },
  ],
  Interstellar: [
    { title: "Inception", poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg", genres: ["Action", "Sci-Fi", "Adventure"], score: 0.94 },
    { title: "The Martian", poster: "https://image.tmdb.org/t/p/w500/5BHuvQ6p9kfc091Z8RiFnaN4cuj.jpg", genres: ["Drama", "Adventure", "Sci-Fi"], score: 0.90 },
    { title: "Gravity", poster: "https://image.tmdb.org/t/p/w500/bHarw8xrmQeqf3t8HpuMY7zoK4x.jpg", genres: ["Sci-Fi", "Thriller"], score: 0.87 },
    { title: "Contact", poster: "https://image.tmdb.org/t/p/w500/uGMZSrjfxrTTuqpvzYqAHPGJFi6.jpg", genres: ["Drama", "Sci-Fi"], score: 0.83 },
    { title: "2001: A Space Odyssey", poster: "https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg", genres: ["Sci-Fi", "Mystery"], score: 0.80 },
  ],
  "Toy Story": [
    { title: "Toy Story 2", poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", genres: ["Animation", "Comedy", "Family"], score: 0.96 },
    { title: "Toy Story 3", poster: "https://image.tmdb.org/t/p/w500/AbbXspMOwdvwr1FLFqcNDRBDHPK.jpg", genres: ["Animation", "Family", "Comedy"], score: 0.94 },
    { title: "A Bug's Life", poster: "https://image.tmdb.org/t/p/w500/aAAwaj79hGYkKxeuAKLD14OiyPi.jpg", genres: ["Animation", "Comedy", "Family"], score: 0.88 },
    { title: "Monsters, Inc.", poster: "https://image.tmdb.org/t/p/w500/sgheSKxZkttIe8ONsf2sWXPgip3.jpg", genres: ["Animation", "Comedy", "Family"], score: 0.85 },
    { title: "Finding Nemo", poster: "https://image.tmdb.org/t/p/w500/2geeM1ZTXbeXs6OoVX4okQRifQ5.jpg", genres: ["Animation", "Family"], score: 0.82 },
  ],
  Inception: [
    { title: "Interstellar", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", genres: ["Adventure", "Drama", "Sci-Fi"], score: 0.93 },
    { title: "The Prestige", poster: "https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg", genres: ["Drama", "Mystery", "Sci-Fi"], score: 0.91 },
    { title: "Memento", poster: "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg", genres: ["Mystery", "Thriller"], score: 0.88 },
    { title: "Shutter Island", poster: "https://image.tmdb.org/t/p/w500/7cbfIZPRNgAhKFw5bHUBxjPJoln.jpg", genres: ["Drama", "Mystery", "Thriller"], score: 0.85 },
    { title: "The Matrix", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", genres: ["Action", "Sci-Fi"], score: 0.82 },
  ],
  "The Avengers": [
    { title: "Avengers: Age of Ultron", poster: "https://image.tmdb.org/t/p/w500/4ssDuvEDkSArWEdyBl2d087kidd.jpg", genres: ["Action", "Adventure", "Sci-Fi"], score: 0.95 },
    { title: "Captain America: Civil War", poster: "https://image.tmdb.org/t/p/w500/rAGiXaUfPzY7CDEyNPIPMpDc3Md.jpg", genres: ["Adventure", "Action", "Sci-Fi"], score: 0.91 },
    { title: "Guardians of the Galaxy", poster: "https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg", genres: ["Action", "Adventure", "Sci-Fi"], score: 0.88 },
    { title: "Thor: Ragnarok", poster: "https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg", genres: ["Action", "Adventure", "Comedy"], score: 0.85 },
    { title: "Iron Man", poster: "https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg", genres: ["Action", "Sci-Fi", "Adventure"], score: 0.82 },
  ],
};

export function resolveTitle(query: string): { matched: string | null; isExact: boolean } {
  const q = query.trim().toLowerCase();
  if (!q) return { matched: null, isExact: false };
  const exactKey = Object.keys(DB).find((k) => k.toLowerCase() === q);
  if (exactKey) return { matched: exactKey, isExact: true };
  if (ALIASES[q]) return { matched: ALIASES[q], isExact: false };
  const partial = Object.keys(DB).find(
    (k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase())
  );
  if (partial) return { matched: partial, isExact: false };
  return { matched: null, isExact: false };
}

export function getRecommendations(
  canonical: string,
  wSim: number,
  wVote: number,
  wPop: number
): Movie[] {
  const base = DB[canonical];
  if (!base) return [];
  const seed = canonical.length;
  return base
    .map((m, i) => ({
      ...m,
      score: Math.min(
        1,
        m.score * wSim +
          (((seed * (i + 3)) % 7) / 70) * wVote +
          (((seed * (i + 5)) % 5) / 50) * wPop
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

export const SEED_TITLES = Object.keys(DB);
