from django.contrib.auth.models import User
from django.conf import settings
from timestack import facebook
from timestack.models import *

class FacebookBackend:    

    supports_object_permissions = False
    supports_anonymous_user = False
    supports_inactive_user = False
        
    def authenticate(self, token=None):        
        try:
            try:
                #not first time login, assume not deauth
                u = Person.objects.get(access_token=token)                                
            except Person.DoesNotExist:                
                profile = facebook.GraphAPI(token).get_object("me")
                uid = profile['id']

                try:
                    #login first time but face already exist
                    u = Person.objects.get(uid=uid)                     
                    u.access_token=token
                    #u.user.email=profile['email']
                    u.user.save()                    
                    u.save()
                except Person.DoesNotExist:
                    #login first time and face does not exist
                    u = Person(uid=uid,access_token=token,profile_url=profile['link'])
                    user = User(username=uid,first_name=profile['first_name'],last_name=profile['last_name'])            
                    user.set_unusable_password()
                    user.save()
                    u.user=user
                    u.save()                                          
            return u.user
        except:
            return None
    #todo handle deauth callback

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None