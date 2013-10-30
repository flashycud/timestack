$(function(){
	var toggleMenu = function(){
		var $this=$(this);
		var $parent = $this.parent();
		if($parent.hasClass('closed')){
			$('div.menu',$parent.parent()[0]).each(function(){
				if(!$(this).hasClass('closed')){
					$('span:first-child',this).click();
				}
			});
			$parent.removeClass('closed').css('z-index',110);
			$parent.animate({
				'margin-top': 0
			},{
				duration: 300,
				queue: false,
				easing: 'swing'
			});
		}else{
			$('div.menu',$parent[0]).each(function(){
				if(!$(this).hasClass('closed')){
					$('span:first-child',this).click();
				}
			});
			$parent.addClass('closed').css('z-index',111);
			$parent.animate({
				'margin-top': -$parent.height()
			},{
				duration: 200,
				queue: false,
				easing: 'swing'
			});
		}
	}
	var $playlistButton = $('#playlist-button').click(toggleMenu);
	var $playlistPanel = $playlistButton.parent().css('margin-top',-$playlistButton.parent().height());
	var $addSongButton = $('#add-song-button').click(toggleMenu).css('left',$playlistButton.outerWidth()+5);
	var $addSongPanel = $addSongButton.parent().css('margin-top',-$addSongButton.parent().height());
	var $settingButton = $('#setting-button').click(toggleMenu).css('left',$playlistButton.outerWidth()+$addSongButton.outerWidth()+7);
	var $settingPanel = $settingButton.parent().css('margin-top',-$settingButton.parent().height());


	//playlist controller
	var $songHolder = $('#songHolder');
	var $songHolderParent = $songHolder.parent();
	var $playlistScroll = $('<div style="display:none;top:0;right:0;position:absolute;background-color:#FFF;width:2px;"></div>');;
	var playlistTimer = false;
	var playlistTop = 0;
	var loadPlaylist = function(){
		$.ajax({
			type: "GET",
			url: "/getplaylist/",
			dataType: "json",
			success: function(res){
				// console.log(res);
				$songHolder.html('');
				var playlist = res.playlist;
				for(var i=0;i<playlist.length;++i){
					$songHolder.append(
						'<div>'+
							'<a class="delete" href="/removesong/'+playlist[i].id+'/"><img title="Delete" style"padding:5px" src="'+media_url('img/cross.png')+'"/></a>'+
							'<img style="height:40px;vertical-align:middle;padding: 2px 10px;" src="https://graph.facebook.com/'+playlist[i].uid+'/picture" title="'+playlist[i].name+'"/>'+
							'<span><a target="_blank" href="http://www.youtube.com/watch?v='+playlist[i].sid+'">'+playlist[i].title+'</a></span>'+
							'<span style="font-size:10px;color:#999;padding:1px;position:absolute;top:0;right:0;">'+playlist[i].date+'</span>'+
						'</div>'
					);
				}
				$('div a.delete',$songHolder[0]).click(function(e){
					console.log('ajax remove');
					e.preventDefault();
					var $this = $(this);
					var $parent = $this.parent();
					$parent.append('<div style="position:absolute;top:0;width:100%;height:100%;background-color:#000;opacity:0.5;"></div>');
					$parent.append('<img style="position:absolute;left:50%;top:30%;" src="'+media_url('img/ajax-loader2.gif')+'"/>');
					$.ajax({
						type: "GET",
						url: $this.attr('href'),
						dataType: "json",
						success: function(remove_res){
							if(remove_res.result){
								console.log('success');
								$parent.fadeOut(function(){$(this).remove();setScrollPlaylist();});
							}
						}
					});
				});
				setScrollPlaylist();
				$songHolderParent.append($playlistScroll);
			}
		});
	};
	var setScrollPlaylist = function(){
		var playlistScrollHeight = ($songHolder.height() > $songHolderParent.height())?($songHolderParent.height()*$songHolderParent.height()/$songHolder.height())+'px':'100%';
		$playlistScroll.height(playlistScrollHeight);
	}
	var scrollPlaylist = function(event,delta){
		event.preventDefault();
		if($songHolder.height() > $songHolderParent.height()){
			playlistTop+=15*delta;
			if(playlistTop > 0)playlistTop=0;
			if(playlistTop < $songHolderParent.height()-$songHolder.height())
				playlistTop=$songHolderParent.height()-$songHolder.height();
			$songHolder.css('top',playlistTop);

			$playlistScroll.show().css('top',(-playlistTop)/$songHolder.height()*$songHolderParent.height());
			if(playlistTimer)
				playlistTimer = clearTimeout(playlistTimer);
			playlistTimer = setTimeout(function(){$playlistScroll.fadeOut();},500);
		}
	};
	$songHolder.parent().mousewheel(scrollPlaylist);
	loadPlaylist();


	//add song controller
	var $linkField = $('#link').focus(function(){
		var $this = $(this);
		if($this.attr('value')=='Paste YouTube Link Here...'){
			$this.attr('value','').removeClass('intro-textField');
		}
	}).blur(function(){
		var $this = $(this);
		if($this.attr('value')==''){
			$this.attr('value','Paste YouTube Link Here...').addClass('intro-textField');
		}
	});
	var $songAddForm = $('#songAddForm').submit(function(e){
		e.preventDefault();
		$status = $('.status',this).html('<img src="'+media_url('img/ajax-loader2.gif')+'"/>').show();
		var $target = $(e.target);
		$.ajax({
			type: "POST",
			url: "/addsong/",
			data: $target.serialize(),
			dataType: "json",
			success: function(res){
				console.log(res);
				if(res.result){
					$status.css('color','#08C400').html('complete,'+ res.title);
					loadPlaylist();
				}else{
					$status.css('color','#FF0000').html('fail');
				}
			}
		});
	});
	$('#cancelLink').click(function(){$addSongButton.click();});
});