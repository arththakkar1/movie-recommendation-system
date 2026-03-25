# CineMatch Frontend

The frontend for the CineMatch Movie Recommendation System. Built with **Next.js**, **React**, and **TailwindCSS**, designed to be incredibly fast and minimally elegant.

## Features

- **Minimalist Emerald Aesthetic**: A sleek dark mode accented by sharp emerald greens, completely devoid of excess elements.
- **Instantaneous Pre-fetching**: Hovering over suggestion chips automatically fetches and parses movie data in the background, allowing cards to render with zero latency upon clicking.
- **In-Memory Caching Strategy**: Previously searched queries and parameter states are stored in localized `Map` instances (inside `api.ts`). Toggling between movies feels instant because data goes straight from memory.
- **Semantic Live Autocomplete**: Includes a responsive dropdown that communicates with the Machine Learning backend to offer TF-IDF semantic query suggestions in real-time as you type.
- **Tunable Hybrid Sliders**: Real-time slider components to manipulate the exact mathematical ratio between Contextual Similarity, Absolute Popularity, and Vote Average.

## Development

First, make sure the Django [backend](../backend/README.md) is running locally on port `8000`.

Then, install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the interface.

## Project Structure

```text
src/
└── app/
    ├── components/
    │   ├── MovieCard.tsx      # Renders individual movie poster and badges
    │   └── WeightSliders.tsx  # Interactive hybrid parameter controls
    ├── data/
    │   └── api.ts             # ML Engine Fetch client & Memory Cache Maps
    ├── globals.css            # Tailwind directives
    ├── layout.tsx             # Document template
    └── page.tsx               # Main Search & Recommendation Application
```
