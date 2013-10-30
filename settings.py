# Initialize App Engine and import the default settings (DB backend, etc.).
# If you want to use a different backend you have to remove all occurences
# of "djangoappengine" from this file.
from djangoappengine.settings_base import *

import os

DEBUG = False
# DEBUG = True

SECRET_KEY = ''

LOGIN_URL = '/'
LOGOUT_URL = '/logout'

# URI = 'http://local.timestack.flashycud.com:8000/'
URI = 'http://timestack.flashycud.com/'
# FACEBOOK_REDIRECT_URI = 'http://local.timestack.flashycud.com:8000/login'
FACEBOOK_REDIRECT_URI = 'http://timestack.flashycud.com/login'

FACEBOOK_APP_ID = ''
FACEBOOK_APP_KEY = ''
FACEBOOK_APP_SECRET = ''
FACEBOOK_ACCESS_TOKEN = r""

STAFFS = [
    '',
]
BANNED =[
    ''
]

INSTALLED_APPS = (
#    'django.contrib.admin',
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.sites',
    'djangotoolbox',
    'timestack',
    'mediagenerator',

    # djangoappengine should come last, so it can override a few manage.py commands
    'djangoappengine',
)

MIDDLEWARE_CLASSES = (
    'mediagenerator.middleware.MediaMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
)

#auth backends
AUTHENTICATION_BACKENDS = (
    'timestack.backends.FacebookBackend',
)

#mediagenerator

# Get project root folder
_project_root = os.path.dirname(__file__)

MEDIA_DEV_MODE = DEBUG
DEV_MEDIA_URL = '/devmedia/'
PRODUCTION_MEDIA_URL = '/media/'

# Set global media search paths
GLOBAL_MEDIA_DIRS = (
    os.path.join(_project_root, 'static'),
)

GLOBAL_MEDIA_DIRS = (os.path.join(os.path.dirname(__file__), 'static'),)

MEDIA_BUNDLES = (
    ('main.css',
        'css/flipclock.css',
        'css/theme.css',
    ),
    ('main.js',
        {'filter': 'mediagenerator.filters.media_url.MediaURL'},
        'js/jquery-ui-1.8.10.custom.min.js',
        'js/jquery.mousewheel.min.js',
        'js/counter.js',
        'js/flipclock.js',
        'js/globals.js',
        'js/lib.js',
        'js/slideshow.js',
        'js/song.js',
        'js/message.js',
    ),
)

ROOT_MEDIA_FILTERS = {
    'js': 'mediagenerator.filters.closure.Closure',
    'css': 'mediagenerator.filters.yuicompressor.YUICompressor',
}

CLOSURE_COMPILER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)),'compiler.jar')
YUICOMPRESSOR_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)),'yuicompressor-2.4.2.jar')


# This test runner captures stdout and associates tracebacks with their
# corresponding output. Helps a lot with print-debugging.
TEST_RUNNER = 'djangotoolbox.test.CapturingTestSuiteRunner'

ADMIN_MEDIA_PREFIX = '/media/admin/'
TEMPLATE_DIRS = (os.path.join(os.path.dirname(__file__), 'templates'),)

ROOT_URLCONF = 'urls'

# Activate django-dbindexer if available
try:
    import dbindexer
    DATABASES['native'] = DATABASES['default']
    DATABASES['default'] = {'ENGINE': 'dbindexer', 'TARGET': 'native'}
    INSTALLED_APPS += ('dbindexer',)
    DBINDEXER_SITECONF = 'dbindexes'
    MIDDLEWARE_CLASSES = ('dbindexer.middleware.DBIndexerMiddleware',) + \
                         MIDDLEWARE_CLASSES
except ImportError:
    pass
