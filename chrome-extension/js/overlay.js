/*

bep functions:

	FB::variant systemCall(const FB::variant& msg);
	FB::variant getLogMessage(const FB::variant& msg);
	FB::variant getCalledCommand(const FB::variant& msg);
	FB::variant getSysCallResult(const FB::variant& msg);
	FB::variant selectBracFile(const FB::variant& msg);
	FB::variant saveToBracFile(const FB::variant& msg);
	FB::variant setExtensionPath(const FB::variant& msg);
	FB::variant getURLSnapShot(const FB::variant& msg);

*/

//==============================================================================

var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = Math.ceil( (3*input.length) / 4.0);
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);

		return ab;
	},

	decode: function(input, arrayBuffer) {
		//get last chars to see if are valid
		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-1));		 

		var bytes = Math.ceil( (3*input.length) / 4.0);
		if (lkey1 == 64) bytes--; //padding chars, so skip
		if (lkey2 == 64) bytes--; //padding chars, so skip

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}

		return uarray;	
	}
}		

//==============================================================================

var buttons_visible = false
var select_mode = 'lasso'; //'rect';
var m_selector = null;
var mask_layer = null;
var toolbar = null;
var m_canvas = null;
var m_context2d = null;
var regionButtonsEnabled = false;

//------------------------------------------------------------------------------

function getpoint (e) {
	if (e.pageX || e.pageY) { 
		x = e.pageX;
		y = e.pageY;
	}
	else { 
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return [x, y]
}

//------------------------------------------------------------------------------

$.fn.extend({
	regionSelector: function () {
		
		self = this;
		self.rects = [];
		self.lassoes = [];
		self.mode = 'lasso';
				
		self.clear = function () {
			self.rects = [];
			self.lassoes = [];
		};
		
		self.setMode = function (_mode) {
			self.mode = _mode;
			
			self.unbind('mousemove')
			self.unbind('mouseup')
			self.unbind('mousedown')
			
			if ('rect' == _mode) {
				self
				.mousedown(function (e) {
					if (e.which === 1 && !self.is(".running")) {
						var rect = [e.offsetX, e.offsetY, 0, 0];
						self.rects.push(rect);
						self.addClass("running");
						self.trigger("start", [[e.offsetX, e.offsetY]]);
					}
				})
				.mouseup(function (e) {
					if (e.which === 1 && self.is(".running")) {
						self.removeClass("running");
						rect = self.rects[self.rects.length - 1]
						self.updateBoundries([rect[0], rect[1]])
						self.updateBoundries([rect[0] + rect[2], rect[1] + rect[3]])
						self.trigger("done");
					}
				})
				.mousemove(function (e) {
					if (self.is(".running")) {
						var lastrect = self.rects[self.rects.length - 1];
						lastrect[2] = e.offsetX - lastrect[0];
						lastrect[3] = e.offsetY - lastrect[1];
						self.rects[self.rects.length - 1] = lastrect;
						self.trigger("update");
					}
				});
			} else if ('lasso' == _mode) {
				self
				.mousedown(function (e) {
					if (e.which === 1 && !self.is(".running")) {
						var point = [e.offsetX, e.offsetY];
						
						self.updateBoundries(point)
						self.addClass("running");
						self.lassoes.push([point]);
						self.trigger("start", [self.lassoes]);
					}
				})
				.mouseup(function (e) {
					if (e.which === 1 && self.is(".running")) {
						self.removeClass("running");
						var point = [e.offsetX, e.offsetY];
						self.updateBoundries(point)
						self.lassoes[self.lassoes.length - 1].push(point);
						self.trigger("done");
					}
				})
				.mousemove(function (e) {
					if (self.is(".running")) {
						var point = [e.offsetX, e.offsetY];
						
						self.updateBoundries(point)
						self.lassoes[self.lassoes.length - 1].push(point);
						self.trigger("update");
					}
				});
			}
		};
		
		self
		.updateBoundries = function (point) {
			if (self.region === undefined)
				self.region = {
					left  : point[0],
					top   : point[1],
					right : point[0],
					bottom: point[1],
					width : 0,
					height: 0
				}
			
			self.region.left   = Math.min(self.region.left,   point[0])
			self.region.top    = Math.min(self.region.top,    point[1])
			self.region.right  = Math.max(self.region.right,  point[0])
			self.region.bottom = Math.max(self.region.bottom, point[1])
			self.region.width  = Math.max(self.region.width,  self.region.right  - self.region.left)
			self.region.height = Math.max(self.region.height, self.region.bottom - self.region.top)
		};
		
		return self;
	}
});

//------------------------------------------------------------------------------

function fixPosition(e, gCanvasElement) {
    var x = e[0];
    var y = e[1];
    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;
    return {x: x, y:y};
}

//------------------------------------------------------------------------------

function unloadToolbar() {
	if (null != toolbar) {
		removeElement(toolbar);
		toolbar = null;
	}
}

//------------------------------------------------------------------------------

function loadToolbar() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('html/toolbar.html'), true);
	xhr.onreadystatechange = function() {
		if (this.readyState !== 4) return;
		if (this.status !== 200) return;

		toolbar = document.createElement('div');
		toolbar.setAttribute("id", "bab-toolbar");
		toolbar.style.zIndex = ++maxZIndex;
		toolbar.innerHTML = this.responseText;
		
		toolbar.querySelector('#rectangle img').src = chrome.extension.getURL("img/rectangle.png");
		toolbar.querySelector('#lasso img'    ).src = chrome.extension.getURL("img/lasso.png"    );
		toolbar.querySelector('#save img'     ).src = chrome.extension.getURL("img/save.png"     );
		toolbar.querySelector('#clear img'    ).src = chrome.extension.getURL("img/clear.png"    );
		toolbar.querySelector('#cancel img'   ).src = chrome.extension.getURL("img/cancel.png"   );

		btn_rect = toolbar.querySelector('#rectangle');
		btn_lasso = toolbar.querySelector('#lasso');
		btn_lasso.className = 'button-pushed';
			
		btn_rect.onclick = function () {
			btn_rect.className = 'button-pushed';
			btn_lasso.className = 'button';
			m_selector.setMode('rect');
		}

		btn_lasso.onclick = function () {
			btn_rect.className = 'button';
			btn_lasso.className = 'button-pushed';
			m_selector.setMode('lasso');
		}
				
		document.body.appendChild(toolbar);
	}
	xhr.send()
}

