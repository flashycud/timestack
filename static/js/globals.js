
function initializeWebsite(){
	var navHolder = $('#navHolder').height($(window).height()-$('.header').outerHeight()-$('.main').outerHeight());
	var imgHolder = $('#imgHolder')
	Counter.initialize('counterHolder',4,5,2010);
	Counter.startCounter();

	Slideshow.initialize(imgHolder,navHolder,3000,3000,50000);
	
	$(window).resize(function(){
		navHolder.height($(window).height()-$('.header').outerHeight(true)-$('.main').outerHeight(true));
		// $('img.navigator').height($(window).height()-$('.header').outerHeight()-$('.main').outerHeight());
	});
}