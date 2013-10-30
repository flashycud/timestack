$(function(){
	//message controller
	$msgAdd = $('.add-message').mousewheel(function(e){e.stopPropagation();});
	$msg = $('#messageHolder');
	$msgParent = $msg.parent();
	var msgTop = $msgAdd.outerHeight(true);
	var msgScrollTimer = false, $msgScroll = $('<div style="display:none;left:0;position:absolute;background-color:#FFF;width:2px;"></div>');;
	var loadMessages = function(){
		$.ajax({
			type: "GET",
			url: "/getmessages/",
			dataType: "json",
			success: function(res){
				var messages = res.messages;
				for(var i=0;i<messages.length;++i){
					if(messages[i].primary){
						$msg.append(
							'<div class="msg" style="opacity:0.5;position:relative;">'+
								'<img class="sender" style="float:left;width:50px;vertical-align:middle;padding: 2px 10px;" src="https://graph.facebook.com/'+messages[i].uid+'/picture" title="'+messages[i].name+'"/>'+
								'<div style="top:20px;left:65px;position:absolute;width:0px;height:0px;border-right: 15px solid #000;border-top:10px solid transparent;border-bottom:10px solid transparent;"></div>'+
								'<div class="message-box" style="float:left;position:relative;width:80%;margin:5px;background-color:#000;color:#fff;overflow:hidden;"><div style="line-height: 20px;font-size:12px;padding:10px;padding-top:20px;">'+messages[i].message+'</div>'+
								'<span style="font-size:10px;color:#999;padding:2px;position:absolute;top:0;right:0;">'+messages[i].date+'</span></div>'+
								'<a style="position:absolute;left:80px;top:6px;" class="delete" href="/removemessage/'+messages[i].id+'/"><img title="Delete" style"padding:5px" src="'+media_url('img/cross.png')+'"/></a>'+
								'<div style="clear:both;"></div>'+
							'</div>'
						);
					}else{
						$msg.append(
							'<div class="msg" style="opacity:0.5;position:relative;">'+
								'<div class="message-box" style="float:left;position:relative;width:80%;margin:5px;background-color:#000;color:#fff;overflow:hidden;"><div style="line-height: 20px;font-size:12px;padding:10px;padding-top:20px;">'+messages[i].message+'</div>'+
								'<span style="font-size:10px;color:#999;padding:2px;position:absolute;top:0;right:0;">'+messages[i].date+'</span></div>'+
								'<div style="top:20px;right:72px;position:absolute;width:0px;height:0px;border-left: 15px solid #000;border-top:10px solid transparent;border-bottom:10px solid transparent;"></div>'+
								'<img class="sender" style="float:left;width:50px;vertical-align:middle;padding: 2px 10px;" src="https://graph.facebook.com/'+messages[i].uid+'/picture" title="'+messages[i].name+'"/>'+
								'<div style="clear:both;"></div>'+
							'</div>'
						);
					}
				}
				$('div.msg',$msg[0]).mouseover(function(){$(this).css('opacity',1);}).mouseout(function(){$(this).css('opacity',0.5);});
				$('div.msg a.delete',$msg[0]).click(function(e){
					console.log('ajax remove');
					e.preventDefault();
					var $this = $(this);
					var $parent = $this.parent();
					$parent.append('<div style="position:absolute;top:0;bottom:0;left:0;right:0;background-color:#000;opacity:0.5;"></div>');
					$parent.append('<img style="position:absolute;left:100px;top:6px;" src="'+media_url('img/ajax-loader2.gif')+'"/>');
					$.ajax({
						type: "GET",
						url: $this.attr('href'),
						dataType: "json",
						success: function(remove_res){
							if(remove_res.result){
								console.log('success');
								$parent.fadeOut(function(){$(this).remove();setScrollMessage();});
							}
						}
					});
				});
				setScrollMessage();
				$msgParent.append($msgScroll);
			}
		});		
	};
	var setScrollMessage = function(){
		var msgScrollHeight = ($msg.height() > $msgParent.height()-$msgAdd.outerHeight(true))? (($msgParent.height()-$msgAdd.outerHeight(true))*($msgParent.height()-$msgAdd.outerHeight(true))/$msg.height())+'px':'100%';
		$msgScroll.height(msgScrollHeight);
	}
	var scrollMessage = function(event,delta){
		event.preventDefault();
		if($msg.height() > $msgParent.height()-$msgAdd.outerHeight(true)){
			msgTop+=15*delta;
			if(msgTop > $msgAdd.outerHeight(true))msgTop=$msgAdd.outerHeight(true);
			if(msgTop < $msgParent.height()-$msg.height())
				msgTop=$msgParent .height()-$msg.height();
			$msg.css('top',msgTop);
			$msgScroll.show().css('top',$msgAdd.outerHeight(true)+($msgAdd.outerHeight(true)-msgTop)/$msg.height()*($msgParent.height()-$msgAdd.outerHeight(true)));
			if(msgScrollTimer)
				msgScrollTimer = clearTimeout(msgScrollTimer);
			msgScrollTimer = setTimeout(function(){$msgScroll.fadeOut();},500);
		}

	};

	$msgParent.mousewheel(scrollMessage);
	loadMessages();


	var $msgField = $('#msg').focus(function(){
		var $this = $(this);
		if($this.attr('value')=='Add your message here...'){
			$this.attr('value','').removeClass('intro-textField');
		}
	}).blur(function(){
		var $this = $(this);
		if($this.attr('value')==''){
			$this.attr('value','Add your message here...').addClass('intro-textField');
		}
	});

	var $msgAddForm = $('#msgAddForm').submit(function(e){
		e.preventDefault();
		$status = $('.status',this).html('<img src="'+media_url('img/ajax-loader2.gif')+'"/>').show();
		var $target = $(e.target);
		$.ajax({
			type: "POST",
			url: "/addmessage/",
			data: $target.serialize(),
			dataType: "json",
			success: function(res){
				console.log(res);
				if(res.result){
					$msgField.attr('value','Add your message here...').addClass('intro-textField');
					$status.css('color','#08C400').html('complete');
					$msg.html('');
					loadMessages();
				}else{
					$status.css('color','#FF0000').html('fail');
				}
			}
		});
	});
});