//------------------------------------------------------------------------------

function disableRegionButtons() {
	if (!regionButtonsEnabled)
		return;
		
	btn = toolbar.querySelector('#save');
	btn.className = 'button-disabled';
	btn.onclick = null;

	btn = toolbar.querySelector('#clear');
	btn.className = 'button-disabled';
	btn.onclick = null;
	
	btn = toolbar.querySelector('#cancel');
	btn.className = 'button-disabled';
	btn.onclick = null;
	
	regionButtonsEnabled = false;
}

//------------------------------------------------------------------------------

function enableRegionButtons() {

	if (regionButtonsEnabled)
		return;
	
	//-----------------------------------

	btn = toolbar.querySelector('#save');
	btn.className = 'button';
	btn.onclick = function () {
		reg = {
			'left'  : m_selector.region.left,
			'top'   : m_selector.region.top,
			'width' : m_selector.region.width,
			'height': m_selector.region.height
		}
			
		var _canvas = document.getElementById('bab-canvas');

		// cropping the canvas to selected region
		var ctx = _canvas.getContext('2d');
		mask_data = ctx.getImageData(reg.left, reg.top, reg.width, reg.height);
		_canvas.width = reg.width;
		_canvas.height = reg.height;
		ww = _canvas.width;
		wh = _canvas.height;
		ctx.clearRect(0, 0, ww, wh);
		ctx.putImageData(mask_data, 0, 0);
		
		mask_layer = _canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");
		cleanupRegionSelector();
		setupDialog(reg);

		m_canvas.style.cursor = "default";
		m_canvas.onmouseup = null;
		unloadToolbar();
	};
	
	//-----------------------------------
	
	btn = toolbar.querySelector('#clear');
	btn.className = 'button';
	btn.onclick = function () {
		var _canvas = document.getElementById('bab-canvas');
		ctx = _canvas.getContext('2d'),
		ctx.clearRect(0, 0, _canvas.width, _canvas.height);
		m_selector.clear();
		m_canvas.onmouseup = canvasMouseUp;
		m_canvas.style.cursor = "crosshair";
		disableRegionButtons();
	};
	
	//-----------------------------------

	btn = toolbar.querySelector('#cancel');
	btn.className = 'button';
	btn.onclick = function () {
		cleanupRegionSelector();
		m_canvas.style.cursor = "default";
		m_canvas.onmouseup = null;
		unloadToolbar();
	};

	//-----------------------------------
	
	regionButtonsEnabled = true;
}

