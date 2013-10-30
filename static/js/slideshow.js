var Slideshow = {
	startFlag: false,
	holder: null,
	navHolder: null,
	navWidth: 0,
	navLeft:0,
	pictures: null,
	sources: null,
	fadeDelay: null,
	transitionDelay:null,
	slideDelay:null,
	loadedPictures:[],
	loadedSources:[],
	n: 0,
	id: 0,
	onShow: null,
	page: 1,
	limit: 10,
	person: 0,
	initialize: function(holder, navHolder, fadeDelay, transitionDelay, slideDelay) {
		this.holder=holder;
		this.navHolder=$('<div style="position:absolute;left:0;top:0;bottom:0;"></div>');
		navHolder.append(this.navHolder);
		// ss.pictures=pictures; 
		this.fadeDelay=fadeDelay;
		this.transitionDelay=transitionDelay;
		this.slideDelay=slideDelay;
		
		this.startSlideShow();
		this.createBar();

	},
	startSlideShow: function(){
		var ss = this;
		ss.attachImages();
		window.setInterval(function(){ss.attachImages();},ss.transitionDelay*20);
	},
	createBar: function(){
		var ss = this;
		var slideTimer = false;
		// ss.navHolder.mousemove(function(e){
		// 	var parentWidth = ss.navHolder.parent().width();
		// 	if(!slideTimer && e.clientX<0.3*parentWidth){
		// 		slideTimer = window.setInterval(function(){
		// 			ss.navLeft-=1;
		// 			if(ss.navLeft<parentWidth-ss.navWidth)
		// 				ss.navLeft=parentWidth-ss.navWidth;
		// 			ss.navHolder.css('left',ss.navLeft);
		// 		}, 1);
		// 	}else if(!slideTimer && e.clientX>=0.7*parentWidth){
		// 		slideTimer = window.setInterval(function(){
		// 			ss.navLeft+=1;
		// 			if(ss.navLeft>0)
		// 				ss.navLeft=0;
		// 			ss.navHolder.css('left',ss.navLeft);
		// 		}, 1);
		// 	}else if(slideTimer && e.clientX>=0.3*parentWidth && e.clientX<0.9*parentWidth){
		// 		slideTimer = window.clearInterval(slideTimer);
		// 	}
		// })
		// .mouseleave(function(){
		// 	slideTimer = window.clearInterval(slideTimer);
		// });
	},
	attachImages: function(){
		var openAttachImages = true;
		var ss = this;
		console.log('page:' + ss.page);
		$.ajax({
			type: "GET",
			url: "/getphotos/"+ss.page+"/"+ss.limit,
			dataType: "json",
			success: function(res){
				// ss.person = res.person;
				ss.pictures = res.pictures;
				ss.sources = res.sources;
				for(var i=0;i<ss.sources.length;++i){
					var sourceElement = $('<img/>');
					sourceElement.attr('src', ss.sources[i]);
					sourceElement.attr('class', 'slideshow hide');
					sourceElement.attr('id', 'img'+ ss.id);
					sourceElement.onImagesLoaded(null,function(_img){
						var hh=ss.holder.attr('clientHeight'),
					 		hw=ss.holder.attr('clientWidth');
						var scale = _img.width/_img.height;
						if(hh>=_img.height){
							_img.height=1.2*hh;
							_img.width=_img.height*scale;
						}
						if(hw>=_img.width){
							_img.width=1.2*hw;
							_img.height=_img.width/scale;
						}
				    	ss.loadedSources.push(_img);
				    	if(!ss.startFlag){
				    		ss.startFlag = true;
				    		ss.slide();
				    		$('#loading').fadeOut(ss.fadeDelay);
				    	}
				    });
					ss.holder.append(sourceElement);
					

					var imgElement = document.createElement('img');
					imgElement.src = ss.pictures[i];
					imgElement.className = 'navigator';
					imgElement.id = 'imgNav'+ ss.id++;
					imgElement.height = ss.navHolder.height();
					ss.navHolder.append(imgElement);
					$(imgElement)
						.onImagesLoaded(null,function(_img){
					    	ss.loadedPictures.push(_img);
					    	var $img = $(_img).css('height','100%');
					    	ss.navWidth += $img.outerWidth(true);
					    })
						.css({postion:'relative',opacity:0.25,'margin-top':5})
						.mouseover(function(){
							var $this=$(this)
							$this.css({
								opacity:1
							});
						})
						.mouseleave(function(){
							var $this=$(this)
							$this.css({
								opacity:0.25
							});
						});
				}
			}
		});
		++ss.page;

	},
	slide: function(){
		var ss = this;
		if(ss.n>=ss.loadedSources.length){
			ss.n=0;
			ss.navLeft=0;
			ss.navHolder.css('left',ss.navLeft);
		}
		// if(ss.n>=ss.loadedSources.length-2) 
			// ss.attachImages();
		if(ss.loadedSources.length>ss.n){
			var dh=ss.holder.attr('clientHeight')-$('#img'+ss.n).attr('height'),
				dw=ss.holder.attr('clientWidth')-$('#img'+ss.n).attr('width');
			if(ss.onShow != ss.n && dh<=0&&dw<=0){
				ss.onShow = ss.n;
				var sh=Math.random()*dh,
					sw=Math.random()*dw,
					eh=Math.round(Math.random())*dh,
					ew=Math.round(Math.random())*dw;
				$imgNav = $('#imgNav'+ss.n).css({opacity:1});
				$img = $('#img'+ss.n).css({top:sh, left:sw, position:'absolute', 'z-index': 2})
				.fadeIn(ss.fadeDelay,function(){
					var ci = this;
					setTimeout(function(){
						$(ci).fadeOut(ss.fadeDelay,function(){
							ss.onShow = ss.n+1;
							$prevImgNav = $imgNav.prev().animate({
								opacity: 0.25
							},{
								duration: ss.fadeDelay,
								queue: false,
								easing: 'linear'
							});
							ss.navLeft -= $prevImgNav.outerWidth(true);
							ss.navHolder.animate({
								left: ss.navLeft
							},{
								duration: ss.slideDelay/3,
								queue: false,
								easing: 'linear'
							});
						});
						ss.slide();
					},ss.transitionDelay);
				})
				.animate({
					top: eh,
					left: ew
				},{
					duration: ss.slideDelay,
					queue: false,
					easing: 'linear'
				});
				++ss.n;
			}else{
				if(dh>0||dw>0){
					console.log('got missing photo : '+ss.n);
					$('#img'+ss.n).attr('src',$('#img'+ss.n).attr('src'));
				}
				setTimeout(function(){ss.slide();},ss.transitionDelay);
			}

		}
	}
};
