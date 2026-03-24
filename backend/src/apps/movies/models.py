from django.db import models


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Movie(models.Model):
    tmdb_id = models.IntegerField(unique=True, db_index=True)
    title = models.CharField(max_length=500, db_index=True)
    overview = models.TextField(blank=True, default='')
    genres = models.ManyToManyField(Genre, blank=True, related_name='movies')
    keywords = models.TextField(blank=True, default='')  # stored as comma-separated
    cast = models.TextField(blank=True, default='')  # top-3 cast, comma-separated
    director = models.CharField(max_length=300, blank=True, default='')
    vote_average = models.FloatField(default=0.0)
    vote_count = models.IntegerField(default=0)
    popularity = models.FloatField(default=0.0)
    poster_url = models.URLField(max_length=500, blank=True, default='')
    release_date = models.CharField(max_length=20, blank=True, default='')
    runtime = models.IntegerField(null=True, blank=True)
    tags = models.TextField(blank=True, default='')  # combined stemmed tags for TF-IDF

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

    @property
    def genre_names(self):
        return list(self.genres.values_list('name', flat=True))