//------------------------------------------------------------------------------

function setupRegionSelector() {

	//TODO: you should first take a screenshot from the page and show it in a new tab
	// then start the selecting.
	//$(function($){ $('#hplogo').Jcrop(); });
	//return

	//bep.getURLSnapShot(JSON.stringify({
	//	url: "http://www.google.ca",
	//	width: "1280",
	//	height: "768",
	//	dir: extension_path,
	//	filename: "url_snapshot.png"
	//}))

	if (m_canvas == null) {
		document.body.classList.add('bab-unselectable');
		m_canvas = document.createElement('canvas');
		m_canvas.setAttribute('id', 'bab-canvas');
		m_canvas.className = 'bab-unselectable';
		m_canvas.style.zIndex = ++maxZIndex;
		m_canvas.width = document.width
		m_canvas.height = document.height
		document.body.appendChild(m_canvas);
		m_context2d = m_canvas.getContext('2d'),
		m_context2d.fillStyle = '#000000';
		//m_context2d.lineWidth = 5;
		m_selector = $(m_canvas)
			.regionSelector()
			.on("start", function(e, point) {
				if (self.mode == 'rect') {
					m_context2d.moveTo(point[0], point[1]);
				} else if (self.mode == 'lasso') {
					m_context2d.moveTo(point[0], point[1]);
				}
			})
			.on("update", function(e) {
				m_context2d.clearRect(0, 0, m_canvas.width, m_canvas.height);
				for (var i = 0; i < self.rects.length; ++i) {
					var rect = self.rects[i];
					m_context2d.fillRect(rect[0], rect[1], rect[2], rect[3]);
				}

				for (var i = 0; i < self.lassoes.length; ++i) {
					m_context2d.beginPath();
					m_context2d.moveTo(self.lassoes[i][0][0], self.lassoes[i][0][1]);
					for (var j = 1; j < self.lassoes[i].length; ++j) {
						var pos = self.lassoes[i][j];
						m_context2d.lineTo(pos[0], pos[1]);
					}
					m_context2d.closePath();
					m_context2d.fill();
				}
			});
		m_selector.setMode('lasso');
	}

	m_canvas.style.cursor = "crosshair";
	m_canvas.onmouseup = canvasMouseUp;
};

//------------------------------------------------------------------------------

function removeElement(elm) {
	if (null == elm)
		return;

	//elm.style.display = 'none';
	elm.parentNode.removeChild(elm)
	delete elm;
}

//------------------------------------------------------------------------------

function cleanupRegionSelector() {
	removeElement(document.getElementById('bab-canvas'));
	document.body.classList.remove('bab-unselectable');
};

//------------------------------------------------------------------------------

function cleanupDialog() {
	dlg = document.getElementById('save-dialog');
	if (dlg)
		dlg.parentNode.removeChild(dlg)
	document.body.classList.remove('bab-unselectable');
}

//------------------------------------------------------------------------------

function getVersion(callback) {
	chrome.extension.sendMessage('request-version', callback);
}

//------------------------------------------------------------------------------

function getOS() {
	var os_name = "Unknown OS";
	if (navigator.appVersion.indexOf("Win")!=-1) os_name = "Windows";
	if (navigator.appVersion.indexOf("Mac")!=-1) os_name = "MacOS";
	if (navigator.appVersion.indexOf("X11")!=-1) os_name = "UNIX";
	if (navigator.appVersion.indexOf("Linux")!=-1) os_name = "Linux";
	return os_name;
}

//------------------------------------------------------------------------------

