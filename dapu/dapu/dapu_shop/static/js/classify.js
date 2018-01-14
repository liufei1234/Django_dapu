$(".choose").on("click", function(){
		// $(this).siblings().show().end().parent().siblings().children('.dapu').hide();
		$(this).next().slideToggle('hide');
	});