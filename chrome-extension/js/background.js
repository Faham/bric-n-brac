
//==============================================================================

function onInstall() {
	console.log("Extension Installed");
}

//------------------------------------------------------------------------------

function onUpdate() {
	console.log("Extension Updated");
}

//------------------------------------------------------------------------------

ext_info = null

function getVersion() {
	ext_info = chrome.app.getDetails();
	chrome.management.get(ext_info.id, function(info) {
		ext_info.installType = info.installType
	})
	return ext_info.version;
}

//------------------------------------------------------------------------------

var currVersion = getVersion();
var prevVersion = localStorage['version']
if (currVersion != prevVersion) {
	if (typeof prevVersion == 'undefined')
		onInstall();
	else
		onUpdate();

	localStorage['version'] = currVersion;
}

//==============================================================================

target_url = document.URL

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(tab.id, {file:"js/overlay.js"});
	//chrome.tabs.create({
	//	'url': chrome.extension.getURL('html/screenshot.html'),
	//	'selected': true
	//}, function(tab2) {
	//	debugger
	//	chrome.tabs.executeScript(tab2.id, {file:chrome.extension.getURL("js/overlay.js")});
	//});
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if ('request-version' == request) {
		sendResponse(ext_info);
	}
});

//==============================================================================
