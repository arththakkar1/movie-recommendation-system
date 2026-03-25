from django.urls import path
from .views import SearchMovieView, RecommendationsView, SeedTitlesView, SuggestMovieView

app_name = 'movies'

urlpatterns = [
    path('search/', SearchMovieView.as_view(), name='search'),
    path('suggest/', SuggestMovieView.as_view(), name='suggest'),
    path('seed-titles/', SeedTitlesView.as_view(), name='seed-titles'),
    path('<int:movie_id>/recommendations/', RecommendationsView.as_view(), name='recommendations'),
]
