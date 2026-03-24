# CineMatch Django Backend

This is the Python/Django backend for the CineMatch movie recommendation system. It exposes a Django REST Framework API that powers a Next.js frontend, featuring a machine learning-powered recommendation engine (TF-IDF, Cosine Similarity, Hybrid Scoring, and Maximal Marginal Relevance).

## Prerequisites
- **Python 3.10+** (Make sure Python is added to your system PATH)
- **Git** (if pulling down via repository)

---

## 🚀 Quick Start Guide (Mac / Linux / Windows)

Follow these steps to get the Django backend running locally on your machine.

### 1. Open Terminal & Navigate to the Backend Folder
Open your Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows) and change your directory to this `backend` folder.
```bash
cd path/to/mrs-backend/backend
```

### 2. Create a Virtual Environment
It's best practice to use a virtual environment so the project dependencies don't interfere with your system Python packages.
```bash
# On Mac / Linux:
python3 -m venv .venv

# On Windows:
python -m venv .venv
```

### 3. Activate the Virtual Environment
Activate the environment you just created. Your terminal prompt should now show `(.venv)`.
```bash
# On Mac / Linux:
source .venv/bin/activate

# On Windows:
.\.venv\Scripts\activate
```

### 4. Install Dependencies
Install all required Python packages (Django, DRF, Scikit-learn, Pandas, RapidFuzz, etc.).
```bash
pip install -r requirements/base.txt
```

### 5. Run Database Migrations
This command creates the SQLite database (`local_db/db.sqlite3`) and creates the necessary tables for Movies and Genres.
```bash
python src/manage.py migrate
```

### 6. Import the Movie Data (Important!)
The recommendation system needs data to work. This project includes a custom management command that reads the ML developer's CSV files (`movies.csv`, `credits.csv`, `poster.csv`) and loads all ~4800 movies into your database.

By default, the script looks for the data in the `movie-recommendation-system/Explaination/Data/` folder.
Run the import command:
```bash
python src/manage.py import_movies
```

*(Note: If your data CSV files are stored elsewhere, you can point the script to that specific folder by passing the `--data-dir` argument: `python src/manage.py import_movies --data-dir /path/to/your/csv/folder`)*

### 7. Start the Development Server
Once the data is imported, you can boot up the Django server.
```bash
python src/manage.py runserver
```

You should see output indicating that the server is running on `http://127.0.0.1:8000/`. Keep this terminal window open!

---

## 🔗 Connecting the Frontend

The Next.js frontend is configured to talk to this backend. 
1. Open a **new, separate terminal tab**.
2. Navigate to the frontend directory (`movie-recommendation-system/frontend`).
3. Run `npm install` (only needed the first time).
4. Run `npm run dev`.

The frontend will start on `http://localhost:3000`. Open that in your browser! 
*(Note: Cross-Origin Resource Sharing (CORS) is already pre-configured in the Django backend (`production.py` and `development.py`) to permit requests coming from `localhost:3000`.)*

---

## 🛠️ API Endpoints

Once running, the backend exposes the following REST API endpoints:
- `GET /api/movies/search/?q=<query>`: Resolves a fuzzy string (e.g. `avtar`) to the nearest matching movie title in the database.
- `GET /api/movies/seed-titles/`: Returns a list of the top 20 most popular movie titles (used for the frontend suggestion chips).
- `GET /api/movies/<id>/recommendations/?w_sim=0.7&w_vote=0.2&w_pop=0.1`: The core engine endpoint. Generates the top 10 recommended movies based on the customized weights given by the frontend sliders.
