import os
import sys

# Add project directory to Python path
PROJECT_ROOT = os.path.dirname(__file__)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
