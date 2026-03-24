"""
Management command to import movies from the TMDB CSV files.
Reads movies.csv, credits.csv, and poster.csv, then populates the database.
"""

import ast
import os

import pandas as pd
from django.core.management.base import BaseCommand

from apps.movies.models import Genre, Movie


def safe_parse(val):
    """Safely parse stringified Python lists/dicts from CSV."""
    try:
        return ast.literal_eval(val)
    except (ValueError, SyntaxError):
        return []


class Command(BaseCommand):
    help = 'Import movies from TMDB CSV files into the database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--data-dir',
            type=str,
            help='Path to the directory containing movies.csv, credits.csv, poster.csv',
        )

    def handle(self, *args, **options):
        data_dir = options.get('data_dir')
        if not data_dir:
            # Default: look relative to the project
            data_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                '..', '..', '..', '..', '..', '..', '..',
                'movie-recommendation-system', 'Explaination', 'Data'
            )
            data_dir = os.path.normpath(data_dir)

        self.stdout.write(f"Loading data from: {data_dir}")

        movies_path = os.path.join(data_dir, 'movies.csv')
        credits_path = os.path.join(data_dir, 'credits.csv')
        poster_path = os.path.join(data_dir, 'poster.csv')

        for p in [movies_path, credits_path, poster_path]:
            if not os.path.exists(p):
                self.stderr.write(self.style.ERROR(f"File not found: {p}"))
                return

        # Load CSVs
        self.stdout.write("Reading CSV files...")
        movies_df = pd.read_csv(movies_path)
        credits_df = pd.read_csv(credits_path)
        poster_df = pd.read_csv(poster_path)

        # Merge movies + credits on movie_id/id
        credits_df.rename(columns={'movie_id': 'id'}, inplace=True)
        df = movies_df.merge(credits_df[['id', 'cast', 'crew']], on='id', how='left')

        # Merge poster URLs — filter NaN titles
        poster_map = {}
        for _, prow in poster_df.iterrows():
            pt = prow.get('title')
            pu = prow.get('poster')
            if pd.notna(pt) and pd.notna(pu):
                poster_map[str(pt).strip()] = str(pu).strip()

        self.stdout.write(f"Processing {len(df)} movies...")

        # Collect all unique genres first
        all_genres = set()
        for genres_str in df['genres'].dropna():
            parsed = safe_parse(genres_str)
            for g in parsed:
                if isinstance(g, dict) and 'name' in g:
                    all_genres.add(g['name'])

        # Bulk create genres
        existing_genres = set(Genre.objects.values_list('name', flat=True))
        new_genres = [Genre(name=g) for g in all_genres if g not in existing_genres]
        Genre.objects.bulk_create(new_genres, ignore_conflicts=True)
        genre_obj_map = {g.name: g for g in Genre.objects.all()}

        self.stdout.write(f"Created {len(new_genres)} new genres (total: {len(genre_obj_map)})")

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for _, row in df.iterrows():
            try:
                tmdb_id = int(row['id'])
                title_raw = row.get('title', '')
                if pd.isna(title_raw) or not str(title_raw).strip():
                    skipped_count += 1
                    continue
                title = str(title_raw).strip()

                # Parse genres
                genres_parsed = safe_parse(row.get('genres', '[]'))
                genre_names = [g['name'] for g in genres_parsed if isinstance(g, dict) and 'name' in g]

                # Parse keywords
                keywords_parsed = safe_parse(row.get('keywords', '[]'))
                keyword_names = [k['name'] for k in keywords_parsed if isinstance(k, dict) and 'name' in k]

                # Parse cast (top 3)
                cast_parsed = safe_parse(row.get('cast', '[]'))
                top_cast = [
                    c['name'].replace(' ', '') for c in cast_parsed[:3]
                    if isinstance(c, dict) and 'name' in c
                ]

                # Parse crew → director
                crew_parsed = safe_parse(row.get('crew', '[]'))
                director = ''
                for c in crew_parsed:
                    if isinstance(c, dict) and c.get('job') == 'Director':
                        director = c.get('name', '').replace(' ', '')
                        break

                # Get poster URL
                poster_url = poster_map.get(title, '')
                if not poster_url:
                    # Try case-insensitive match on poster map
                    title_lower = title.lower()
                    for pt, pu in poster_map.items():
                        if pt.lower() == title_lower:
                            poster_url = pu
                            break
                if not poster_url:
                    poster_url = ''

                overview = str(row.get('overview', '')) if pd.notna(row.get('overview', '')) else ''

                # Build combined tags for TF-IDF (stemming done inline)
                tags_parts = []
                if overview:
                    tags_parts.append(overview.lower())
                tags_parts.extend([g.lower().replace(' ', '') for g in genre_names])
                tags_parts.extend([k.lower().replace(' ', '') for k in keyword_names])
                tags_parts.extend([c.lower() for c in top_cast])
                if director:
                    tags_parts.append(director.lower())
                tags = ' '.join(tags_parts)

                # Create or update movie
                movie, created = Movie.objects.update_or_create(
                    tmdb_id=tmdb_id,
                    defaults={
                        'title': title,
                        'overview': overview,
                        'keywords': ','.join(keyword_names),
                        'cast': ','.join(top_cast),
                        'director': director,
                        'vote_average': float(row.get('vote_average', 0) or 0),
                        'vote_count': int(row.get('vote_count', 0) or 0),
                        'popularity': float(row.get('popularity', 0) or 0),
                        'poster_url': poster_url,
                        'release_date': str(row.get('release_date', '')),
                        'runtime': int(row['runtime']) if pd.notna(row.get('runtime')) else None,
                        'tags': tags,
                    },
                )

                # Set genres
                genre_objs = [genre_obj_map[g] for g in genre_names if g in genre_obj_map]
                movie.genres.set(genre_objs)

                if created:
                    created_count += 1
                else:
                    updated_count += 1

            except Exception as e:
                self.stderr.write(f"Error processing row: {e}")
                skipped_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Import complete! Created: {created_count}, Updated: {updated_count}, Skipped: {skipped_count}"
        ))
