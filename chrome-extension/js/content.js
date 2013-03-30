
//==============================================================================

msg = {
	type : 'page-info',
	pageinfo : {
		scrollTop  : document.body.scrollTop,
		scrollLeft : document.body.scrollLeft,
		title      : document.title
	}
};

chrome.extension.sendMessage(msg)

//------------------------------------------------------------------------------
