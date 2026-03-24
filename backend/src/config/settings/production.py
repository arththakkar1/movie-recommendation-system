from .base import *

DEBUG = False

INSTALLED_APPS += [

]

MIDDLEWARE += [
    
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://example.com", # Placeholder for actual prod frontend domain
]