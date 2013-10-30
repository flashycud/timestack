from django.conf.urls.defaults import *

handler500 = 'djangotoolbox.errorviews.server_error'

# urlpatterns = patterns('',
#     ('^_ah/warmup$', 'djangoappengine.views.warmup'),
#     ('^$', 'django.views.generic.simple.direct_to_template',
#      {'template': 'home.html'}),
# )

urlpatterns = patterns('',
	# (r'^_ah/warmup$', 'djangoappengine.views.warmup'),
	(r'^', include('timestack.urls')),
)
