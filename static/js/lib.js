(function($){
  $.fn.onImagesLoaded = function(_cb,_ca) { 
    return this.each(function() {
      var $imgs = (this.tagName.toLowerCase()==='img')?$(this):$('img',this),
          _cont = this,
              i = 0,
      _loading=function() {
        if( typeof _cb === 'function') _cb(_cont);
      },
      _done=function() {
        if( typeof _ca === 'function' ) _ca(_cont);
      };
   
      if( $imgs.length ) {
        $imgs.each(function() {
          var _img = this;
          _loading();
          $(_img).load(function(){
            _done();
          });
        });
      }
    });
  }
})(jQuery)