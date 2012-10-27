
//------------------------------------------------------------------------------

var start_pos_x = 0;
var start_pos_y = 0;

//------------------------------------------------------------------------------

function setupRegionSelector() {
	var _div = document.createElement('div');
	_div.setAttribute("id", "overlay-bg");
	_div.style.zIndex = ++maxZIndex;
	document.body.appendChild(_div);

	var overlay_bg = _div
	overlay_bg.onmousedown = overlayBackgroundMouseDown;
	document.onmouseup = documentMouseUp;

	_div = document.createElement('div');
	_div.setAttribute("id", "overlay-hl");
	_div.style.zIndex = ++maxZIndex;
	document.body.appendChild(_div);
	var ov_hl = _div

	_div = document.createElement('div');
	_div.setAttribute("id", "cursor-info");
	_div.style.zIndex = ++maxZIndex;
	ov_hl.appendChild(_div);

	start_pos_x = 0;
	start_pos_y = 0;

	document.body.style.cursor = "crosshair";
};

//------------------------------------------------------------------------------

function removeElement(elm) {
	if (null == elm)
		return;

	elm.style.display = 'none';
	elm.parentNode.removeChild(elm)
	delete elm;
}

//------------------------------------------------------------------------------

function cleanupRegionSelector() {
	removeElement(document.getElementById('overlay-hl'));
	removeElement(document.getElementById('cursor-info'));
	
	start_pos_x = 0;
	start_pos_y = 0;
	
	removeButtons();
	
	document.body.style.cursor = "default";
};

//------------------------------------------------------------------------------

function cleanupDialog() {
	dlg = document.getElementById('save-dialog');
	if (dlg)
		dlg.parentNode.removeChild(dlg)
}

//------------------------------------------------------------------------------

function overlayBackgroundMouseDown(e) {
	e.preventDefault();

	//if (!e) var e = window.event;
	//e.cancelBubble = true;
	//if (e.stopPropagation) e.stopPropagation();
	//document.body.style.cursor = "crosshair";
	
	start_pos_x = e.pageX;
	start_pos_y = e.pageY;
	
	ov_hl = document.getElementById('overlay-hl');
	ov_hl.style.display = 'block';
	ov_hl.style.left = start_pos_x + 'px';
	ov_hl.style.top = start_pos_y + 'px';
	ov_hl.style.width = 0 + 'px';
	ov_hl.style.height = 0 + 'px';

	cur_info = document.getElementById('cursor-info');
	cur_info.style.display = 'block';

	document.onmousemove = function (e2) {
		e2.preventDefault();

		//if (!e2) var e2 = window.event;
		//e2.cancelBubble = true;
		//if (e2.stopPropagation) e2.stopPropagation();
	
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
		
		ov_hl = document.getElementById('overlay-hl');
		ov_hl.style.left = x1 + 'px';
		ov_hl.style.top = y1 + 'px';
		ov_hl.style.width = x2 - x1 + 'px';
		ov_hl.style.height = y2 - y1 + 'px';

		cur_info = document.getElementById('cursor-info');
		cur_info.textContent = 'X: ' + x1 + ', Y: ' + y1 + ', Width: ' + (x2 - x1) + ', Height: ' + (y2 - y1);
	}
}

//------------------------------------------------------------------------------

function createButton(id, text) {
	btn = document.createElement('botton');
	btn.setAttribute("id", id);
	btn.textContent = text;
	btn.className = 'overlay-botton';
	return btn;
};

//------------------------------------------------------------------------------

function removeButtons() {
	removeElement(document.getElementById('btn-save'));
	removeElement(document.getElementById('btn-change-region'));
	removeElement(document.getElementById('btn-cancel'));
};

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