extension_path = '';
function setupBep() {
	bep = document.createElement('embed')
	bep.type = "application/x-bep"
	bep.id = 'plugin-bep'
	bep.className = 'plugin'
	document.body.appendChild(bep);
	
	getVersion(function (info) {
		extpath = '';
		if (info.installType != 'development') {
			extpath = info.id + '/' + info.version + '_0';

			if ('MacOS' == getOS())
				extpath = "/Users/%USER%/Library/Application\ Support/Google/Chrome/Default/Extensions/" + extpath
			else if ('Windows' == getOS())
				extpath = "%LOCALAPPDATA%/Google/Chrome/User Data/Default/Extensions/" + extpath
		} else {
			if ('MacOS' == getOS())
				extpath = "/Users/faham/development/bric-a-brac/chrome-extension"
			else if ('Windows' == getOS())
				extpath = "D:/faham/tim/bric-a-brac/chrome-extension"
		}
		
		console.log('extension path is: ' + extpath);
		
		bep.setExtensionPath(extpath);
		extension_path = extpath;
		bep.addEventListener("bracfileselect", onBracFileSelect, false);
		bep.addEventListener('cleanup', onDismissDialogCleanup, false);
	});
}

//------------------------------------------------------------------------------

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

//------------------------------------------------------------------------------

function setupIndicators() {
	dlg = document.getElementById("save-dialog");
	dlg.style.className = 'bab-unselectable';
	prv_box = dlg.querySelector('#preview-box');
	prv_box_wdh = prv_box.getBoundingClientRect().width;
	prv_box_hgh = prv_box.getBoundingClientRect().height;
	prv_box_pos = findPos(prv_box);
	brac_indc = dlg.querySelector('#brac-indicator');
	bric_indc = dlg.querySelector('#bric-indicator');
	bric_sizr = dlg.querySelector('#bric-sizer');
	
	res = dlg.querySelector("#brac_resolution").value.split(' ')

	brac_wdh = parseInt(res[0]);
	brac_hgh = parseInt(res[1]);

	brac_indc.querySelector('#inner-text').innerText = res[0] + ' x ' + res[1];
	mx = Math.max(brac_wdh, brac_hgh);
	mn = Math.min(brac_wdh, brac_hgh);

	brac_wdh = (brac_wdh == mx? prv_box_wdh: mn * prv_box_hgh / mx);
	brac_hgh = (brac_hgh == mx? prv_box_hgh: mn * prv_box_wdh / mx);

	bracIndicatorScale = brac_wdh / res[0];
	bricIndicatorScale = bracIndicatorScale
	
	brac_indc.style.width = brac_wdh + 'px';
	brac_indc.style.height = brac_hgh + 'px';
	brac_indc.style.left = (prv_box_wdh / 2.0 - brac_wdh / 2.0) + 'px';
	brac_indc.style.top = (prv_box_hgh / 2.0 - brac_hgh / 2.0) + 'px';
	
	res = dlg.querySelector("#bric_region").value.split(' ')

	bric_lft = parseInt(res[0]);
	bric_rgt = parseInt(res[1]);
	bric_wdh = parseInt(res[2]);
	bric_hgh = parseInt(res[3]);
	bricInitialWidthActual = bric_wdh;

	bric_indc.querySelector('#inner-text').innerText = res[2] + ' x ' + res[3];
	bricRatio = res[2] / res[3];
	mx = Math.max(bric_wdh, bric_hgh);
	mn = Math.min(bric_wdh, bric_hgh);
	
	if (bric_wdh == mx) {
		t = bric_wdh;
		bric_wdh = bricIndicatorScale * bric_wdh;
		bric_hgh = bric_hgh * bric_wdh / t
	} else if (bric_hgh == mx) {
		t = bric_hgh;
		bric_hgh = bricIndicatorScale * bric_hgh;
		bric_wdh = bric_wdh * bric_hgh / t
	}
	bricInitialWidth = bric_wdh;

	if (bric_wdh > brac_wdh) {
		bric_wdh = brac_wdh;
		bric_hgh = bric_wdh / bricRatio;
	}
	if (bric_hgh > brac_hgh) {
		bric_hgh = brac_hgh;
		bric_wdh = bric_hgh * bricRatio;
	}

	bric_indc.style.height = bric_hgh + 'px';
	bric_indc.style.width = bric_wdh + 'px';
	bric_indc.style.left = (brac_wdh / 2.0 - bric_wdh / 2.0) + 'px';
	bric_indc.style.top = (brac_hgh / 2.0 - bric_hgh / 2.0) + 'px';
	bric_indc.onmousedown = onBricMouseDown
	bric_indc.onmouseover = onBricMouseOver
	bric_indc.onmouseout = onBricMouseOut
	
	bric_sizr.style.width = '10px';
	bric_sizr.style.height = '10px';
	bric_sizr.onmousedown = onBricSizerMouseDown

	document.onmousemove = onDocumentMouseMove
	document.onmouseup = onDocumentMouseUp
	
	bracIndicator = dlg.querySelector('#brac-indicator');
	bricIndicator = dlg.querySelector('#bric-indicator');
	bricSizer = dlg.querySelector('#bric-sizer');
	bricScale.value = precisionRes(3, bricIndicatorScale);
	
	bricPosition.value = precisionRes(3, parseInt(bricIndicator.style.left) / bracIndicatorScale) 
		+ ' ' + precisionRes(3, parseInt(bricIndicator.style.top) / bracIndicatorScale);
		
	var _scl = precisionRes(3, parseInt(bricIndicator.style.width) / bricInitialWidth);
	bricScale.value = _scl + ' ' + _scl;
}

