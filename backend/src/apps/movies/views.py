from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RecommendationSerializer, SearchResultSerializer
from .engine import get_engine


class SearchMovieView(APIView):
    """
    GET /api/movies/search/?q=<query>

    Fuzzy-searches for a movie title. Returns the best match.
    Response: { "matched": "Avatar", "movie_id": 123, "is_exact": true }
    """

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response(
                {"error": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        engine = get_engine()
        result = engine.resolve_title(query)
        serializer = SearchResultSerializer(result)
        return Response(serializer.data)


class RecommendationsView(APIView):
    """
    GET /api/movies/<movie_id>/recommendations/?w_sim=0.7&w_vote=0.2&w_pop=0.1&top_k=10

    Returns top-K recommendations for the given movie with configurable weights.
    Response: [{ "movie_id", "title", "poster", "genres", "score" }, ...]
    """

    def get(self, request, movie_id):
        try:
            w_sim = float(request.query_params.get('w_sim', 0.70))
            w_vote = float(request.query_params.get('w_vote', 0.20))
            w_pop = float(request.query_params.get('w_pop', 0.10))
            top_k = int(request.query_params.get('top_k', 10))
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid weight or top_k parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        engine = get_engine()
        results = engine.get_recommendations(
            movie_id=movie_id,
            w_sim=w_sim,
            w_vote=w_vote,
            w_pop=w_pop,
            top_k=top_k,
        )

        if not results:
            return Response(
                {"error": "Movie not found or no recommendations available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RecommendationSerializer(results, many=True)
        return Response(serializer.data)


class SeedTitlesView(APIView):
    """
    GET /api/movies/seed-titles/

    Returns a list of popular movie titles for quick-search chips.
    Response: ["Avatar", "The Dark Knight", ...]
    """

    def get(self, request):
        engine = get_engine()
        titles = engine.get_seed_titles(count=20)
        return Response(titles)
