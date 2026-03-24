from rest_framework import serializers
from .models import Movie, Genre


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class MovieSerializer(serializers.ModelSerializer):
    genres = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ['id', 'title', 'poster_url', 'genres', 'vote_average', 'popularity', 'overview']

    def get_genres(self, obj):
        return list(obj.genres.values_list('name', flat=True))


class RecommendationSerializer(serializers.Serializer):
    """Serializer for recommendation results from the engine."""
    movie_id = serializers.IntegerField()
    title = serializers.CharField()
    poster = serializers.CharField()
    genres = serializers.ListField(child=serializers.CharField())
    score = serializers.FloatField()


class SearchResultSerializer(serializers.Serializer):
    """Serializer for fuzzy title search results."""
    matched = serializers.CharField(allow_null=True)
    movie_id = serializers.IntegerField(allow_null=True)
    is_exact = serializers.BooleanField()
