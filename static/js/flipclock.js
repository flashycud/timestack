var flipclock = {
	dayofweek: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
	monthofyear: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
	init: function() {
		// set font size, is base on the height of bounds.
		var targetsize = Math.max($(".leaves").height() / 2, $(".leaves").width());
		var fontsize = Math.floor(targetsize * 0.80);
		var font = fontsize + "px 'arial'";	
		$(".leave-text").css("font", font);
		$(".leave-text").css("font-weight", 900);
		
		// relocate the number's position.
		var c = Math.floor(($(".leaves").height() / 2) - fontsize);
		var gap_top = fontsize * 0.05;
		var gap = fontsize * 0.08;
		$(".leave-inner-top").css("top", c + (fontsize / 2) - gap_top);
		$(".leave-inner-bottom").css("top", -(fontsize / 2) - gap);	
	},
	flipAnimationStart: function(t, command, delegate) {
		$(t).css("-webkit-animation", "none");
		$(t)[0].addEventListener("webkitAnimationEnd", delegate, false);
		window.setTimeout(function() {
			$(t).css("-webkit-animation", command);
		}, 0);
	},
	flip: function(t, n) {
		var now_top = $(t).find(".now-top");
		var now_bottom = $(t).find(".now-bottom");
		now_top.find(".leave-text").html(n);
		now_bottom.find(".leave-text").html(n);
		// var flip_top = $(t).find(".flip-top");
		// var flip_bottom = $(t).find(".flip-bottom");

		// // set previous time to flip-top-leave and show the leave for animation.
		// $(flip_top).find(".leave-text").html($(now_top).find(".leave-text").html());
		// $(flip_top).css("visibility", "visible");
		// // set current time to now-leave
		// $(now_top).find(".leave-text").html(n);
		
		// var bottomflipAnimationDidStop = function(e) {
		// 	$(flip_bottom)[0].removeEventListener("webkitAnimationEnd", bottomflipAnimationDidStop, false);
		// 	// set current time to now-bottom-leave.
		// 	$(now_bottom).find(".leave-text").html(n);
		// };
			
		// var topflipAnimationDidStop = function(e) {
		// 	$(flip_top)[0].removeEventListener("webkitAnimationEnd", topflipAnimationDidStop, false);
			
		// 	// hidding flip-top-leave when animation is endded.
		// 	$(flip_top).css("visibility", "hidden");

		// 	// WARNINNG. DON'T REMOVE.			
		// 	// hidding flip-bottom-leave for blink-proof in chrome. 
		// 	// this code creates a afterimage in safari
		// 	$(flip_bottom).css("visibility", "hidden");
			
		// 	$(flip_bottom).find(".leave-text").html(n);
		// 	flipclock.flipAnimationStart($(flip_bottom), "flip-down 0.5s 0 ease-out", bottomflipAnimationDidStop);
		// };
		
		// flipclock.flipAnimationStart($(flip_top), "flip-top 0.5s 0 linear", topflipAnimationDidStop);
	},
	date: function(l, dt) {
		console.log($(l).find(".leave-bottom").find(".datetime"));
		var t = $(l).find(".leave-bottom").find(".datetime").html(dt);
	},
	adjustHours: function(t) {
		return (t > 12) ? (t - 12) : ((t == 0) ? 12 : t) ;
	},
	adjustMinutes: function(t) {
		return (t < 10) ? t = "0" + t : t;
	},
	adjustDigit: function(t) {
		return (t < 10) ? t = "0" + t : t;
	},
	tick: function() {
		//var now = new Date();
		//var hour = flipclock.adjustHours(now.getHours());
		//var min = flipclock.adjustMinutes(now.getMinutes());
		//var sec = flipclock.adjustDigit(now.getSeconds());
		var hour = Counter.hourCount;
		var min = flipclock.adjustMinutes(Counter.minCount);
		var sec = flipclock.adjustDigit(Counter.secCount);
	
		if ($("#hh-leaves").find(".now-top").find(".leave-text").text() != hour.toString())  {
			flipclock.flip("#hh-leaves", hour);
			//var dt = flipclock.dayofweek[now.getDay()] + ", " + now.getDate() + " " + flipclock.monthofyear[now.getMonth()];
			var dt = "Year:"+Counter.yearCount+" Month:"+Counter.monthCount+" Day:"+Counter.dayCount;	
			flipclock.date("#hh-leaves", dt);
		}

		if ($("#mm-leaves").find(".now-top").find(".leave-text").text() != min) 
			flipclock.flip("#mm-leaves", min);

		flipclock.flip("#ss-leaves", sec);
	},
	start: function() {
		window.setInterval(flipclock.tick, 1000);
	},
	resize:function() {	
		$("#flipclock").css("top", document.getElementById('imgHolder').offsetHeight - $("#flipclock").height()-25);
		$("#flipclock").css("left", document.getElementById('imgHolder').offsetWidth - $("#flipclock").width()-50);
		// $("#flipclock").css("top", ((document.getElementById('imgHolder').offsetHeight - $("#flipclock").height()) / 2));
		// $("#flipclock").css("left", ((document.getElementById('imgHolder').offsetWidth - $("#flipclock").width()) / 2));
	}
};

$(document).ready(function() {
	flipclock.init();
	flipclock.start();
	flipclock.resize();
});

$(window).resize(function() {
	flipclock.resize();
});