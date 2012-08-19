
//------------------------------------------------------------------------------

var start_pos_x = 0;
var start_pos_y = 0;

//------------------------------------------------------------------------------

function setupRegionSelector() {
	var _div = document.createElement('div');
	_div.setAttribute("id", "overlay-bg");
	document.body.appendChild(_div);
	var overlay_bg = _div
	overlay_bg.onmousedown = overlayBackgroundMouseDown;
	document.onmouseup = documentMouseUp;

	_div = document.createElement('div');
	_div.setAttribute("id", "overlay-hl");
	document.body.appendChild(_div);
	var ov_hl = _div

	_div = document.createElement('div');
	_div.setAttribute("id", "cursor-info");
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

function onFileClick() {
	bep = document.createElement('embed')
	bep.type = "application/x-bep"
	bep.id = 'plugin-bep'
	bep.className = 'plugin'
	document.body.appendChild(bep);
	bep.addEventListener("bracfileselect", onBracFileSelect, false);
	console.log(bep.selectBracFile());
}

//------------------------------------------------------------------------------

function setupIndicators() {
	prv_box = $('#preview-box')[0];
	prv_box_wdh = prv_box.getBoundingClientRect().width;
	prv_box_hgh = prv_box.getBoundingClientRect().height;
	brac_indc = $('#brac-indicator')[0];
	bric_indc = $('#bric-indicator')[0];
	
	res = $("#brac_resolution")[0].value.split(' ')

	brac_wdh = parseInt(res[0]);
	brac_hgh = parseInt(res[1]);

	debugger;
	brac_indc.innerText = res[0] + ' x ' + res[1];
	mx = Math.max(brac_wdh, brac_hgh);
	mn = Math.min(brac_wdh, brac_hgh);
	brac_indc.style.width = (brac_wdh == mx? prv_box_wdh: mn * prv_box_hgh / mx) + 'px';
	brac_indc.style.height = (brac_hgh == mx? prv_box_hgh: mn * prv_box_wdh / mx) + 'px';
	brac_indc.style.left = (prv_box_wdh / 2.0 - brac_indc.style.width / 2.0) + 'px';
	brac_indc.style.top = (prv_box_hgh / 2.0 - brac_indc.style.height / 2.0) + 'px';

	res = $("#bric_region")[0].value.split(' ')

	bric_lft = parseInt(res[0]);
	bric_rgt = parseInt(res[1]);
	bric_wdh = parseInt(res[2]);
	bric_hgh = parseInt(res[3]);

	//bric_indc.innerText = res[2] + ' x ' + res[3];
	//mx = Math.max(bric_wdh, bric_hgh);
	//mn = Math.min(bric_wdh, bric_hgh);
	//bric_indc.style.width = bric_wdh == mx? brac_wdh: mn * prv_box.style.height / mx;
	//bric_indc.style.height = bric_hgh == mx? brac_hgh: mn * prv_box.style.width / mx;
	//bric_indc.style.left = brac_wdh / 2 - bric_indc.style.width / 2
	//bric_indc.style.top = brac_hgh / 2 - bric_indc.style.height / 2
}

//------------------------------------------------------------------------------

function onBracFileSelect(file_path, file_content) {
	parser = new window.DOMParser
	xml_content = parser.parseFromString(file_content, "text/xml")

	brac = xml_content.documentElement
	$("#brac_filepath")[0].innerHTML = file_path
	$("#brac_name")[0].value = brac.attributes.getNamedItem('name').nodeValue
	$("#brac_artist")[0].value = brac.attributes.getNamedItem('artist').nodeValue
	$("#brac_version")[0].value = brac.attributes.getNamedItem('version').nodeValue
	//$("#brac_timeinterval")[0].value = brac.attributes.getNamedItem('timeinterval').nodeValue
	$("#brac_resolution")[0].value = brac.attributes.getNamedItem('resolution').nodeValue
	//$("#brac_dpi")[0].value = brac.attributes.getNamedItem('dpi').nodeValue
	$("#brac_tags")[0].value = brac.attributes.getNamedItem('tags').nodeValue
	$("#brac_comment")[0].value = brac.childNodes[0].textContent
	
	setupIndicators();

	for (n in brac.childNodes) {
		b = brac.childNodes[n];
		if (typeof(b) != "object" || !b.hasAttributes('tagName') 
			|| b.tagName != 'bric')
			continue; // not bric

		bric = brac.childNodes[n]

		bric.childNodes[0].textContent // bric comment
		bric.attributes.getNamedItem('id').nodeValue
		bric.attributes.getNamedItem('resolution').nodeValue
		bric.attributes.getNamedItem('position').nodeValue
		bric.attributes.getNamedItem('rotate').nodeValue
		bric.attributes.getNamedItem('scale').nodeValue
		bric.attributes.getNamedItem('order').nodeValue
		bric.attributes.getNamedItem('alpha').nodeValue
		bric.attributes.getNamedItem('revision').nodeValue
	}
}

//------------------------------------------------------------------------------

function setupDialog(region) {
	var dv = document.createElement('div');
	dv.setAttribute("id", "save-dialog");
	document.body.appendChild(dv);

	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL('js/save-dialog.html'), true);
	xhr.onreadystatechange= function() {
		if (this.readyState!==4) return;
		if (this.status!==200) return; // or whatever error handling you want
		dlg = document.querySelector('#save-dialog');
		dlg.innerHTML = this.responseText;
		
		file = dlg.querySelector('#brac_file');
		file.onclick = onFileClick;
		
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
		dlg.querySelector('#bric_scale').value = '1.0 1.0';
		dlg.querySelector('#bric_order').value = '1';
		dlg.querySelector('#bric_alpha').value = '1.0';
		dlg.querySelector('#bric_tags').value = '';
		dlg.querySelector('#bric_comment').value = '';
	};
	xhr.send();
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
	reg = ov_hl.getBoundingClientRect()
	reg = {'left':reg.left, 'top':reg.top, 'width':reg.right - reg.left, 'height':reg.bottom - reg.top}
	
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

function showButtons() {
	ov_hl = document.getElementById('overlay-hl');
	ht_region = ov_hl.getBoundingClientRect();

	btn = createButton('btn-save', 'Save')
	btn.style.top = ov_hl.offsetTop + ov_hl.offsetHeight + 5 + "px";
	btn.style.left = ht_region.left + "px";
	btn.onclick = BtnSaveOnClick
	document.body.appendChild(btn);

	var btn_save = btn;

	btn = createButton('btn-change-region', 'Change Region')
	btn.style.top = ov_hl.offsetTop + ov_hl.offsetHeight + 5 + "px";
	btn.style.left = btn_save.offsetLeft + btn_save.offsetWidth + 5 + "px";
	btn.onclick = BtnChangeRegionOnClick;
	document.body.appendChild(btn);

	var btn_change = btn;

	btn = createButton('btn-cancel', 'Cancel')
	btn.style.top = ov_hl.offsetTop + ov_hl.offsetHeight + 5 + "px";
	btn.style.left = btn_change.offsetLeft + btn_change.offsetWidth + 5 + "px";
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

setupRegionSelector();

//------------------------------------------------------------------------------
