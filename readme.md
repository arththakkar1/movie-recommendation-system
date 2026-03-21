# Movie Recommendation System

A content-based movie recommendation system built using the **TMDB dataset**, with TF-IDF vectorization, fuzzy title search, hybrid scoring, MMR diversity re-ranking, and evaluation metrics.

---

## Pipeline

| Step | Description                                                      |
| ---- | ---------------------------------------------------------------- |
| 1    | Load & merge `movies.csv`, `credits.csv`, `poster.csv`           |
| 2    | Safe feature extraction (genres, keywords, top-3 cast, director) |
| 3    | NLTK stemming on combined tags                                   |
| 4    | TF-IDF → L2-normalised embeddings → Cosine Similarity            |
| 5    | Hybrid scoring with tunable weights                              |
| 6    | Fuzzy title matching                                             |
| 7    | MMR re-ranking for diversity                                     |
| 8    | NDCG@K + Precision@K + Catalog Coverage evaluation               |
| 9    | Sparse similarity storage                                        |

---

## Features

- **Safe Parsing** — `ast.literal_eval` wrapped in a `safe_parse()` fallback; malformed rows silently return `[]` instead of crashing
- **NLTK Stemming** — `PorterStemmer` collapses word variants (`running` → `run`) for a smaller TF-IDF vocabulary
- **TF-IDF Vectorization** — 10,000 features, English stop words filtered
- **Hybrid Scoring** — tunable `w_sim`, `w_vote`, `w_pop` weights blend content similarity with vote average and popularity
- **Fuzzy Title Search** — `rapidfuzz` resolves typos/partial queries (e.g. `'avtar'` → `Avatar`)
- **MMR Re-ranking** — Maximal Marginal Relevance balances relevance vs. diversity in results
- **Evaluation Metrics** — Precision@K, NDCG@K, and catalog coverage
- **Sparse Storage** — Top-50 neighbours saved as a `.npz` sparse matrix (~3 MB vs. ~180 MB dense)

---

## Dataset

Uses the **TMDB 5000 Movie Dataset**.

| File          | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `movies.csv`  | Movie metadata (title, genres, keywords, overview, vote average, popularity) |
| `credits.csv` | Cast and crew information                                                    |
| `poster.csv`  | Poster URLs from TMDB                                                        |

---

## Technologies Used

- **Python** — core language
- **pandas & NumPy** — data manipulation
- **scikit-learn** — `TfidfVectorizer`, `cosine_similarity`, `normalize`
- **NLTK** — `PorterStemmer` for stemming
- **rapidfuzz** — fuzzy string matching
- **SciPy** — sparse matrix storage (`.npz`)
- **Jupyter Notebook** — interactive exploration

---

## Installation

```bash
pip install pandas numpy scikit-learn nltk rapidfuzz scipy
```

```python
import nltk
nltk.download('punkt')
```

---

## Usage

### Basic Recommendation

```python
recommend('Avatar')
```

### Fuzzy Match (Typo-Tolerant)

```python
recommend('avtar')           # → matches 'Avatar'
recommend('dark night')      # → matches 'The Dark Knight Rises'
```

### Custom Weights

```python
recommend('Interstellar', w_sim=0.5, w_vote=0.3, w_pop=0.2)
```

### Evaluation

```python
precision_at_k('Inception', k=5)
ndcg_at_k('Inception', k=5)
catalog_coverage(['Avatar', 'Inception', 'Interstellar'], k=5)
```

---

## Key Algorithms

### TF-IDF (Term Frequency–Inverse Document Frequency)

Weighs rare, distinctive words higher. Applied on stemmed tags (overview + genres + keywords + cast + director).

### Cosine Similarity

Dot product of L2-normalised TF-IDF vectors. Ranges from 0 (dissimilar) to 1 (identical).

### Hybrid Scoring

```
score = sim × w_sim + vote_norm × w_vote + pop_norm × w_pop
```

Default weights: `w_sim=0.70, w_vote=0.20, w_pop=0.10`

### Maximal Marginal Relevance (MMR)

Re-ranks candidates by balancing relevance to the query against inter-result diversity:

```
MMR = λ · relevance − (1 − λ) · max_similarity_to_selected
```

### NDCG@K (Normalised Discounted Cumulative Gain)

Penalises relevant items ranked lower in the list; genre overlap used as the relevance signal.

---

## Project Structure

```
├── Explaination/
│   ├── app.ipynb           # Main notebook (full pipeline)
│   ├── movie_list.pkl      # Pickled movie DataFrame
│   ├── similarity_sparse.npz  # Sparse top-50 neighbour matrix
│   └── Data/
│       ├── movies.csv
│       ├── credits.csv
│       └── poster.csv
├── frontend/               # Next.js frontend (WIP)
├── readme.md
└── .gitignore
```