//------------------------------------------------------------------------------

bricIndicatorMoving = false;
bracIndicatorScale = 1.0;
bricIndicatorScale = 1.0
bricSizerMoving = false;
bricInitialWidth = 0.0;
bricInitialWidthActual = 0.0;
bricRatio = 0.0;
bricIndicator = null;
bracIndicator = null;
bricPosition = null;
bricSizer = null;
bricScale = null;

//------------------------------------------------------------------------------

function onBricSizerMouseDown(event) {
	bricSizerMoving = true;
	event.stopPropagation();
}

//------------------------------------------------------------------------------

function onBricMouseDown(event) {
	bricIndicatorMoving = true;
	event.stopPropagation();
}

//------------------------------------------------------------------------------

function precisionRes(res, num) {
	res = Math.pow(10, res)
	return Math.round(num * res) / res
}

//------------------------------------------------------------------------------

function onDocumentMouseMove(event) {
	if (bricIndicatorMoving) {
		new_x = parseInt(bricIndicator.style.left) + event.webkitMovementX;
		new_y = parseInt(bricIndicator.style.top) + event.webkitMovementY;
		
		if (new_x >= 0 
			&& new_x + parseInt(bricIndicator.style.width) <= parseInt(bracIndicator.style.width)
		)
			bricIndicator.style.left = new_x + 'px'
		if (new_y >= 0 
			&& new_y + parseInt(bricIndicator.style.height) <= parseInt(bracIndicator.style.height)
		)
			bricIndicator.style.top = new_y + 'px'

		bricPosition.value = precisionRes(3, parseInt(bricIndicator.style.left) / bracIndicatorScale) 
			+ ' ' + precisionRes(3, parseInt(bricIndicator.style.top) / bracIndicatorScale);
		
	} else if (bricSizerMoving) {
		new_w = parseInt(bricIndicator.style.width) + event.webkitMovementX;
		new_h = new_w / bricRatio
		if (new_w <= parseInt(bracIndicator.style.width) 
			&& new_w + parseInt(bricIndicator.style.left) <= parseInt(bracIndicator.style.width)
			&& new_h <= parseInt(bracIndicator.style.height) 
			&& new_h + parseInt(bricIndicator.style.top) <= parseInt(bracIndicator.style.height)
		) {
			bricIndicator.style.width = new_w + 'px';
			bricIndicator.style.height = new_h + 'px';
			scl = precisionRes(3, new_w / bricInitialWidth);
			bricScale.value = scl + ' ' + scl;
			bricIndicator.querySelector('#inner-text').innerText = 
				precisionRes(3, scl * bricInitialWidthActual) 
				+ ' x ' 
				+ precisionRes(3, scl * (bricInitialWidthActual / bricRatio));
		}
	}
}

//------------------------------------------------------------------------------

function onDocumentMouseUp() {
	bricIndicatorMoving = false;
	bricSizerMoving = false;
}

//------------------------------------------------------------------------------

function onBricMouseOver(event) {
	if (bricIndicator)
		bricIndicator.style.boxShadow = "0px 0px 10px 1px lightpink";
}

//------------------------------------------------------------------------------

function onBricMouseOut(event) {
	if (bricIndicator)
		bricIndicator.style.boxShadow = "";
}

//------------------------------------------------------------------------------

