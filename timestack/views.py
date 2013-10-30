import settings,facebook,urllib,cgi,datetime

from timestack import utils
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, HttpResponse
from django.conf import settings
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from timestack.models import *

#render_to_rensponse
def index(request):
    params = dict(LOGIN_URL='https://www.facebook.com/dialog/oauth?client_id=' + str(settings.FACEBOOK_APP_ID) + \
                    '&redirect_uri='+urllib.quote(settings.FACEBOOK_REDIRECT_URI) + \
                    '&scope=read_stream,offline_access,user_photos,friends_photos,user_photo_video_tags,friends_photo_video_tags')
    return render_to_response('timestack/index.html',params,context_instance=RequestContext(request))

def login(request, next='/home/'):
    error = ''
    if request.method == 'GET':
        if 'code' in request.GET:
            args = {
                'client_id': settings.FACEBOOK_APP_ID,
                'redirect_uri': (settings.FACEBOOK_REDIRECT_URI),
                'client_secret': settings.FACEBOOK_APP_SECRET,
                'code': request.GET['code'],
            }
            url = 'https://graph.facebook.com/oauth/access_token?' + urllib.urlencode(args)
            response = cgi.parse_qs(urllib.urlopen(url).read())
            access_token = response['access_token'][0]
            #access by Backend
            user = auth.authenticate(token=access_token)
            if user:
                if user.is_active:
                    auth.login(request, user)
                    if (datetime.datetime.now()-user.date_joined).days < 2:
                        request.session['first_time']=True
                    try:
                        if settings.STAFFS.index(user.username)>=0:
                            user.is_staff=True
                            user.save()  
                    except:
                        user.is_staff=False
                        user.save()  
                        pass
                    return redirect(next)
                else:
                    error = 'AUTH_DISABLED'
            else:
                error = 'AUTH_FAILED'
        elif 'error_reason' in request.GET:
            error = 'AUTH_DENIED'
        else:
            login_url='https://www.facebook.com/dialog/oauth?client_id=' + str(settings.FACEBOOK_APP_ID) + \
                '&redirect_uri='+urllib.quote(settings.FACEBOOK_REDIRECT_URI) + \
                '&scope=read_stream,offline_access,user_photos,friends_photos,user_photo_video_tags,friends_photo_video_tags'
            return HttpResponseRedirect(login_url)    
    request.session['error']="Cannot login"  
    return HttpResponseRedirect('/') 
      
def logout(request):
    if request.user.is_authenticated():
        auth.logout(request)
    request.session['msg']="Logged out" 
    # return HttpResponseRedirect('/')
    return redirect('http://m.facebook.com/logout.php?confirm=1&next='+ urllib.quote(settings.URI))

def unauthorized(request):
    params = {}
    return render_to_response('timestack/unauthorized.html',params,context_instance=RequestContext(request))

@login_required
def home(request):
    if request.user.username in settings.STAFFS:
        songs = Song.objects.filter(activate=True)
        first_song = None
        playlist = ''
        if len(songs)>0:
            first_song = songs[0]
            delim = ''
            if len(songs)>1:
                for song in songs[1:]:
                    playlist += ('%s%s' % (delim,song.sid))
                    delim = ','
        params = {
            'song_enable':True if len(songs)>0 else False,
            'first_song':'' if first_song is None else first_song,
            'playlist':'' if not playlist else playlist,
        }
        return render_to_response('timestack/home.html',params,context_instance=RequestContext(request))
    return redirect('/unauthorized/')

@login_required
def get_photos(request, page=1, limit=25, person=0):
    if request.user.username in settings.STAFFS:
        albums = Album.objects.all()
        pictures = []
        sources = []
        if len(albums) >= int(page) & int(page)>0:  
            args = {'limit': 200}
            album = albums[int(page)-1]
            photos = facebook.GraphAPI(album.owner.profile.access_token).request(str(album)+'/photos',args)
            for photo in photos['data']:
                pictures.append(photo['picture'])
                sources.append(photo['source'])
            res = dict(pictures=pictures,sources=sources,page=page,limit=limit,albums=len(albums))
        else: 
            args = {
                'offset': (int(page)-len(albums)-1)*int(limit),
                'limit': limit,
            }
            i = 0
            for staff in settings.STAFFS:
                photos = facebook.GraphAPI(request.user.profile.access_token).request(staff+'/photos',args)
                i=i+1
                index = 0
                for photo in photos['data']:
                    for tag in photo['tags']['data']:
                        banned = True if tag['id'] in settings.BANNED else False
                    if not banned:
                        pictures.insert(index,photo['picture'])
                        sources.insert(index,photo['source'])
                        index = index+i
                # person_index = person_index+1 if person_index+1<len(settings.STAFFS) else 0
            res = dict(pictures=pictures,sources=sources,page=page,limit=limit,albums=len(albums))
    return HttpResponse(utils._build_json(res),mimetype='application/json')

