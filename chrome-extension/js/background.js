
//==============================================================================

function onInstall() {
	console.log("Extension Installed");
}

//------------------------------------------------------------------------------

function onUpdate() {
	console.log("Extension Updated");
}

//------------------------------------------------------------------------------

ext_info = chrome.app.getDetails();
chrome.management.get(ext_info.id, function(info) {
	ext_info.installType = info.installType

	extpath = '';
	if (ext_info.installType != 'development') {
		extpath = ext_info.id + '/' + ext_info.version + '_0';

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
	
	ext_info.path = extpath;
})

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

var currVersion = ext_info.version;
var prevVersion = localStorage['version']
if (currVersion != prevVersion) {
	if (typeof prevVersion == 'undefined')
		onInstall();
	else
		onUpdate();

	localStorage['version'] = currVersion;
}

//==============================================================================

page_info = {};

chrome.browserAction.onClicked.addListener(function(tab) {
	//chrome.tabs.executeScript(tab.id, {file:"js/overlay.js"});
	page_info.url = tab.url.replace('https', 'http');
	page_info.title = tab.title;
	
	chrome.tabs.create({
		'url': chrome.extension.getURL('html/screenshot.html'),
		'selected': true
	}, function(tab2) {});
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if ('request-info' == request) {
		info = {
			'extension': ext_info,
			'page':      page_info
		}
		sendResponse(info);
	}
});

//==============================================================================