function removeWhitespace(node) {
    for (var i= node.childNodes.length; i-->0;) {
        var child= node.childNodes[i];
        if (child.nodeType===3 && child.data.match(/^\s*$/))
            node.removeChild(child);
        if (child.nodeType===1)
            removeWhitespace(child);
    }
}

//------------------------------------------------------------------------------

function onBracFileSelect(file_path, file_content) {
	parser = new window.DOMParser
	xml_content = parser.parseFromString(file_content, "text/xml")

	removeWhitespace(xml_content)
	brac = xml_content.documentElement

	dlg = document.getElementById("save-dialog")
	dlg.querySelector("#brac_filepath").innerHTML = file_path
	dlg.querySelector("#brac_name").value = brac.attributes.getNamedItem('name').nodeValue
	dlg.querySelector("#brac_artist").value = brac.attributes.getNamedItem('artist').nodeValue
	dlg.querySelector("#brac_version").value = brac.attributes.getNamedItem('version').nodeValue
	//dlg.querySelector("#brac_timeinterval").value = brac.attributes.getNamedItem('timeinterval').nodeValue
	dlg.querySelector("#brac_resolution").value = brac.attributes.getNamedItem('resolution').nodeValue
	//dlg.querySelector("#brac_dpi").value = brac.attributes.getNamedItem('dpi').nodeValue
	dlg.querySelector("#brac_tags").value = brac.attributes.getNamedItem('tags').nodeValue
    for (var i = brac.childNodes.length; i-- > 0;)
		if (brac.childNodes[i].nodeType === 3) {
			dlg.querySelector("#brac_comment").value = brac.childNodes[i].textContent.trim()
			break;
	}
	
	setupIndicators();

	for (n in brac.childNodes) {
		b = brac.childNodes[n];
		if (b.nodeType != 1 || !b.hasAttributes('tagName') 
			|| b.tagName != 'bric')
			continue; // not bric

		removeWhitespace(b)

		if (b.childNodes.length > 0 && b.childNodes[0].nodeType === 3)
			b.childNodes[0].textContent // bric comment
		b.attributes.getNamedItem('id').nodeValue
		b.attributes.getNamedItem('resolution').nodeValue
		b.attributes.getNamedItem('position').nodeValue
		b.attributes.getNamedItem('rotate').nodeValue
		b.attributes.getNamedItem('scale').nodeValue
		b.attributes.getNamedItem('order').nodeValue
		b.attributes.getNamedItem('alpha').nodeValue
		b.attributes.getNamedItem('revision').nodeValue
	}
}

//------------------------------------------------------------------------------

function setupDialog(region) {
	var dv = document.createElement('div');
	dv.setAttribute("id", "save-dialog");
	document.body.appendChild(dv);
	document.body.classList.add('bab-unselectable');

	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('html/save-dialog.html'), true);
	xhr.onreadystatechange = function() {
		if (this.readyState !== 4) return;
		if (this.status !== 200) return; // or whatever error handling you want
		dlg = document.getElementById('save-dialog');
		dlg.innerHTML = this.responseText;
		dlg.style.zIndex = ++maxZIndex;
		
		file = dlg.querySelector('#brac_file');
		file.onclick = function() {
			bep = document.getElementById('plugin-bep');
			bep.selectBracFile();
		};

		btn = dlg.querySelector('#brac_btn_apply');
		btn.onclick = SaveDialogBtnApplyOnClick;

		btn = dlg.querySelector('#brac_btn_cancel');
		btn.onclick = onDismissDialogCleanup;
		
		dlg.querySelector('#bric_title').value = document.location.hostname
		dlg.querySelector('#bric_time_interval').value = "01-00 00:00:00"
		dt = new Date();
		m = dt.getMonth() >= 10? dt.getMonth(): '0' + dt.getMonth();
		d = dt.getDate() >= 10? dt.getDate(): '0' + dt.getDate();
		
		if (region != null) dlg.querySelector('#bric_region').value = region.left + " " + region.top + " " + region.width + " " + region.height;
		else                dlg.querySelector('#bric_region').value = null;
		
		dlg.querySelector('#bric_start_data').value = dt.getFullYear() + '-' + m + '-' + d + ' ' + dt.toLocaleTimeString()
		dlg.querySelector('#bric_url'       ).value = document.URL
		dlg.querySelector('#bric_position'  ).value = '0.0 0.0';
		dlg.querySelector('#bric_rotation'  ).value = '0.0';
		dlg.querySelector('#bric_scale'     ).value = '1.0 1.0';
		dlg.querySelector('#bric_order'     ).value = '1';
		dlg.querySelector('#bric_alpha'     ).value = '1.0';
		dlg.querySelector('#bric_tags'      ).value = '';
		dlg.querySelector('#bric_comment'   ).value = '';
		
		bricPosition = dlg.querySelector('#bric_position');
		bricScale = dlg.querySelector('#bric_scale');
	};
	xhr.send();
};