@login_required
def add_song(request):
    if request.user.username in settings.STAFFS:
        if request.method == 'POST':
            data = request.POST
            youtube_url = data.get('link')
            if(youtube_url.find('www.youtube.com/watch?v=')>=0):
                start = youtube_url.find('v=') + 2
                end = youtube_url.find('&',start-2)
                code = youtube_url[start:] if end<0 else youtube_url[start:end]
                # fetch youtube feed json data
                json_string = urllib.urlopen('http://gdata.youtube.com/feeds/api/videos/%s?v=2&alt=json' % code).read()
                json = utils._parse_json(json_string)
                s = Song(sid=code,owner=request.user,title=json['entry']['title']['$t'],activate=True)
                s.save()
                return HttpResponse(utils._build_json(dict(result=True,title=json['entry']['title']['$t'])),mimetype='application/javascript')
            return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')
    return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')

@login_required
def get_playlist(request):
    if request.user.username in settings.STAFFS:
        songs = Song.objects.filter(activate=True)
        playlist = []
        for song in songs:
            playlist.append(dict(name=str(song.owner.profile),uid=song.owner.username,id=song.pk,sid=song.sid,title=song.title,date=song.date_added.strftime("%b %d, %Y")))
        return HttpResponse(utils._build_json(dict(result=True,playlist=playlist)),mimetype='application/json')   
    return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json') 
@login_required
def remove_song(request,pk):
    if request.user.username in settings.STAFFS:
        song = Song.objects.get(pk=pk)
        song.activate = False
        song.save()
        return HttpResponse(utils._build_json(dict(result=True)),mimetype='application/json')
    return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')

@login_required
def add_message(request):
    if request.user.username in settings.STAFFS:
        if request.method == 'POST':
            user = request.user
            data = request.POST
            message = data.get('message')
            if message=='Add your message here...':
                return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')
            messageInstance = Message(owner=user,detail=message,activate=True)
            messageInstance.save()
            return HttpResponse(utils._build_json(dict(result=True)),mimetype='application/json')
    return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')

@login_required
def edit_message(request):
    if request.user.username in settings.STAFFS:
        if request.method == 'POST':
            user = request.user
            data = request.POST
            pk = data.get('id')
            message = data.get('message')
            messageInstance = Message.objects.get(pk=pk)
            messageInstance.detail = message
            messageInstance.date_updated = datetime.datetime.now()
            messageInstance.save()
            return HttpResponse(utils._build_json(dict(result=True)),mimetype='application/json')
    return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')

@login_required
def remove_message(request,pk):
    if request.user.username in settings.STAFFS:
        messageInstance = Message.objects.get(pk=pk)
        messageInstance.date_updated=datetime.datetime.now()
        messageInstance.activate=False
        messageInstance.save()
        return HttpResponse(utils._build_json(dict(result=True)),mimetype='application/json')
    return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')    

# RR_TOKEN=r'206785029334862|464b079189e2cf2d4fcaec44.1-502535747|ZqbHq1Apaw0xOVXXh9fvLydWpXQ'

@login_required
def list_message(request):
    # args={}
    # res = facebook.GraphAPI(RR_TOKEN).request('me/home',args)
    # messages = []
    # for message in res['data']:
    #     messages.append(dict(
    #         id=message['id'],
    #         uid=message['from']['id'],
    #         name=message['from']['name'],
    #         message='' if not 'message' in message else message['message'],
    #         date=message['created_time'],
    #         primary=True
    #     ))
    # return HttpResponse(utils._build_json(dict(messages=messages,count=len(res['data']))),mimetype='application/json')


    if request.user.username in settings.STAFFS:
        messageInstances = Message.objects.filter(activate=True)
        messages = []
        for messageInstance in messageInstances:
            messages.append(dict(
                id=messageInstance.pk,
                uid=messageInstance.owner.username,
                name=str(messageInstance.owner.profile),
                message=messageInstance.detail,
                date=messageInstance.date_added.strftime("%b %d, %Y - %H:%M:%S"),
                primary=True if request.user.username==messageInstance.owner.username else False 
                )
            )
        return HttpResponse(utils._build_json(dict(messages=messages,count=len(messageInstances))),mimetype='application/json')
    return HttpResponse(utils._build_json(dict(result=False)),mimetype='application/json')

@login_required
def add_album(request,aid):
    if request.user.username in settings.STAFFS:
        album = Album(owner=request.user,aid=aid)
        album.save();
        return HttpResponse(utils._build_json(dict(result=True)),mimetype='application/json')