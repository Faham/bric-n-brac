var _div = document.createElement('div');
_div.setAttribute("id", "overlay-bg");
_div.setAttribute("style", "position: fixed; top: 0; left: 0; height: 100%; width: 100%; background-color: black; opacity: 0.4; z-index: 10000; -moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; -o-user-select: none;");
document.body.appendChild(_div);

_div = document.createElement('div');
_div.setAttribute("id", "overlay-hl");
_div.setAttribute("style", "position: absolute; top: 0; left: 0; width: 0; height: 0; background-color: white; opacity: 0.4; display: none; z-index: 10002; -moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; -o-user-select: none;");
document.body.appendChild(_div);

_div = document.createElement('div');
_div.setAttribute("id", "cursor-info");
_div.setAttribute("style", "position: absolute; top: 0; left: 0; height: 20px; width: 100px; background-color: transparent; z-index: 10001; -moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; -o-user-select: none;");
document.body.appendChild(_div);

$('body').css({cursor: 'crosshair'});

var start_pos_x = 0;
var start_pos_y = 0;

$(document).mousedown(function(e) {
	e.preventDefault();

	if (!e) var e = window.event;
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	$('body').css({cursor: 'crosshair'});
	
	start_pos_x = e.pageX;
	start_pos_y = e.pageY;
	$('#overlay-hl').css({
		display: 'block',
		left: start_pos_x,
		top: start_pos_y,
		width: 0,
		height: 0
	});
	$('#cursor-info').css({
		display: 'block',
		left: start_pos_x + 10,
		top: start_pos_y + 15,
	});

	$(document).mousemove(function(e2) {
		e2.preventDefault();

		if (!e2) var e2 = window.event;
		e2.cancelBubble = true;
		if (e2.stopPropagation) e2.stopPropagation();
	
		var x1 = start_pos_x;
		var x2 = e2.pageX;
		
		if (x1 > x2) {
			var t = x1;
			x1 = x2;
			x2 = t;
		}
		var y1 = start_pos_y;
		var y2 = e2.pageY;

		if (y1 > y2) {
			var t = y1;
			y1 = y2;
			y2 = t;
		}
		
		$('#overlay-hl').css({
			left: x1,
			top: y1,
			width: x2 - x1,
			height: y2 - y1
		});

		$('#cursor-info').css({
			left: e2.pageX + 10,
			top: e2.pageY + 15
		}).html((x2 - x1) + ', ' + (y2 - y1));
	});
})

$(document).mouseup(function() {
	$(document).unbind('mousemove');
	
	$('#overlay-hl').css({
		display: 'none'
	});
	$('#cursor-info').css({
		display: 'none'
	});
	start_pos_x = 0;
	start_pos_y = 0;
});