//------------------------------------------------------------------------------

function getHighIndex(selector) {
    if (!selector) { selector = "*" };

    var elements = document.querySelectorAll(selector) ||
                   oXmlDom.documentElement.selectNodes(selector);
	var ret = 0;

    for (var i = 0; i < elements.length; ++i) {
		if (deepCss(elements[i],"position") === "static")
			continue;

		var temp = deepCss(elements[i], "z-index");
		if (temp != "auto")
			temp = parseInt(temp, 10) || 0;
		else
			continue;

		if (temp > ret)
			ret = temp;
    }
    return ret;
}

//------------------------------------------------------------------------------

function deepCss(who, css) {
    var sty, val, dv= document.defaultView || window;
    if (who.nodeType == 1) {
        sty = css.replace(/\-([a-z])/g, function(a, b){
            return b.toUpperCase();
        });
        val = who.style[sty];
        if (!val) {
            if(who.currentStyle) val= who.currentStyle[sty];
            else if (dv.getComputedStyle) {
                val= dv.getComputedStyle(who,"").getPropertyValue(css);
            }
        }
    }
    return val || "";
}

//------------------------------------------------------------------------------

function _arrayBufferToString(buf, callback) {
	var bb = new Blob([new Uint8Array(buf)]);
	var f = new FileReader();
	f.onload = function(e) {
		callback(e.target.result);
	};
	f.readAsText(bb);
}

//------------------------------------------------------------------------------

function SaveDialogBtnApplyOnClick() {

	var bric_res = dlg.querySelector('#bric_region').value.split(' ');
	var res = bric_res[2] + ' ' + bric_res[3];

	message = {
		brac: {
			filepath   : dlg.querySelector("#brac_filepath"  ).innerHTML,
			name       : dlg.querySelector("#brac_name"      ).value,
			artist     : dlg.querySelector("#brac_artist"    ).value,
			version    : dlg.querySelector("#brac_version"   ).value,
			resolution : dlg.querySelector("#brac_resolution").value,
			tags       : dlg.querySelector("#brac_tags"      ).value,
			comment    : dlg.querySelector("#brac_comment"   ).value
		},
		bric: {
			title        : dlg.querySelector('#bric_title'        ).value,
			timeInterval : dlg.querySelector('#bric_time_interval').value,
			startDate    : dlg.querySelector('#bric_start_data'   ).value,
			url          : dlg.querySelector('#bric_url'          ).value.replace('https://', 'http://'),
			region       : dlg.querySelector('#bric_region'       ).value,
			resolution   : res,
			position     : dlg.querySelector('#bric_position'     ).value,
			maskposition : dlg.querySelector('#bric_position'     ).value,
			rotation     : dlg.querySelector('#bric_rotation'     ).value,
			scale        : dlg.querySelector('#bric_scale'        ).value,
			order        : dlg.querySelector('#bric_order'        ).value,
			alpha        : dlg.querySelector('#bric_alpha'        ).value,
			tags         : dlg.querySelector('#bric_tags'         ).value,
			comment      : dlg.querySelector('#bric_comment'      ).value,
			mask_b64     : mask_layer
		}
	};

	bep = document.getElementById('plugin-bep');
	bep.saveToBracFile(JSON.stringify(message));
}

//------------------------------------------------------------------------------

function onDismissDialogCleanup() {
	cleanupDialog();
}
	
//------------------------------------------------------------------------------

function canvasMouseUp(e) {
	enableRegionButtons();
};

//------------------------------------------------------------------------------

setupBep();
maxZIndex = getHighIndex();
setupRegionSelector();
loadToolbar();

//------------------------------------------------------------------------------