function setupBep() {
	bep = document.createElement('embed')
	bep.type = "application/x-bep"
	bep.id = 'plugin-bep'
	bep.className = 'plugin'
	document.body.appendChild(bep);
	
	var version;

	getVersion(function (responce) { 
		version = responce.version; 
		extpath = chrome.extension.getURL('').split('/')[2] + '/' + version + '_0';

		if ('MacOS' == getOS())
			extpath = "/Users/%USER%/Library/Application\ Support/Google/Chrome/Default/Extensions/" + extpath
		else if ('Windows' == getOS())
			extpath = "%LOCALAPPDATA%/Google/Chrome/User Data/Default/Extensions/" + extpath

		extpath = "D:/faham/tim/bric-a-brac/chrome-extension"
		//extpath = "/Users/faham/development/bric-a-brac/chrome-extension"
		
		bep.setExtensionPath(extpath);
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
		bric_indc.style.width = bric_wdh + 'px';
		bric_indc.style.height = bric_hgh + 'px';
	} else if (bric_hgh == mx) {
		t = bric_hgh;
		bric_hgh = bricIndicatorScale * bric_hgh;
		bric_wdh = bric_wdh * bric_hgh / t
		bric_indc.style.height = bric_hgh + 'px';
		bric_indc.style.width = bric_wdh + 'px';
	}
	bricInitialWidth = bric_wdh;

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
		
	bricScale.value = precisionRes(3, parseInt(bricIndicator.style.width) / bricInitialWidth);
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
			bricScale.value = scl;
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

	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('html/save-dialog.html'), true);
	xhr.onreadystatechange= function() {
		if (this.readyState!==4) return;
		if (this.status!==200) return; // or whatever error handling you want
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
		dlg.querySelector('#bric_time_interval').value = "0000-00-07 00:00:00"
		dt = new Date();
		m = dt.getMonth() >= 10? dt.getMonth(): '0' + dt.getMonth();
		d = dt.getDate() >= 10? dt.getDate(): '0' + dt.getDate();
		dlg.querySelector('#bric_start_data').value = dt.getFullYear() + '-' + m + '-' + d + ' ' + dt.toLocaleTimeString()
		dlg.querySelector('#bric_url').value = document.URL
		dlg.querySelector('#bric_region').value = region.left + " " + region.top + " " + region.width + " " + region.height;
		dlg.querySelector('#bric_position').value = '0.0 0.0';
		dlg.querySelector('#bric_rotation').value = '0.0';
		dlg.querySelector('#bric_scale').value = '1.0';
		dlg.querySelector('#bric_order').value = '1';
		dlg.querySelector('#bric_alpha').value = '1.0';
		dlg.querySelector('#bric_tags').value = '';
		dlg.querySelector('#bric_comment').value = '';
		
		bricPosition = dlg.querySelector('#bric_position');
		bricScale = dlg.querySelector('#bric_scale');
	};
	xhr.send();
	setupBep();
};

//------------------------------------------------------------------------------

function BtnSaveOnClick() {
	msg = new Object();
	msg.url = document.URL;
	
	//ov_hl = document.getElementById('overlay-hl');
	//rec = ov_hl.getBoundingClientRect();
	//msg.region = new Object();
	//msg.region.top = ov_hl.offsetTop;
	//msg.region.height = rec.height;
	//msg.region.left = ov_hl.offsetLeft;
	//msg.region.width = rec.width;
	//chrome.extension.sendMessage('request-brac-file', function (response) {
	//	if (response)
	//		cleanUp();
	//});
	ov_hl = document.getElementById('overlay-hl');
	//reg = ov_hl.getBoundingClientRect()
	reg = {'left':ov_hl.offsetLeft, 'top':ov_hl.offsetTop, 'width':ov_hl.offsetWidth, 'height':ov_hl.offsetHeight}
	
	cleanupRegionSelector();

	setupDialog(reg);
};

//------------------------------------------------------------------------------

function BtnChangeRegionOnClick() {
	ov_hl = document.getElementById('overlay-hl');
	ov_hl.style.top = '0px';
	ov_hl.style.left = '0px';
	ov_hl.style.width = '0px';
	ov_hl.style.height = '0px';
	ov_hl.style.display = 'none';

	cur_info = document.getElementById('cursor-info');
	cur_info.value = '';
	cur_info.style.top = '0px';
	cur_info.style.left = '0px';
	cur_info.style.display = 'none';

	removeButtons();
	
	start_pos_x = 0;
	start_pos_y = 0;

	ov_bg = document.getElementById('overlay-bg');
	ov_bg.onmousedown = overlayBackgroundMouseDown;
	document.onmouseup = documentMouseUp;
	
	document.body.style.cursor = "crosshair";
};

