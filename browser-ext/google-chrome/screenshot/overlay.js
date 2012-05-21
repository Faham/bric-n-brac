var _div = document.createElement('div');
_div.setAttribute("id", "overlay-bg");
_div.setAttribute("style", "position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color: black; opacity: 0.4;");
document.body.appendChild(_div);

_div = document.createElement('div');
_div.setAttribute("id", "overlay-hl");
_div.setAttribute("style", "position: absolute; top: 0; left: 0; height: 0%; width: 0%; background-color: white; opacity: 0.4; display: none;");
document.body.appendChild(_div);

_div = document.createElement('div');
_div.setAttribute("id", "cursor-info");
_div.setAttribute("style", "position: absolute; top: 0; left: 0; height: 20px; width: 100px; background-color: transparent;");
document.body.appendChild(_div);

//function loadScript(url)
//{
//    // adding the script tag to the head as suggested before
//   var head = document.getElementsByTagName('head')[0];
//   var script = document.createElement('script');
//   script.type = 'text/javascript';
//   script.src = url;
//
//   // then bind the event to the callback function 
//   // there are several events for cross browser compatibility
//   //script.onreadystatechange = callback;
//   //script.onload = callback;
//
//   // fire the loading
//   head.appendChild(script);
//}
//
//loadScript("jquery-1.7.2.js");

var start_pos_x = 0;
var start_pos_y = 0;
//alert('test');

$(document).mousemove(function(e) {
	$('#cursor-info').css({
		left: e.pageX + 10,
		top: e.pageY + 30
	}).html((e.pageX - start_pos_x) + ', ' + (e.pageY - start_pos_y));
});

$('#overlay-bg').mousedown(function(e) {
	start_pos_x = e.pageX;
	start_pos_y = e.pageY;
	$('#overlay-hl').css({
		display: 'block',
		left: start_pos_x,
		top: start_pos_y,
		width: 0,
		height: 0
	});

	function onMouseMove(e2) {
		$('#overlay-hl').css({
			left: start_pos_x,
			top: start_pos_y,
			width: e2.pageX - start_pos_x,
			height: e2.pageY - start_pos_y
		});
	}
	
	$('#overlay-bg').mousemove(onMouseMove);
	$('#overlay-hl').mousemove(onMouseMove);
	$('#cursor-info').mousemove(onMouseMove);
})

$('#overlay-bg').mouseup(function() {
	$('#overlay-bg').unbind('mousemove');
	$('#overlay-hl').unbind('mousemove');
	$('#cursor-info').unbind('mousemove');
	
	$('#overlay-hl').css({
		display: 'none'
	});
	start_pos_x = 0;
	start_pos_y = 0;
});
