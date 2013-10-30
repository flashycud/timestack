import datetime

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

# Create your models here.
class Person(models.Model):
	uid = models.IntegerField(primary_key=True)
	access_token = models.CharField(max_length=200)
	profile_url = models.CharField(max_length=200)
	user = models.OneToOneField(User, related_name='profile')

	def __unicode__(self):
		return "%s %s" % (self.user.first_name,self.user.last_name)

class Song(models.Model):
	owner = models.ForeignKey(User, related_name='song')
	sid = models.CharField(max_length=200)
	title = models.CharField(max_length=500)
	date_added = models.DateTimeField(_('date added'), default=datetime.datetime.now)
	activate = models.BooleanField()

	class Meta:
		ordering = ['date_added']

	def __unicode__(self):
		return self.sid

class Message(models.Model):
	owner = models.ForeignKey(User, related_name='message')
	detail = models.TextField()
	activate = models.BooleanField()
	date_updated =  models.DateTimeField(_('date added'), default=datetime.datetime.now)
	date_added = models.DateTimeField(_('date added'), default=datetime.datetime.now)

	class Meta:
		ordering = ['-date_added']

class Album(models.Model):
	owner = models.ForeignKey(User, related_name='album')
	aid = models.CharField(max_length=200)
	date_added = models.DateTimeField(_('date added'), default=datetime.datetime.now)
	
	class Meta:
		ordering = ['date_added']
	def __unicode__(self):
		return self.aid

class Config(models.Model):
	key = models.CharField(max_length=200)
	value = models.CharField(max_length=200)