//------------------------------------------------------------------------------

function BtnCancelOnClick() {
	cleanupRegionSelector();
	removeElement(document.getElementById('overlay-bg'));
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

function SaveDialogBtnApplyOnClick() {
	brac = {
		filepath     : dlg.querySelector("#brac_filepath").innerHTML
		, name       : dlg.querySelector("#brac_name").value
		, artist     : dlg.querySelector("#brac_artist").value
		, version    : dlg.querySelector("#brac_version").value
		, resolution : dlg.querySelector("#brac_resolution").value
		, tags       : dlg.querySelector("#brac_tags").value
		, comment    : dlg.querySelector("#brac_comment").value
	};
	
	res_arr = dlg.querySelector("#bric_region").value.split(' ')
	res = res_arr[2] + ' ' + res_arr[3];

	new_bric = {
		title          : dlg.querySelector('#bric_title').value
		, timeInterval : dlg.querySelector('#bric_time_interval').value
		, startDate    : dlg.querySelector('#bric_start_data').value
		, url          : dlg.querySelector('#bric_url').value.replace('https://', 'http://')
		, region       : dlg.querySelector('#bric_region').value
		, resolution   : res
		, position     : dlg.querySelector('#bric_position').value
		, rotation     : dlg.querySelector('#bric_rotation').value
		, scale        : dlg.querySelector('#bric_scale').value
		, order        : dlg.querySelector('#bric_order').value
		, alpha        : dlg.querySelector('#bric_alpha').value
		, tags         : dlg.querySelector('#bric_tags').value
		, comment      : dlg.querySelector('#bric_comment').value
	};

	message = {
		brac: brac
		, bric: new_bric
	};

	bep = document.getElementById('plugin-bep');
	bep.saveToBracFile(JSON.stringify(message));
}

//------------------------------------------------------------------------------

function onDismissDialogCleanup() {
	cleanupDialog();
	removeElement(document.getElementById('overlay-bg'));
}

//------------------------------------------------------------------------------

function showButtons() {
	ov_hl = document.getElementById('overlay-hl');
	ht_region = ov_hl.getBoundingClientRect();

	buttons_zindex = ++maxZIndex;
	
	btn = createButton('btn-save', 'Save')
	btn.style.top = ov_hl.offsetTop + ov_hl.offsetHeight + 5 + "px";
	btn.style.left = ht_region.left + "px";
	btn.style.zIndex = buttons_zindex;
	btn.onclick = BtnSaveOnClick
	document.body.appendChild(btn);

	var btn_save = btn;

	btn = createButton('btn-change-region', 'Change Region')
	btn.style.top = ov_hl.offsetTop + ov_hl.offsetHeight + 5 + "px";
	btn.style.left = btn_save.offsetLeft + btn_save.offsetWidth + 5 + "px";
	btn.style.zIndex = buttons_zindex;
	btn.onclick = BtnChangeRegionOnClick;
	document.body.appendChild(btn);

	var btn_change = btn;

	btn = createButton('btn-cancel', 'Cancel')
	btn.style.top = ov_hl.offsetTop + ov_hl.offsetHeight + 5 + "px";
	btn.style.left = btn_change.offsetLeft + btn_change.offsetWidth + 5 + "px";
	btn.style.zIndex = buttons_zindex;
	btn.onclick = BtnCancelOnClick;
	document.body.appendChild(btn);
};

//------------------------------------------------------------------------------

function documentMouseUp(e) {
	showButtons();
	ov_bg = document.getElementById('overlay-bg');
	ov_bg.onmousedown = null;
	document.onmousemove = null;
	document.onmouseup = null;
	document.body.style.cursor = "default";
	
	//file_io = document.createElement('embed')
	//file_io.type = "application/x-npapi-file-io"
	//file_io.id = 'npapi-file-io'
	//file_io.className = 'plugin';
	//document.body.appendChild(file_io);

};

//------------------------------------------------------------------------------

maxZIndex = getHighIndex();
setupRegionSelector();

//------------------------------------------------------------------------------
