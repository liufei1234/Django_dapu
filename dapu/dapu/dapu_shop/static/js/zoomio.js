// Zoomio jQuery in-place Image Zoom script
// By Dynamic Drive: http://www.dynamicdrive.com

;(function($){
	var defaults = {fadeduration:500}
	var $zoomiocontainer
	var currentzoominfo = { $zoomimage:null, offset:[,], settings:null, multiplier:[,] }
	var ismobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) != null //boolean check for popular mobile browsers

	function getDimensions($target){
		return {w:$target.width(), h:$target.height()}
	}

	function getoffset(what, offsettype){ // custom get element offset from document (since jQuery version is whack in mobile browsers
		return (what.offsetParent)? what[offsettype]+getoffset(what.offsetParent, offsettype) : what[offsettype]
	}

	function zoomio($img, settings){ // zoomio plugin function
		var s = settings || defaults
		var trigger = ismobile? 'touchstart' : 'mouseenter'
		$img.off('touchstart mouseenter').on(trigger, function(e){ // on 'touchstart' or 'mouseenter'
			var jqueryevt = e // remember jQuery event object (for use to call e.stopPropagation())
			var e = jqueryevt.originalEvent.changedTouches? jqueryevt.originalEvent.changedTouches[0] : jqueryevt
			var offset = {left:getoffset($img.get(0), 'offsetLeft'), top:getoffset($img.get(0), 'offsetTop') }
			var mousecoord = [e.pageX - offset.left, e.pageY - offset.top]
			var $zoomimage
			var zoomdfd = $.Deferred()
			var imgdimensions = {imgw:null, imgh:null, zoomimgw:null, zoomimgh:null}
			$zoomiocontainer.html( '<img src="' + $img.attr('src') + '" />' ) // add image inside zoom container
			$zoomimage = $zoomiocontainer.find('img')
			if ($zoomimage.get(0).complete){
				zoomdfd.resolve()
			}
			else{
				$zoomimage.on('load', function(){
					zoomdfd.resolve()
				})
			}
			zoomdfd.done(function(){
				var imgdimensions = getDimensions($img)
				var containerwidth = s.w || imgdimensions.w
				var containerheight = s.h || imgdimensions.h
				$zoomiocontainer.css({width:containerwidth, height:containerheight, left:offset.left, top:offset.top}) // set zoom container dimensions and position
				var zoomiocontainerdimensions = getDimensions($zoomiocontainer)
				var zoomimgdimensions = getDimensions($zoomimage)
				$zoomiocontainer.stop().css({visibility:'visible', opacity:0}).animate({opacity:1}, s.fadeduration) // fade zoom container into view
				if (ismobile){ // scroll to point where user tapped on
					var scrollleftpos = (mousecoord[0] / imgdimensions.w) * (zoomimgdimensions.w - zoomiocontainerdimensions.w)
					var scrolltoppos = (mousecoord[1] / imgdimensions.h) * (zoomimgdimensions.h - zoomiocontainerdimensions.h)
					$zoomiocontainer.scrollLeft( scrollleftpos )
					$zoomiocontainer.scrollTop( scrolltoppos )
				}
				currentzoominfo = {$zoomimage:$zoomimage, offset:offset, settings:s, multiplier:[zoomimgdimensions.w/zoomiocontainerdimensions.w, zoomimgdimensions.h/zoomiocontainerdimensions.h]}
			})
			jqueryevt.stopPropagation() // stopPropagation() works on jquery evt object (versus jqueryevt.originalEvent.changedTouches[0]
		})		
	}

	$.fn.zoomio = function(options){ // set up jquery zoomio plugin
		var s = $.extend({}, defaults, options)

		return this.each(function(){ //return jQuery obj
			var $target = $(this)

			$target = ($target.is('img'))? $target : $target.find('img:eq(0)')
			if ($target.length == 0){
				return true
			}
			zoomio($target, s)
		}) // end return this.each

	}

	$(function(){ // on DOM load
		$zoomiocontainer = $('<div id="zoomiocontainer" />').appendTo(document.body)
		if (!ismobile){
			$zoomiocontainer.on('mousemove', function(e){
				var $zoomimage = currentzoominfo.$zoomimage
				var imgoffset = currentzoominfo.offset
				var mousecoord = [e.pageX-imgoffset.left, e.pageY-imgoffset.top]
				var multiplier = currentzoominfo.multiplier
				$zoomimage.css({left: -mousecoord[0] * multiplier[0] + mousecoord[0] , top: -mousecoord[1] * multiplier[1] + mousecoord[1]})
			})
			$zoomiocontainer.on('mouseleave', function(){
				$zoomiocontainer.stop().animate({opacity:0}, currentzoominfo.settings.fadeduration, function(){
					$(this).css({visibility:'hidden'})
				})
			})
		}
		else{ // is mobile
			$zoomiocontainer.addClass('mobileclass')
			$zoomiocontainer.on('touchstart', function(e){
				e.stopPropagation() // stopPropagation() works on jquery evt object (versus e.originalEvent.changedTouches[0]
			})
			$(document).on('touchstart', function(e){
				if (currentzoominfo.$zoomimage){ // if $zoomimage defined
					$zoomiocontainer.stop().animate({opacity:0}, currentzoominfo.settings.fadeduration, function(){
						$(this).css({visibility:'hidden'})
					})
				}
			})
		} // end else
	})

})(jQuery);


$(document).ready(function(){ 
	$('.biaot').on('click', function(e){ 
		var than = e.target;
		if(than.text == '商品详情'){
			$('.biaot1').show(100);
			$('.biaot2').hide(100);
			$('.biaot3').hide();
		}else if(than.text == '售后服务'){
			$('.biaot1').hide();
			$('.biaot2').show(100);
			$('.biaot3').hide();
		}else{
			$('.biaot1').hide();
			$('.biaot2').hide();
			$('.biaot3').show(100);
		}
	});
	// 数量
	$('.zhong1').on('click', function(){
		a = parseInt($('#qwe').val()) - 1;
		$('#qwe').val(a)
		if($('#qwe').val() < 1){
			$('#qwe').val('1')
		}
	});
	$('.zhong2').on('click', function(){
		a = parseInt($('#qwe').val()) + 1;
		$('#qwe').val(a)
	});
	if($(window).scrollTop() == 702){
		alert('1')
	}

	
	$(function(){ 
	setInterval (showTime, 100);
	function showTime()
	{
		if($(window).scrollTop() >= 709){
			$('.biaot').css('position', 'fixed');
			$('.biaot').css('left', '280px');
			$('.biaot').css('top', '0');
		}else if($(window).scrollTop() < 709){
			$('.biaot').css('position', 'static');
		}
	}
})
}); 