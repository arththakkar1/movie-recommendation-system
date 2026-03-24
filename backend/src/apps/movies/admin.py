from django.contrib import admin
from .models import Genre, Movie


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'tmdb_id', 'vote_average', 'popularity')
    search_fields = ('title',)
    list_filter = ('genres',)
    filter_horizontal = ('genres',)
